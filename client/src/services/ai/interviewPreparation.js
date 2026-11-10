import { getChatCompletion } from "../puterClient";
import { parseAIJson, AIResponseParseError } from "../../utils/parseAIResponse.js";
import { validateAIOutput } from "../../utils/validateAIOutput";
import { interviewQuestionsResultSchema, studyPlanResultSchema } from "../../schemas/aiSchemas";
import { JSON_ONLY_INSTRUCTION, buildStrictRetryPrompt } from "./promptUtils";

function buildQuestionsPrompt({ jobTitle, resumeText, missingOrUnclearSkills, questionCount, difficulty }) {
  return `You are an experienced technical interviewer preparing a candidate for a role.

TARGET JOB TITLE: ${jobTitle}
IDENTIFIED SKILL GAPS (from a prior resume/job analysis): ${
    (missingOrUnclearSkills || []).join(", ") || "(none identified)"
  }

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

Generate ${questionCount} interview questions covering a mix of these categories: technical,
programming, project, system-design, behavioral, hr. Prefer "${difficulty}" difficulty where it makes
sense, but vary it naturally. For each question include why it's relevant to this candidate and role,
concepts to revise beforehand, optional brief answer guidance, and 1-2 natural follow-up questions.

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY this shape:
{
  "questions": [
    {
      "questionText": string,
      "category": "technical" | "programming" | "project" | "system-design" | "behavioral" | "hr",
      "difficulty": "easy" | "medium" | "hard",
      "whyRelevant": string,
      "conceptsToRevise": string[],
      "answerGuidance": string,
      "followUps": string[]
    }
  ]
}`;
}

export async function generateInterviewQuestions(input) {
  const prompt = buildQuestionsPrompt(input);
  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(interviewQuestionsResultSchema, json).questions;
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(interviewQuestionsResultSchema, json).questions;
  }
}

function buildStudyPlanPrompt({ jobTitle, missingOrUnclearSkills, availableDays, proficiency, pace, targetDate }) {
  return `You are a career coach building a realistic interview study plan.

TARGET JOB TITLE: ${jobTitle}
SKILL GAPS TO ADDRESS: ${(missingOrUnclearSkills || []).join(", ") || "(none identified)"}
AVAILABLE PREPARATION DAYS: ${availableDays}
CURRENT SELF-RATED PROFICIENCY: ${proficiency || "not specified"}
PREFERRED PACE: ${pace || "steady"}
TARGET INTERVIEW DATE: ${targetDate || "not specified"}

Build a day-by-day study plan (day 1..${availableDays}) with concrete tasks, priorities, and realistic
estimated durations in minutes. Do NOT invent external course names or URLs, or claim any resource has
been verified — keep tasks to generic actions like "practice", "review", "mock interview", "read docs
for X", described in general terms.

${JSON_ONLY_INSTRUCTION}
Return a JSON object with EXACTLY this shape:
{
  "tasks": [
    {
      "day": number,
      "title": string,
      "description": string,
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": number
    }
  ]
}`;
}

export async function generateStudyPlan(input) {
  const prompt = buildStudyPlanPrompt(input);
  let rawText = await getChatCompletion(prompt);
  try {
    const json = parseAIJson(rawText);
    return validateAIOutput(studyPlanResultSchema, json).tasks;
  } catch (err) {
    if (!(err instanceof AIResponseParseError) && err.name !== "AIValidationError") throw err;
    rawText = await getChatCompletion(buildStrictRetryPrompt(prompt, rawText));
    const json = parseAIJson(rawText);
    return validateAIOutput(studyPlanResultSchema, json).tasks;
  }
}
