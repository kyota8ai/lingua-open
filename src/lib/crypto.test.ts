import { describe, expect, it } from "vitest";
import { decryptJson, encryptJson, isEncryptedBundle } from "./crypto";

describe("backup encryption", () => {
  it("roundtrips JSON with the right passphrase", async () => {
    const json = JSON.stringify({ hello: "قهوة", n: 42 });
    const file = await encryptJson(json, "correct horse battery");
    expect(isEncryptedBundle(file)).toBe(true);
    expect(file.ciphertext).not.toContain("قهوة");
    const out = await decryptJson(file, "correct horse battery");
    expect(out).toBe(json);
  });

  it("rejects a wrong passphrase with a readable error", async () => {
    const file = await encryptJson("{}", "right");
    await expect(decryptJson(file, "wrong")).rejects.toThrow(/passphrase/i);
  });

  it("uses a fresh salt and iv per file", async () => {
    const a = await encryptJson("{}", "p");
    const b = await encryptJson("{}", "p");
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it("does not recognize plain bundles as encrypted", () => {
    expect(isEncryptedBundle({ app: "lingua-open", version: 1, sessions: [], vocab: [] })).toBe(false);
  });

  it("rejects an absurd iteration count so a crafted file cannot freeze the tab", async () => {
    const file = await encryptJson("{}", "p");
    expect(isEncryptedBundle({ ...file, iterations: 4_000_000_000 })).toBe(false);
    expect(isEncryptedBundle({ ...file, iterations: 10 })).toBe(false);
    expect(isEncryptedBundle({ ...file, iterations: 1.5 })).toBe(false);
    expect(isEncryptedBundle(file)).toBe(true);
  });
});
