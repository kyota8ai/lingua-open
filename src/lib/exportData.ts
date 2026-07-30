import { db } from "./db";
import type { ExportBundle, SessionRecord, VocabCard } from "./types";

export async function buildExportBundle(now = Date.now()): Promise<ExportBundle> {
  const [sessions, vocab] = await Promise.all([db.sessions.toArray(), db.vocab.toArray()]);
  return { app: "lingua-open", version: 1, exportedAt: now, sessions, vocab };
}

export function downloadBundle(bundle: ExportBundle) {
  downloadJson(JSON.stringify(bundle, null, 2), bundle.exportedAt, "backup");
}

export function downloadEncryptedBundle(file: unknown, exportedAt: number) {
  downloadJson(JSON.stringify(file), exportedAt, "backup-encrypted");
}

function downloadJson(content: string, exportedAt: number, suffix: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date(exportedAt).toISOString().slice(0, 10);
  a.href = url;
  a.download = `lingua-open-${suffix}-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Returns a cleaned SessionRecord, or null if the record is not usable. */
function sanitizeSession(raw: unknown): SessionRecord | null {
  const s = raw as Partial<SessionRecord>;
  if (!s || !isNum(s.startedAt) || !isNum(s.endedAt) || !isStr(s.languageCode) || !isStr(s.dialectId)) return null;
  if (!Array.isArray(s.transcript)) return null;
  const transcript = s.transcript
    .filter((t) => t && isStr(t.text) && (t.role === "user" || t.role === "assistant"))
    .map((t, i) => ({ id: isStr(t.id) ? t.id : `imported-${i}`, role: t.role, text: t.text, at: isNum(t.at) ? t.at : s.startedAt! }));
  const fb = s.feedback;
  const feedback =
    fb && isStr(fb.summary) && Array.isArray(fb.corrections) && Array.isArray(fb.vocab)
      ? {
          summary: fb.summary,
          corrections: fb.corrections.filter((c) => c && isStr(c.said) && isStr(c.better)).map((c) => ({ said: c.said, better: c.better, why: isStr(c.why) ? c.why : "" })),
          vocab: fb.vocab.filter((v) => v && isStr(v.term) && isStr(v.meaning)),
          generatedAt: isNum(fb.generatedAt) ? fb.generatedAt : s.endedAt!,
        }
      : null;
  return {
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    provider: s.provider === "openai" || s.provider === "gemini" ? s.provider : "demo",
    languageCode: s.languageCode,
    dialectId: s.dialectId,
    scenarioId: isStr(s.scenarioId) ? s.scenarioId : null,
    transcript,
    tasksDone: Array.isArray(s.tasksDone) ? s.tasksDone.filter(isNum) : [],
    feedback,
  };
}

/** Returns a cleaned VocabCard, or null if the record is not usable. */
function sanitizeVocab(raw: unknown): VocabCard | null {
  const v = raw as Partial<VocabCard>;
  if (!v || !isStr(v.term) || !isStr(v.meaning) || !isStr(v.languageCode)) return null;
  return {
    term: v.term,
    meaning: v.meaning,
    languageCode: v.languageCode,
    reading: isStr(v.reading) ? v.reading : undefined,
    example: isStr(v.example) ? v.example : undefined,
    addedAt: isNum(v.addedAt) ? v.addedAt : Date.now(),
    interval: isNum(v.interval) && v.interval >= 0 ? v.interval : 0,
    ease: isNum(v.ease) && v.ease >= 1.3 ? v.ease : 2.5,
    reps: isNum(v.reps) && v.reps >= 0 ? Math.floor(v.reps) : 0,
    dueAt: isNum(v.dueAt) ? v.dueAt : Date.now(),
  };
}

export function validateBundle(raw: unknown): ExportBundle {
  const b = raw as Partial<ExportBundle>;
  if (b?.app !== "lingua-open" || b.version !== 1 || !Array.isArray(b.sessions) || !Array.isArray(b.vocab)) {
    throw new Error("This file is not a lingua-open backup.");
  }
  return b as ExportBundle;
}

/**
 * Merge-import: every record is re-validated field by field (the file is
 * untrusted input) and records that already exist (same startedAt /
 * term+language) are skipped.
 */
export async function importBundle(bundle: ExportBundle): Promise<{ sessions: number; vocab: number }> {
  const existingSessions = await db.sessions.toArray();
  const existingVocab = await db.vocab.toArray();
  const haveSession = new Set(existingSessions.map((s) => s.startedAt));
  const haveVocab = new Set(existingVocab.map((v) => `${v.languageCode}:${v.term}`));

  const newSessions = bundle.sessions
    .map(sanitizeSession)
    .filter((s): s is SessionRecord => s !== null && !haveSession.has(s.startedAt));
  const newVocab = bundle.vocab
    .map(sanitizeVocab)
    .filter((v): v is VocabCard => v !== null && !haveVocab.has(`${v.languageCode}:${v.term}`));

  await db.transaction("rw", db.sessions, db.vocab, async () => {
    if (newSessions.length) await db.sessions.bulkAdd(newSessions);
    if (newVocab.length) await db.vocab.bulkAdd(newVocab);
  });
  return { sessions: newSessions.length, vocab: newVocab.length };
}
