export class AIValidationError extends Error {
  constructor(message, issues) {
    super(message);
    this.name = "AIValidationError";
    this.issues = issues;
  }
}

/**
 * Validates `data` against a zod schema. Never trust AI output directly —
 * this is the gate between parseAIResponse() and anything shown to the user
 * or sent to the backend for persistence.
 */
export function validateAIOutput(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AIValidationError(
      "The AI response did not match the expected structure.",
      result.error.issues
    );
  }
  return result.data;
}

/**
 * Runs an AI call + parse + validate pipeline, retrying once on failure by
 * re-invoking `callFn` with a stricter follow-up instruction appended.
 */
export async function withRetry(callFn, { retries = 1 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await callFn(attempt);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
