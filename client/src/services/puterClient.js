// Centralized Puter.js access point. ALL generative AI calls in this app go through
// getChatCompletion() so the model name and auth/error handling live in one place.
// Docs: https://docs.puter.com/AI/chat/ , https://docs.puter.com/Auth/
//
// Normal AI calls rely on Puter.js to prompt for sign-in as needed. Account switching is
// explicit and only runs when the user requests it from Settings.

export const AI_MODEL = "claude-sonnet-5"; // change here to switch models app-wide

export class PuterNotAvailableError extends Error {
  constructor() {
    super("Puter.js failed to load. Check your internet connection and try again.");
    this.name = "PuterNotAvailableError";
  }
}

export class PuterSignInCancelledError extends Error {
  constructor() {
    super("Sign-in to Puter was cancelled. This AI feature needs it to continue.");
    this.name = "PuterSignInCancelledError";
  }
}

export class PuterAIError extends Error {
  constructor(message) {
    super(message || "The AI service could not complete this request.");
    this.name = "PuterAIError";
  }
}

export async function switchPuterAccount() {
  const { auth } = getPuter();
  if (!auth?.isSignedIn || !auth?.signOut || !auth?.signIn) {
    throw new PuterAIError("Puter account switching is unavailable right now.");
  }

  try {
    if (auth.isSignedIn()) await auth.signOut();
    await auth.signIn();
  } catch (err) {
    if (isSignInCancellation(err)) throw new PuterSignInCancelledError();
    throw new PuterAIError(err?.message || "Could not switch Puter accounts.");
  }
}

function getPuter() {
  if (typeof window === "undefined" || !window.puter) {
    throw new PuterNotAvailableError();
  }
  return window.puter;
}

export function isPuterAvailable() {
  return typeof window !== "undefined" && !!window.puter;
}

function isSignInCancellation(err) {
  if (!err) return false;
  if (err.error?.code === "auth_canceled") return true;
  const message = String(err.message || err.error?.message || "");
  return /cancel/i.test(message);
}

function extractText(response) {
  if (response == null) return "";
  if (typeof response === "string") return response;
  const content = response.message?.content ?? response.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .filter(Boolean)
      .join("\n");
  }
  if (typeof response.text === "string") return response.text;
  if (Array.isArray(response) && response[0]) return extractText(response[0]);
  return "";
}

/**
 * Runs a single-turn chat completion through Puter.js and returns raw text.
 * Callers are responsible for parsing/validating the text (see utils/parseAIResponse.js).
 */
export async function getChatCompletion(prompt, { model = AI_MODEL, timeoutMs = 60000 } = {}) {
  const puter = getPuter();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let timeoutId;
    try {
      // Normalize Anthropic and other vendor responses to a consistent text shape.
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new PuterAIError("The AI request timed out. Please try again.")),
          timeoutMs
        );
      });
      const response = await Promise.race([
        puter.ai.chat(prompt, { model, normalize: true }),
        timeout
      ]);
      const text = extractText(response).trim();
      if (text) return text;
      if (attempt === 0) continue;

      const finishReason = response?.finish_reason || response?.stopReason;
      const detail = finishReason ? ` (finish reason: ${finishReason})` : "";
      throw new PuterAIError(
        `The AI returned no text after retrying${detail}. Please try again in a moment.`
      );
    } catch (err) {
      if (err instanceof PuterAIError) throw err;
      if (isSignInCancellation(err)) throw new PuterSignInCancelledError();
      throw new PuterAIError(err?.message || err?.error?.message || "The AI service returned an error.");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new PuterAIError("The AI service returned an empty response.");
}
