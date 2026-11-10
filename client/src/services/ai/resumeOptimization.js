import { getChatCompletion } from "../puterClient";
import { parseAIJson, AIResponseParseError } from "../../utils/parseAIResponse.js";
import { validateAIOutput } from "../../utils/validateAIOutput";
import { optimizationResultSchema } from "../../schemas/aiSchemas";
import { JSON_ONLY_INSTRUCTION, TRUTHFULNESS_INSTRUCTION, buildStrictRetryPrompt } from "./promptUtils";

function buildPrompt({ resumeText, jobTitle, jobDescription, analysisSummary }) {
  return `You are an expert resume writer helping a candidate tailor their resume for a specific role.

${TRUTHFULNESS_INSTRUCTION}
Never invent metrics, numbers, or outcomes that are not already in the resume text. If a bullet could
be stronger with a metric, say so in "missingInfoRequests" and ask the user to supply the real number
instead of making one up.

TARGET JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
"""
${jobDescription}
"""

PRIOR ANALYSIS SUMMARY (for context): ${analysisSummary || "(none)"}

CURRENT RESUME TEXT:
"""
${resumeText}
"""

Produce: an improved professional summary, improved versions of the strongest existing bullet points
(with before/after and a short explanation of why the change helps), relevant keywords that are
genuinely supported by the resume, a suggested section ordering, and a list of missing information
the user should supply themselves (never fabricated).

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY these fields:
{
  "improvedSummary": string,
  "improvedBullets": [{ "original": string, "improved": string, "explanation": string }],
  "suggestedKeywords": string[],
  "suggestedSectionOrder": string[],
  "missingInfoRequests": string[]
}`;
}

export async function optimizeResume(input) {
  const prompt = buildPrompt(input);

  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(optimizationResultSchema, json);
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(optimizationResultSchema, json);
  }
}
