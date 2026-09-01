/**
 * AI Services Entry Point
 * Exports all AI providers and initializes the provider factory
 */

import { AIProviderFactory } from './base';
import { GroqProvider } from './groq';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

// Register all AI providers
const groqProvider = new GroqProvider();
const geminiProvider = new GeminiProvider();
const openaiProvider = new OpenAIProvider();

AIProviderFactory.register(groqProvider);
AIProviderFactory.register(geminiProvider);
AIProviderFactory.register(openaiProvider);

// Export
export { AIProviderFactory } from './base';
export { GroqProvider, GroqPromptBuilder } from './groq';
export { GeminiProvider, GeminiPromptBuilder } from './gemini';
export { OpenAIProvider, OpenAIPromptBuilder } from './openai';
