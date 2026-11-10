import { afterEach, describe, expect, it, vi } from "vitest";
import { getChatCompletion, PuterAIError } from "../services/puterClient";

describe("getChatCompletion", () => {
  afterEach(() => {
    delete window.puter;
    vi.restoreAllMocks();
  });

  it("requests a normalized response and returns its text content", async () => {
    const chat = vi.fn().mockResolvedValue({
      message: { content: "Generated response" }
    });
    window.puter = { ai: { chat } };

    await expect(getChatCompletion("prompt")).resolves.toBe("Generated response");
    expect(chat).toHaveBeenCalledWith("prompt", {
      model: "claude-sonnet-5",
      normalize: true
    });
  });

  it("extracts text blocks from a vendor-native response", async () => {
    window.puter = {
      ai: {
        chat: vi.fn().mockResolvedValue({
          message: { content: [{ type: "text", text: "First" }, { type: "text", text: "Second" }] }
        })
      }
    };

    await expect(getChatCompletion("prompt")).resolves.toBe("First\nSecond");
  });

  it("retries once when the AI returns no text", async () => {
    const chat = vi
      .fn()
      .mockResolvedValueOnce({ message: { content: null } })
      .mockResolvedValueOnce({ message: { content: "Recovered response" } });
    window.puter = { ai: { chat } };

    await expect(getChatCompletion("prompt")).resolves.toBe("Recovered response");
    expect(chat).toHaveBeenCalledTimes(2);
  });

  it("reports the finish reason after repeated empty responses", async () => {
    window.puter = {
      ai: {
        chat: vi.fn().mockResolvedValue({
          message: { content: null },
          finish_reason: "tool_calls"
        })
      }
    };

    await expect(getChatCompletion("prompt")).rejects.toThrow(
      new PuterAIError("The AI returned no text after retrying (finish reason: tool_calls). Please try again in a moment.")
    );
  });
});
