export class AIResponseParseError extends Error {
  constructor(message, raw) {
    super(message);
    this.name = "AIResponseParseError";
    this.raw = raw;
  }
}

/**
 * Extracts a JSON object/array from raw AI text output. Handles:
 * - plain JSON
 * - ```json ... ``` or ``` ... ``` fenced blocks
 * - leading/trailing prose around the JSON payload
 */
export function parseAIJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new AIResponseParseError("The AI response was empty.", rawText);
  }

  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : rawText.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to slicing from the first `{` or `[` to the matching last `}` or `]`.
    const firstBrace = candidate.search(/[{[]/);
    const lastBrace = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const sliced = candidate.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sliced);
      } catch {
        // fall through to error below
      }
    }
    throw new AIResponseParseError("The AI response was not valid JSON.", rawText);
  }
}
