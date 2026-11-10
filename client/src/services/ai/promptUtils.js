export const JSON_ONLY_INSTRUCTION =
  "Respond with ONLY a single valid JSON object. No markdown, no code fences, no commentary before or after the JSON.";

export const TRUTHFULNESS_INSTRUCTION =
  "Never invent degrees, employers, job titles, dates, certifications, projects, or quantified " +
  "achievements that are not present in the resume text. If something is not supported by the " +
  "resume, say so explicitly rather than guessing.";

export function buildStrictRetryPrompt(originalPrompt, previousRawText) {
  return (
    `${originalPrompt}\n\n` +
    "Your previous response could not be parsed as valid JSON matching the required schema. " +
    "Here is what you returned previously (for reference only, do not repeat its mistakes):\n" +
    `"""${previousRawText.slice(0, 1500)}"""\n\n` +
    "Try again. Respond with ONLY the JSON object, nothing else, and double-check every field name matches exactly."
  );
}
