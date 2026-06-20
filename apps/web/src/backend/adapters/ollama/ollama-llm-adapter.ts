import { z } from "zod";
import type { LLMAdapter, MealParsingRequest, ParsedMealCandidate } from "./llm-adapter";

type OllamaAdapterConfig = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  timeoutMs?: number;
};

const llmItemsSchema = z.object({
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantityText: z.string().min(1).optional(),
        confidence: z.enum(["high", "medium", "low"]).default("medium")
      })
    )
    .default([])
});

const SYSTEM_PROMPT = [
  "You extract individual food items from a meal description.",
  "Return ONLY JSON of the form:",
  '{"items":[{"description":"food name","quantityText":"optional amount","confidence":"high|medium|low"}]}',
  "Do not compute calories or macros. Do not invent foods that were not mentioned.",
  "Keep each description to a single food. If nothing edible is described, return an empty items array."
].join(" ");

/**
 * Calls a private Ollama host (e.g. on EC2) to parse free-text meals into
 * structured candidate items. Deterministic macro math stays out of this path.
 *
 * On any failure it degrades to an empty result + warning so that
 * meal-log-service falls back to deterministic heuristic parsing rather than
 * failing the whole request.
 */
export class OllamaLLMAdapter implements LLMAdapter {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(config: OllamaAdapterConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.model = config.model;
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 20_000;
  }

  async parseMealText(input: MealParsingRequest): Promise<ParsedMealCandidate> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: this.model,
          stream: false,
          format: "json",
          options: { temperature: 0 },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: input.mealText }
          ]
        })
      });

      if (!response.ok) {
        return this.failure(input, `Ollama responded with HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as { message?: { content?: string } };
      const content = payload.message?.content;

      if (!content) {
        return this.failure(input, "Ollama returned an empty response.");
      }

      const parsed = llmItemsSchema.parse(JSON.parse(content));
      const items = typeof input.maxCandidates === "number" ? parsed.items.slice(0, input.maxCandidates) : parsed.items;

      return {
        originalText: input.mealText,
        parseStrategy: "llm",
        warnings: items.length === 0 ? ["Ollama did not return any food items."] : [],
        items
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      return this.failure(input, `Ollama parsing failed: ${reason}.`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private failure(input: MealParsingRequest, warning: string): ParsedMealCandidate {
    return {
      originalText: input.mealText,
      parseStrategy: "llm",
      warnings: [warning],
      items: []
    };
  }
}
