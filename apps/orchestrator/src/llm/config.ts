export function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return apiKey;
}

export interface LLMParams {
  temperature: number;
  maxTokens: number;
  topP: number;
}

export function getLLMParams(): LLMParams {
  return {
    temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "3000"),
    topP: parseFloat(process.env.LLM_TOP_P || "0.9"),
  };
}
