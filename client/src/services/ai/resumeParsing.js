import { getChatCompletion } from "../puterClient";
import { parseAIJson, AIResponseParseError } from "../../utils/parseAIResponse.js";
import { validateAIOutput } from "../../utils/validateAIOutput";
import { resumeParseResultSchema } from "../../schemas/aiSchemas";
import { JSON_ONLY_INSTRUCTION, TRUTHFULNESS_INSTRUCTION, buildStrictRetryPrompt } from "./promptUtils";

function buildPrompt(resumeText) {
  return `You are a precise resume-parsing assistant. Read the raw resume text below and map every
fact it contains into the structured JSON columns described by the schema. This is extraction, not
writing — copy wording from the source rather than inventing new phrasing, and do not reorganize or
rewrite anything.

${TRUTHFULNESS_INSTRUCTION}
If a field is not present anywhere in the text, return it empty ("" or []) rather than guessing.
Do not merge separate jobs/projects/schools into one entry, and do not split one entry into several.
Preserve dates and bullet text as close to the original wording as possible.

RAW RESUME TEXT:
"""
${resumeText}
"""

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY these fields:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "links": [{ "label": string, "url": string }],
  "summary": string,
  "skills": string[],
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bullets": string[]
    }
  ],
  "education": [
    { "institution": string, "degree": string, "field": string, "startDate": string, "endDate": string }
  ],
  "projects": [
    { "name": string, "description": string, "bullets": string[], "technologies": string[], "url": string }
  ],
  "certifications": [{ "name": string, "issuer": string, "date": string }]
}`;
}

/**
 * Uses puter.ai.chat to map raw extracted resume text into the app's structured-content
 * columns (fullName, skills, experience[], education[], projects[], certifications[]…).
 * This replaces guesswork with an AI extraction pass, but the result is always shown to the
 * user for review in the resume editor before anything is saved — never auto-persisted here.
 */
export async function parseResumeWithAI(resumeText) {
  const prompt = buildPrompt(resumeText);

  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(resumeParseResultSchema, json);
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(resumeParseResultSchema, json);
  }
}
