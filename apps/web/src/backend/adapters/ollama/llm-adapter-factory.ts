import { env } from "@/shared/config/env";
import { type LLMAdapter, NoopLLMAdapter } from "./llm-adapter";
import { OllamaLLMAdapter } from "./ollama-llm-adapter";

/**
 * Selects the LLM adapter from runtime config. `stub` keeps parsing as a no-op
 * (deterministic heuristic parsing still runs downstream); `ollama` calls the
 * configured private Ollama host. Missing Ollama config falls back to the noop
 * adapter so the app never hard-fails on misconfiguration.
 */
export function createLLMAdapter(): LLMAdapter {
  if (env.LLM_PROVIDER !== "ollama") {
    return new NoopLLMAdapter();
  }

  if (!env.OLLAMA_MODEL) {
    console.warn("LLM_PROVIDER=ollama but OLLAMA_MODEL is unset; falling back to noop parsing.");
    return new NoopLLMAdapter();
  }

  return new OllamaLLMAdapter({
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL,
    apiKey: env.OLLAMA_API_KEY
  });
}
