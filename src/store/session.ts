import { create } from "zustand";
import type { ProviderStatus } from "../lib/providers";
import type { TranscriptTurn } from "../lib/types";

interface SessionState {
  status: ProviderStatus;
  statusDetail?: string;
  turns: TranscriptTurn[];
  tasksDone: number[];
  startedAt: number | null;
  error: string | null;
  errorHint?: string;
  setStatus: (status: ProviderStatus, detail?: string) => void;
  upsertTurn: (turn: { id: string; role: "user" | "assistant"; text: string; final: boolean }) => void;
  toggleTask: (index: number) => void;
  setError: (message: string | null, hint?: string) => void;
  start: () => void;
  reset: () => void;
}

export const useSession = create<SessionState>((set) => ({
  status: "idle",
  turns: [],
  tasksDone: [],
  startedAt: null,
  error: null,
  setStatus: (status, detail) => set({ status, statusDetail: detail }),
  upsertTurn: (turn) =>
    set((s) => {
      const existing = s.turns.findIndex((t) => t.id === turn.id);
      const next: TranscriptTurn = {
        id: turn.id,
        role: turn.role,
        text: turn.text,
        pending: !turn.final,
        at: existing >= 0 ? s.turns[existing].at : Date.now(),
      };
      if (existing >= 0) {
        const turns = s.turns.slice();
        turns[existing] = next;
        return { turns };
      }
      return { turns: [...s.turns, next] };
    }),
  toggleTask: (index) =>
    set((s) => ({
      tasksDone: s.tasksDone.includes(index) ? s.tasksDone.filter((i) => i !== index) : [...s.tasksDone, index],
    })),
  setError: (message, hint) => set({ error: message, errorHint: hint }),
  start: () => set({ startedAt: Date.now(), turns: [], tasksDone: [], error: null, status: "connecting" }),
  reset: () => set({ status: "idle", turns: [], tasksDone: [], startedAt: null, error: null }),
}));
