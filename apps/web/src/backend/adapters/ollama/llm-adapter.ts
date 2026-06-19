export type MealParsingRequest = {
  mealText: string;
  timezone: string;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack" | "other";
  eatenAt?: string;
  locale?: string;
  maxCandidates?: number;
};

export type ParsedMealCandidate = {
  originalText: string;
  parseStrategy: "noop" | "heuristic" | "llm";
  warnings: string[];
  items: Array<{
    description: string;
    quantityText?: string;
    confidence: "high" | "medium" | "low";
  }>;
};

export interface LLMAdapter {
  parseMealText(input: MealParsingRequest): Promise<ParsedMealCandidate>;
}

export class NoopLLMAdapter implements LLMAdapter {
  async parseMealText(input: MealParsingRequest): Promise<ParsedMealCandidate> {
    return {
      originalText: input.mealText,
      parseStrategy: "noop",
      warnings: ["LLM parsing is not enabled in this environment."],
      items: []
    };
  }
}
