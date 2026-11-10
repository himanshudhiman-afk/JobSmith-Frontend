import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateAIOutput, AIValidationError } from "../utils/validateAIOutput";
import { analysisResultSchema } from "../schemas/aiSchemas";

describe("validateAIOutput", () => {
  it("returns parsed data when it matches the schema", () => {
    const schema = z.object({ name: z.string() });
    expect(validateAIOutput(schema, { name: "ok" })).toEqual({ name: "ok" });
  });

  it("throws AIValidationError when required fields are missing", () => {
    const schema = z.object({ name: z.string() });
    expect(() => validateAIOutput(schema, {})).toThrow(AIValidationError);
  });

  it("fills in defaults for the real analysis schema given a minimal object", () => {
    const result = validateAIOutput(analysisResultSchema, { overallMatchScore: 72 });
    expect(result.overallMatchScore).toBe(72);
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingOrUnclearSkills).toEqual([]);
  });

  it("rejects an out-of-range match score", () => {
    expect(() => validateAIOutput(analysisResultSchema, { overallMatchScore: 150 })).toThrow(
      AIValidationError
    );
  });
});
