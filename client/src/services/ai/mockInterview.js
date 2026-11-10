import { getChatCompletion } from "../puterClient";
import { parseAIJson, AIResponseParseError } from "../../utils/parseAIResponse.js";
import { validateAIOutput } from "../../utils/validateAIOutput";
import {
  mockInterviewQuestionSchema,
  mockInterviewFeedbackSchema,
  mockInterviewFinalReportSchema
} from "../../schemas/aiSchemas";
import { JSON_ONLY_INSTRUCTION, buildStrictRetryPrompt } from "./promptUtils";

async function runJsonPrompt(prompt, schema) {
  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(schema, json);
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(schema, json);
  }
}

export async function generateFirstQuestion({ jobTitle, category, resumeText }) {
  const prompt = `You are conducting a live mock interview for the role "${jobTitle}".
Interview category focus: ${category}.

CANDIDATE RESUME (for context, do not quote it back verbatim):
"""
${resumeText}
"""

Ask ONE opening interview question appropriate for this category and role.

${JSON_ONLY_INSTRUCTION}
Return: { "questionText": string, "category": string }`;

  return runJsonPrompt(prompt, mockInterviewQuestionSchema);
}

export async function evaluateAnswer({ jobTitle, questionText, answer, category }) {
  const prompt = `You are an interview coach evaluating a candidate's spoken/written answer during a
mock interview for "${jobTitle}".

QUESTION (${category}): ${questionText}
CANDIDATE'S ANSWER:
"""
${answer}
"""

Evaluate the answer honestly and constructively. Scores are AI-generated PRACTICE feedback, not an
objective hiring assessment — keep that framing in mind and do not overstate certainty.

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY this shape:
{
  "technicalCorrectness": number (0-100),
  "completeness": number (0-100),
  "clarity": number (0-100),
  "relevance": number (0-100),
  "communicationQuality": number (0-100),
  "suggestedImprovements": string[],
  "followUpQuestion": string,
  "score": number (0-100)
}`;

  return runJsonPrompt(prompt, mockInterviewFeedbackSchema);
}

export async function generateNextQuestion({ jobTitle, category, previousQuestion, previousAnswer, followUpQuestion }) {
  const prompt = `You are conducting a live mock interview for "${jobTitle}" (category focus: ${category}).

PREVIOUS QUESTION: ${previousQuestion}
CANDIDATE'S PREVIOUS ANSWER: """${previousAnswer}"""
SUGGESTED FOLLOW-UP FROM EVALUATION (use this as inspiration, adapt as needed): ${followUpQuestion || "(none)"}

Ask the NEXT interview question. It can be the suggested follow-up, a deeper probe, or a fresh
question in the same category — use judgment to keep the interview flowing naturally.

${JSON_ONLY_INSTRUCTION}
Return: { "questionText": string, "category": string }`;

  return runJsonPrompt(prompt, mockInterviewQuestionSchema);
}

export async function generateFinalReport({ jobTitle, turns }) {
  const transcript = turns
    .map(
      (t, i) =>
        `Q${i + 1} (${t.category}): ${t.questionText}\nAnswer: ${t.userAnswer}\nScore given: ${
          t.feedback?.score ?? "n/a"
        }`
    )
    .join("\n\n");

  const prompt = `You are an interview coach writing a final practice report for a mock interview for
"${jobTitle}".

FULL TRANSCRIPT:
"""
${transcript}
"""

Summarize overall performance. This is AI-generated PRACTICE feedback, not an objective hiring
assessment — the "summary" field must say so explicitly.

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY this shape:
{
  "overallScore": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "summary": string
}`;

  return runJsonPrompt(prompt, mockInterviewFinalReportSchema);
}
