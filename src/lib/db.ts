import Dexie, { type EntityTable } from "dexie";
import type { SessionRecord, VocabCard } from "./types";

export const db = new Dexie("lingua-open") as Dexie & {
  sessions: EntityTable<SessionRecord, "id">;
  vocab: EntityTable<VocabCard, "id">;
};

db.version(1).stores({
  sessions: "++id, startedAt, languageCode, scenarioId",
  vocab: "++id, dueAt, languageCode, term",
});
