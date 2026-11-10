import { z } from "zod";

// These mirror the backend validators (server/src/validators/*) so the shape
// agreed on with the AI is validated once in the browser and again on save.

export const analysisResultSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingOrUnclearSkills: z.array(z.string()).default([]),
  evidence: z
    .array(z.object({ skillOrClaim: z.string(), resumeExcerpt: z.string() }))
    .default([]),
  experienceAlignment: z.string().default(""),
  educationAlignment: z.string().default(""),
  keywordCoverage: z.array(z.object({ keyword: z.string(), covered: z.boolean() })).default([]),
  strengths: z.array(z.string()).default([]),
  improvementAreas: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  interviewTopics: z.array(z.string()).default([]),
  summary: z.string().default("")
});

export const resumeParseResultSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  links: z.array(z.object({ label: z.string().default(""), url: z.string().default("") })).default([]),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z
    .array(
      z.object({
        title: z.string().default(""),
        company: z.string().default(""),
        location: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
        current: z.boolean().default(false),
        bullets: z.array(z.string()).default([])
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string().default(""),
        degree: z.string().default(""),
        field: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default("")
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        bullets: z.array(z.string()).default([]),
        technologies: z.array(z.string()).default([]),
        url: z.string().default("")
      })
    )
    .default([]),
  certifications: z
    .array(z.object({ name: z.string().default(""), issuer: z.string().default(""), date: z.string().default("") }))
    .default([])
});

export const optimizationResultSchema = z.object({
  improvedSummary: z.string().default(""),
  improvedBullets: z
    .array(
      z.object({
        original: z.string().default(""),
        improved: z.string().default(""),
        explanation: z.string().default("")
      })
    )
    .default([]),
  suggestedKeywords: z.array(z.string()).default([]),
  suggestedSectionOrder: z.array(z.string()).default([]),
  missingInfoRequests: z.array(z.string()).default([])
});

export const interviewQuestionSchema = z.object({
  questionText: z.string().min(1),
  category: z.enum(["technical", "programming", "project", "system-design", "behavioral", "hr"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  whyRelevant: z.string().default(""),
  conceptsToRevise: z.array(z.string()).default([]),
  answerGuidance: z.string().default(""),
  followUps: z.array(z.string()).default([])
});

export const interviewQuestionsResultSchema = z.object({
  questions: z.array(interviewQuestionSchema).min(1)
});

export const studyPlanResultSchema = z.object({
  tasks: z.array(
    z.object({
      day: z.number().int().min(1),
      title: z.string().min(1),
      description: z.string().default(""),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      estimatedMinutes: z.number().int().min(5).default(30)
    })
  )
});

export const mockInterviewQuestionSchema = z.object({
  questionText: z.string().min(1),
  category: z.string().default("technical")
});

export const mockInterviewFeedbackSchema = z.object({
  technicalCorrectness: z.number().min(0).max(100).optional(),
  completeness: z.number().min(0).max(100).optional(),
  clarity: z.number().min(0).max(100).optional(),
  relevance: z.number().min(0).max(100).optional(),
  communicationQuality: z.number().min(0).max(100).optional(),
  suggestedImprovements: z.array(z.string()).default([]),
  followUpQuestion: z.string().default(""),
  score: z.number().min(0).max(100).optional()
});

export const mockInterviewFinalReportSchema = z.object({
  overallScore: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  summary: z.string().default("")
});
