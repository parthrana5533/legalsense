/**
 * Groq AI Client Service
 * Handles communication with Groq API for AI analysis
 */

import { config } from '../../config';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    prompt_time: number;
    completion_tokens: number;
    completion_time: number;
    total_tokens: number;
    total_time: number;
  };
}

export class GroqClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string;

  constructor() {
    this.apiKey = config.ai.groqApiKey || '';
    // Use environment variable or fallback to a commonly available model
    this.model = process.env.GROQ_MODEL || 'llama3-8b-8192';
    if (!this.apiKey) {
      console.warn('GROQ_API_KEY not configured. AI features will not work.');
    }
  }

  /**
   * Send a chat completion request to Groq
   */
  async chatCompletion(messages: GroqMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3, // Lower temperature for more consistent legal analysis
        max_tokens: 2048,
        response_format: { type: 'json_object' }, // Force JSON response
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data: GroqResponse = await response.json() as GroqResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Groq API');
    }

    return data.choices[0].message.content;
  }

  /**
   * Validate API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const groqClient = new GroqClient();
