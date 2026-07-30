/**
 * Passphrase encryption for backup files (WebCrypto: PBKDF2-SHA256 +
 * AES-256-GCM). This is the client-side half of the future Pro sync:
 * whatever leaves the browser is ciphertext we could not read.
 */

export interface EncryptedBundleFile {
  app: "lingua-open";
  version: 1;
  encrypted: true;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
}

const ITERATIONS = 600_000;
/*
 * A backup file is untrusted input: someone can hand you one. The iteration
 * count has to be read from the file (older exports used fewer), but an
 * unbounded value would let a crafted file freeze the tab in deriveKey.
 */
const MIN_ITERATIONS = 100_000;
const MAX_ITERATIONS = 1_000_000;

export function isEncryptedBundle(raw: unknown): raw is EncryptedBundleFile {
  const b = raw as Partial<EncryptedBundleFile>;
  return (
    b?.app === "lingua-open" &&
    b.encrypted === true &&
    b.kdf === "PBKDF2-SHA256" &&
    typeof b.iterations === "number" &&
    Number.isInteger(b.iterations) &&
    b.iterations >= MIN_ITERATIONS &&
    b.iterations <= MAX_ITERATIONS &&
    typeof b.salt === "string" &&
    typeof b.iv === "string" &&
    typeof b.ciphertext === "string"
  );
}

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(json: string, passphrase: string): Promise<EncryptedBundleFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(json),
  );
  return {
    app: "lingua-open",
    version: 1,
    encrypted: true,
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptJson(file: EncryptedBundleFile, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase, fromBase64(file.salt), file.iterations);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(file.iv) as BufferSource },
      key,
      fromBase64(file.ciphertext) as BufferSource,
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error("Wrong passphrase, or the file is damaged.");
  }
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
