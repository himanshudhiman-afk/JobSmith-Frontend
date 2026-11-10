import { describe, it, expect } from "vitest";
import { parseAIJson, AIResponseParseError } from "../utils/parseAIResponse";

describe("parseAIJson", () => {
  it("parses plain JSON", () => {
    expect(parseAIJson('{"a": 1}')).toEqual({ a: 1 });
  });

  it("parses JSON inside a markdown code fence", () => {
    const raw = "Here you go:\n```json\n{\"a\": 1, \"b\": [1,2]}\n```\nHope that helps!";
    expect(parseAIJson(raw)).toEqual({ a: 1, b: [1, 2] });
  });

  it("parses JSON inside an unlabeled code fence", () => {
    const raw = "```\n{\"ok\": true}\n```";
    expect(parseAIJson(raw)).toEqual({ ok: true });
  });

  it("slices out JSON surrounded by prose", () => {
    const raw = 'Sure, the result is {"score": 42} as requested.';
    expect(parseAIJson(raw)).toEqual({ score: 42 });
  });

  it("throws AIResponseParseError on unparsable text", () => {
    expect(() => parseAIJson("not json at all")).toThrow(AIResponseParseError);
  });

  it("throws AIResponseParseError on empty input", () => {
    expect(() => parseAIJson("")).toThrow(AIResponseParseError);
  });
});
