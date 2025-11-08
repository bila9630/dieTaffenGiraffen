import OpenAI from 'openai';

/**
 * Creates and returns an OpenAI client instance
 * @param apiKey - The OpenAI API key
 * @returns OpenAI client instance
 */
export const createOpenAIClient = (apiKey: string): OpenAI => {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Required for client-side usage
  });
};

/**
 * Gets the OpenAI API key from environment or localStorage
 * @returns The API key or empty string if not found
 */
export const getOpenAIKey = (): string => {
  const envApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  return envApiKey || localStorage.getItem('openai_api_key') || '';
};
