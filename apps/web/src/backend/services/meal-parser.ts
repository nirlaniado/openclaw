import type { ParsedMealCandidate } from "@/backend/adapters/ollama/llm-adapter";

const quantityPattern =
  /^((?:\d+(?:\.\d+)?)|(?:half|quarter|one|two|three|four)|(?:\d+\s*\/\s*\d+))\s+(.+)$/i;

export function parseMealTextDeterministically(mealText: string): ParsedMealCandidate {
  const normalized = mealText
    .split(/\n+/)
    .flatMap((line) => line.split(/,(?![^(]*\))/))
    .flatMap((part) => part.split(/\s+\band\b\s+/i))
    .map((part) => part.trim())
    .filter(Boolean);

  const items = normalized.map((entry) => {
    const match = entry.match(quantityPattern);

    if (!match) {
      return {
        description: entry,
        confidence: "medium" as const
      };
    }

    return {
      description: match[2].trim(),
      quantityText: match[1].trim(),
      confidence: "medium" as const
    };
  });

  return {
    originalText: mealText,
    parseStrategy: "heuristic",
    warnings: items.length === 0 ? ["No structured meal items could be inferred from the text."] : [],
    items
  };
}
