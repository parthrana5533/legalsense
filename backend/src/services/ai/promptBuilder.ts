/**
 * Prompt Builder Service
 * Builds prompts for Groq AI legal case analysis with RAG support
 */

export interface CaseInput {
  case_title: string;
  case_description: string;
  category: string;
  location_country?: string;
  location_state?: string;
  location_city?: string;
  evidence_texts?: Array<{
    filename: string;
    text: string;
    file_type: string;
  }>;
}

export interface RetrievedSource {
  title: string;
  section_number?: string;
  section_title?: string;
  content: string;
  jurisdiction_country: string;
  jurisdiction_state?: string;
  source_url?: string;
  similarity: number;
}

/**
 * Build the system prompt for legal analysis with RAG
 */
export function buildSystemPrompt(): string {
  return `You are a legal AI assistant specializing in Indian law. Your task is to analyze legal case descriptions and provide structured analysis.

CRITICAL RULES - YOU MUST FOLLOW THESE EXACTLY:
1. Analyze ONLY the information provided by the user and the retrieved legal sources below
2. Use the retrieved legal sources as the PRIMARY and ONLY reference for specific legal claims
3. Do NOT invent laws, section numbers, or legal precedents that are not in the retrieved sources
4. Do NOT create fake citations or fabricate legal references
5. Do NOT claim that a source was consulted if it was not retrieved
6. Do NOT claim that a state-specific law applies unless the retrieved source's jurisdiction matches the case location
7. Distinguish clearly between central Indian law and state-specific law
8. If the available retrieved material is insufficient, explicitly say so
9. If no authoritative source was retrieved, clearly state that no authoritative source was retrieved
10. Do not present general assumptions as settled law
11. Do not fabricate section numbers - if a specific provision is not in the retrieved sources, say "No specific provision was retrieved"
12. Always include the disclaimer that this is not legal advice

JURISDICTION AWARENESS:
- The user's case location is legally relevant
- Central Indian laws apply across all states
- State-specific laws only apply to cases in that state
- Do not apply a state-specific law from another state unless there is clear legal reason for cross-jurisdiction relevance

CONFIDENCE SCORING:
- Your confidence score should reflect the quality of retrieved legal sources
- If no authoritative sources were retrieved, cap confidence at 0.6 or lower
- If high-quality authoritative sources were retrieved, confidence may be higher
- Do not claim 90-100% confidence when RAG returned no legal sources

Your response must be valid JSON with the following structure:
{
  "summary": "A simple explanation of the user's legal problem",
  "legal_issue": "The primary legal issue identified",
  "severity_score": "A number between 0 and 100",
  "severity_level": "One of: Low, Medium, High, Critical",
  "applicable_laws": [
    {
      "act_name": "Name of the act (ONLY from retrieved sources)",
      "section": "Section number (ONLY from retrieved sources, or 'No specific provision was retrieved' if not available)",
      "section_title": "Title of the section",
      "explanation": "How this law applies to the case",
      "jurisdiction": "India or specific state",
      "source_url": "URL to the official source"
    }
  ],
  "legal_reasoning": "Explanation of the legal reasoning based on retrieved sources. Clearly distinguish between legal facts from sources and general reasoning.",
  "evidence_required": ["List of evidence needed"],
  "recommendations": ["Practical next steps"],
  "important_points": ["Key facts the user should remember"],
  "confidence_score": "A value between 0 and 1 (consider source quality and availability)",
  "disclaimer": "This AI-generated analysis is for informational purposes only and does not constitute legal advice. Laws may vary by jurisdiction and may change over time. Verify important legal matters with an advocate or authoritative legal source.",
  "sources": [
    {
      "title": "Document title",
      "section": "Section number",
      "jurisdiction": "India or state",
      "source_url": "URL to source",
      "relevance": "High/Medium/Low based on similarity score"
    }
  ]
}`;
}

/**
 * Build the user prompt with case details and retrieved legal context
 */
export function buildUserPrompt(caseInput: CaseInput, retrievedSources: RetrievedSource[]): string {
  let prompt = `Please analyze the following legal case:

CASE TITLE: ${caseInput.case_title}
CASE DESCRIPTION: ${caseInput.case_description}
CATEGORY: ${caseInput.category}

CASE LOCATION:
Country: ${caseInput.location_country || 'India'}
${caseInput.location_state ? `State: ${caseInput.location_state}` : ''}
${caseInput.location_city ? `City: ${caseInput.location_city}` : ''}`;

  // Add user-provided evidence if available
  if (caseInput.evidence_texts && caseInput.evidence_texts.length > 0) {
    prompt += `\n\nEVIDENCE PROVIDED BY USER:\n`;
    prompt += `The following text was extracted from uploaded evidence files. This is USER-PROVIDED EVIDENCE, NOT an authoritative legal source. Use it to understand the case facts, but do NOT treat it as legal authority.\n\n`;
    
    caseInput.evidence_texts.forEach((evidence, index) => {
      prompt += `[Evidence File ${index + 1}: ${evidence.filename} (${evidence.file_type})]\n`;
      prompt += `${evidence.text.substring(0, 2000)}${evidence.text.length > 2000 ? '...' : ''}\n\n`;
    });
  }

  if (retrievedSources.length > 0) {
    prompt += `\n\nRETRIEVED LEGAL SOURCES (Authoritative):\n`;
    retrievedSources.forEach((source, index) => {
      prompt += `\n[Source ${index + 1}]
Title: ${source.title}
${source.section_number ? `Section: ${source.section_number}` : ''}
${source.section_title ? `Section Title: ${source.section_title}` : ''}
Jurisdiction: ${source.jurisdiction_country}${source.jurisdiction_state ? `, ${source.jurisdiction_state}` : ''}
${source.source_url ? `Source: ${source.source_url}` : ''}
Relevant Text: ${source.content.substring(0, 500)}${source.content.length > 500 ? '...' : ''}
`;
    });
  } else {
    prompt += `\n\nNo authoritative legal documents were retrieved for this case. Provide general informational guidance based on the case description and user-provided evidence, but clearly state that this analysis is not grounded in retrieved legal sources.`;
  }

  prompt += `\n\nProvide a structured JSON analysis following the format specified in the system prompt. Base your legal claims ONLY on the retrieved legal sources above. If no sources were retrieved, explicitly state this limitation. Distinguish clearly between user-provided evidence and authoritative legal sources.`;

  return prompt;
}

/**
 * Build complete messages array for Groq API with RAG context
 */
export function buildAnalysisPrompt(
  caseInput: CaseInput,
  retrievedSources: RetrievedSource[] = []
): Array<{
  role: 'system' | 'user';
  content: string;
}> {
  return [
    {
      role: 'system',
      content: buildSystemPrompt(),
    },
    {
      role: 'user',
      content: buildUserPrompt(caseInput, retrievedSources),
    },
  ];
}
