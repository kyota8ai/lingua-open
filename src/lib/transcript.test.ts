import { describe, expect, it } from "vitest";
import { normalizeTranscript } from "./transcript";

describe("normalizeTranscript", () => {
  it("removes the token spacing Gemini returns for Japanese", () => {
    expect(normalizeTranscript("まだ 決まっ て ない です 。")).toBe("まだ決まってないです。");
    expect(normalizeTranscript("間 です か ? こんにちは 。")).toBe("間ですか? こんにちは。");
  });

  it("collapses long chains, not just adjacent pairs", () => {
    expect(normalizeTranscript("私 は 日 本 語 を 勉 強 し て い ま す")).toBe("私は日本語を勉強しています");
  });

  it("leaves English untouched, including before punctuation", () => {
    expect(normalizeTranscript("I would like a coffee please")).toBe("I would like a coffee please");
    expect(normalizeTranscript("Really ? Yes .")).toBe("Really ? Yes .");
  });

  it("keeps spacing around Latin words embedded in Japanese", () => {
    expect(normalizeTranscript("私 は React が 好き")).toBe("私は React が好き");
  });

  it("leaves Arabic and other space-using scripts alone", () => {
    expect(normalizeTranscript("عايز قهوة باللبن")).toBe("عايز قهوة باللبن");
  });

  it("handles Chinese, Korean and full-width punctuation", () => {
    expect(normalizeTranscript("我 想 要 一 杯 咖啡")).toBe("我想要一杯咖啡");
    expect(normalizeTranscript("커피 한 잔 주세요")).toBe("커피한잔주세요");
    expect(normalizeTranscript("はい 、 そう です")).toBe("はい、そうです");
  });

  it("is a no-op for empty input", () => {
    expect(normalizeTranscript("")).toBe("");
  });
});
