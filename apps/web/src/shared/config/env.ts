import { z } from "zod";

// Treat empty-string env vars (e.g. `USDA_API_KEY=` set in Vercel or a .env file)
// as unset so optional integrations don't fail validation at build time.
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = () => z.preprocess(emptyToUndefined, z.string().min(1).optional());

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Nutrition Tracker"),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(),
  SUPABASE_DB_URL: optionalString(),
  USDA_API_KEY: optionalString(),
  OLLAMA_BASE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:11434")
  ),
  OLLAMA_MODEL: optionalString(),
  OLLAMA_API_KEY: optionalString(),
  LLM_PROVIDER: z.preprocess(emptyToUndefined, z.enum(["stub", "ollama"]).default("stub")),
  LOG_LEVEL: z.preprocess(emptyToUndefined, z.enum(["debug", "info", "warn", "error"]).default("info"))
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
  USDA_API_KEY: process.env.USDA_API_KEY,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  LOG_LEVEL: process.env.LOG_LEVEL
});
