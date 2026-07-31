import { useRef, useState } from "react";
import { DownloadSimple, Moon, Sun, UploadSimple, Desktop, Trash } from "@phosphor-icons/react";
import { useSettings, applyTheme } from "../store/settings";
import { LANGUAGES, findLanguage } from "../lib/data/languages";
import { buildExportBundle, downloadBundle, downloadEncryptedBundle, importBundle, validateBundle } from "../lib/exportData";
import { decryptJson, encryptJson, isEncryptedBundle, type EncryptedBundleFile } from "../lib/crypto";
import { db } from "../lib/db";
import type { CEFRLevel } from "../lib/types";
import { Button, Field, Modal, Select, SectionTitle, Snackbar, TextInput, type SnackbarTone } from "../components/ui";
import { ProviderSetup } from "../components/ProviderSetup";
import { PrivacyBadge } from "../components/PrivacyBadge";

export default function Settings() {
  const settings = useSettings();
  const lang = findLanguage(settings.languageCode);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: SnackbarTone } | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPass, setExportPass] = useState("");
  const [pendingImport, setPendingImport] = useState<EncryptedBundleFile | null>(null);
  const [importPass, setImportPass] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  async function runExport() {
    const bundle = await buildExportBundle();
    if (exportPass.trim()) {
      const file = await encryptJson(JSON.stringify(bundle), exportPass);
      downloadEncryptedBundle(file, bundle.exportedAt);
      setNotice({
        text: "Encrypted backup downloaded. Without the passphrase it cannot be opened, including by us.",
        tone: "success",
      });
    } else {
      downloadBundle(bundle);
      setNotice({
        text: "Backup downloaded. Keep it somewhere safe; browser data can be cleared by the browser.",
        tone: "success",
      });
    }
    setExportOpen(false);
    setExportPass("");
  }

  async function onImportFile(file: File) {
    try {
      const raw: unknown = JSON.parse(await file.text());
      if (isEncryptedBundle(raw)) {
        setPendingImport(raw);
        setImportPass("");
        setImportError(null);
        return;
      }
      const res = await importBundle(validateBundle(raw));
      setNotice({ text: importSummary(res), tone: "success" });
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : "Import failed.", tone: "error" });
    }
  }

  /*
   * Import merges, so a re-import of the same file legitimately adds nothing.
   * Saying "0 sessions added" reads like a failure, so that case gets its own
   * sentence naming the reason.
   */
  function importSummary(res: { sessions: number; vocab: number }): string {
    if (res.sessions === 0 && res.vocab === 0) {
      return "Import finished. Everything in that backup was already here, so nothing changed.";
    }
    const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
    return `Import complete: ${n(res.sessions, "session", "sessions")} and ${n(res.vocab, "vocabulary card", "vocabulary cards")} added.`;
  }

  async function runEncryptedImport() {
    if (!pendingImport) return;
    try {
      const json = await decryptJson(pendingImport, importPass);
      const res = await importBundle(validateBundle(JSON.parse(json)));
      setPendingImport(null);
      setNotice({ text: importSummary(res), tone: "success" });
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed.");
    }
  }

  async function wipeAll() {
    await Promise.all([db.sessions.clear(), db.vocab.clear()]);
    setConfirmWipe(false);
    setNotice({ text: "All local history and vocabulary deleted.", tone: "success" });
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Settings</h1>

      {notice && <Snackbar message={notice.text} tone={notice.tone} onDismiss={() => setNotice(null)} />}

      <section className="mb-10" aria-labelledby="s-ai">
        <SectionTitle>AI provider</SectionTitle>
        <ProviderSetup />
      </section>

      <section className="mb-10" aria-labelledby="s-learning">
        <SectionTitle>Learning</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Language" htmlFor="set-lang">
            <Select
              id="set-lang"
              value={settings.languageCode}
              onChange={(e) => {
                const code = e.target.value;
                settings.setPartial({ languageCode: code, dialectId: findLanguage(code).dialects[0].id });
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Variety" htmlFor="set-dialect">
            <Select
              id="set-dialect"
              value={settings.dialectId}
              onChange={(e) => settings.setPartial({ dialectId: e.target.value })}
            >
              {lang.dialects.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                  {d.beta ? " (beta)" : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Level" htmlFor="set-level">
            <Select
              id="set-level"
              value={settings.level}
              onChange={(e) => settings.setPartial({ level: e.target.value as CEFRLevel })}
            >
              {(["A1", "A2", "B1", "B2", "C1"] as const).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section className="mb-10" aria-labelledby="s-appearance">
        <SectionTitle>Appearance</SectionTitle>
        <div className="flex gap-2" role="group" aria-label="Theme">
          {(
            [
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Desktop },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={settings.theme === id}
              onClick={() => {
                settings.setPartial({ theme: id });
                applyTheme(id);
              }}
              className={[
                "state-layer flex items-center gap-2 h-11 px-4 rounded-(--radius-control) border text-[14px] font-medium cursor-pointer transition-colors duration-150",
                settings.theme === id
                  ? "border-accent bg-accent-soft text-on-accent-soft"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong",
              ].join(" ")}
            >
              <Icon size={17} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10" aria-labelledby="s-data">
        <SectionTitle>Your data</SectionTitle>
        <p className="text-[14px] text-ink-muted leading-relaxed mb-4">
          Everything lives in this browser's storage. If you clear browser data, it's gone, so export a backup now and
          then. Import merges, it never overwrites.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" onClick={() => setExportOpen(true)}>
            <DownloadSimple size={17} aria-hidden />
            Export backup
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <UploadSimple size={17} aria-hidden />
            Import backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" onClick={() => setConfirmWipe(true)}>
            <Trash size={17} aria-hidden />
            Delete everything
          </Button>
        </div>
      </section>

      <PrivacyBadge />

      <Modal open={exportOpen} onClose={() => setExportOpen(false)} labelledBy="export-title">
        <h2 id="export-title" className="text-lg font-semibold">
          Export backup
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
          Add a passphrase to encrypt the file (AES-256). Leave it empty for a plain, human-readable JSON file.
        </p>
        <div className="mt-4">
          <Field
            label="Passphrase (optional)"
            htmlFor="export-pass"
            helper="If you set one, write it down. There is no reset; we couldn't open the file for you if we wanted to."
          >
            <TextInput
              id="export-pass"
              type="password"
              value={exportPass}
              onChange={(e) => setExportPass(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setExportOpen(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={runExport}>
            <DownloadSimple size={17} aria-hidden />
            Download
          </Button>
        </div>
      </Modal>

      <Modal open={pendingImport !== null} onClose={() => setPendingImport(null)} labelledBy="import-title">
        <h2 id="import-title" className="text-lg font-semibold">
          Encrypted backup
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
          This file is encrypted. Enter the passphrase you set when exporting it.
        </p>
        <div className="mt-4">
          <Field label="Passphrase" htmlFor="import-pass" error={importError ?? undefined}>
            <TextInput
              id="import-pass"
              type="password"
              value={importPass}
              onChange={(e) => setImportPass(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") runEncryptedImport();
              }}
            />
          </Field>
        </div>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setPendingImport(null)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={runEncryptedImport} disabled={!importPass}>
            Unlock and import
          </Button>
        </div>
      </Modal>

      <Modal open={confirmWipe} onClose={() => setConfirmWipe(false)} labelledBy="wipe-title">
        <h2 id="wipe-title" className="text-lg font-semibold">
          Delete all local data?
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
          This removes every session and vocabulary card from this browser. There is no server copy to restore from.
          Export a backup first if in doubt.
        </p>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmWipe(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={wipeAll}>
            Delete
          </Button>
        </div>
      </Modal>
    </main>
  );
}
