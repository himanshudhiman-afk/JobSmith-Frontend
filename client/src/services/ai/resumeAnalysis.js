import { getChatCompletion } from "../puterClient";
import { parseAIJson, AIResponseParseError } from "../../utils/parseAIResponse.js";
import { validateAIOutput } from "../../utils/validateAIOutput";
import { analysisResultSchema } from "../../schemas/aiSchemas";
import { JSON_ONLY_INSTRUCTION, TRUTHFULNESS_INSTRUCTION, buildStrictRetryPrompt } from "./promptUtils";

function buildPrompt({ resumeText, jobTitle, companyName, jobDescription }) {
  return `You are an expert technical recruiter and resume analyst.

${TRUTHFULNESS_INSTRUCTION}

TASK: Compare the candidate's resume against the target job and produce a structured, evidence-based
compatibility analysis. The "overallMatchScore" is YOUR estimate only — it is not a real ATS score and
not a hiring prediction. Only list a skill in "matchedSkills" if the resume text provides real evidence
for it; otherwise place it in "missingOrUnclearSkills" (this means "not demonstrated", not "candidate
lacks it" — be careful with that distinction in your "summary").

JOB TITLE: ${jobTitle}
COMPANY: ${companyName || "(not provided)"}

JOB DESCRIPTION:
"""
${jobDescription}
"""

RESUME TEXT:
"""
${resumeText}
"""

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY these fields:
{
  "overallMatchScore": number (0-100),
  "matchedSkills": string[],
  "missingOrUnclearSkills": string[],
  "evidence": [{ "skillOrClaim": string, "resumeExcerpt": string }],
  "experienceAlignment": string,
  "educationAlignment": string,
  "keywordCoverage": [{ "keyword": string, "covered": boolean }],
  "strengths": string[],
  "improvementAreas": string[],
  "recommendations": string[],
  "interviewTopics": string[],
  "summary": string
}`;
}

export async function analyzeResumeAgainstJob(input) {
  const prompt = buildPrompt(input);

  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(analysisResultSchema, json);
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(analysisResultSchema, json);
  }
}
