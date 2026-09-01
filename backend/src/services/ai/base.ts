/**
 * AI Provider Base Interface
 * Defines the contract for all AI providers (Groq, Gemini, OpenAI, etc.)
 * This abstraction allows switching between providers without changing application code
 */

import { AIResponse } from '../../types';

export interface AIProvider {
  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Generate a summary for a legal case
   * @param input - The case description and context
   * @returns AI-generated summary
   */
  generateSummary(input: string): Promise<string>;

  /**
   * Generate a response to a user message
   * @param input - User's message
   * @param context - Optional conversation context
   * @returns AI-generated response with metadata
   */
  generateResponse(input: string, context?: any): Promise<AIResponse>;

  /**
   * Check if provider is available and configured
   */
  isAvailable(): boolean;
}

/**
 * AI Provider Factory
 * Creates instances of different AI providers
 */
export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  /**
   * Register an AI provider
   */
  static register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Get a specific AI provider by name
   */
  static get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get the default AI provider
   */
  static getDefault(): AIProvider | undefined {
    // Priority order: Groq > Gemini > OpenAI
    const priority = ['groq', 'gemini', 'openai'];
    
    for (const name of priority) {
      const provider = this.providers.get(name);
      if (provider && provider.isAvailable()) {
        return provider;
      }
    }

    return undefined;
  }

  /**
   * Get all available providers
   */
  static getAvailable(): AIProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isAvailable());
  }
}
