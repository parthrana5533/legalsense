/**
 * Vector Search Service
 * Handles similarity search using pgvector
 */

import { VectorSearchResult, LegalDocument } from '../../types';
import { legalDocumentRepository } from '../../repositories/legalDocumentRepository';
import { embeddingService } from '../ai/embeddingService';

export interface SearchWithJurisdictionPriorityInput {
  queryText: string;
  jurisdictionCountry: string;
  jurisdictionState: string | null;
  category: string | null;
  limit: number;
}

export interface SearchWithJurisdictionPriorityResult {
  stateSpecific: VectorSearchResult[];
  central: VectorSearchResult[];
  other: VectorSearchResult[];
}

export class VectorSearchService {
  /**
   * Search for similar legal documents
   */
  async searchSimilarDocuments(
    queryEmbedding: number[],
    limit = 5,
    threshold = 0.7
  ): Promise<VectorSearchResult[]> {
    const results = await legalDocumentRepository.vectorSearch(
      queryEmbedding,
      'India',
      null,
      null,
      limit
    );
    
    return results.map(result => ({
      document: result.document,
      similarity: result.similarity,
    }));
  }

  /**
   * Search with jurisdiction priority
   * Returns results grouped by jurisdiction priority
   */
  async searchWithJurisdictionPriority(
    input: SearchWithJurisdictionPriorityInput
  ): Promise<SearchWithJurisdictionPriorityResult> {
    // Generate embedding for query text
    const queryEmbedding = await embeddingService.generateEmbedding(input.queryText);
    
    // Perform vector search with all filters
    const results = await legalDocumentRepository.vectorSearch(
      queryEmbedding,
      input.jurisdictionCountry,
      input.jurisdictionState,
      input.category,
      input.limit
    );
    
    // Group results by jurisdiction priority
    const stateSpecific: VectorSearchResult[] = [];
    const central: VectorSearchResult[] = [];
    const other: VectorSearchResult[] = [];
    
    results.forEach(result => {
      const vectorResult: VectorSearchResult = {
        document: result.document,
        similarity: result.similarity,
      };
      
      if (result.document.jurisdiction_state === input.jurisdictionState) {
        stateSpecific.push(vectorResult);
      } else if (result.document.jurisdiction_state === null && result.document.jurisdiction_country === input.jurisdictionCountry) {
        central.push(vectorResult);
      } else {
        other.push(vectorResult);
      }
    });
    
    return {
      stateSpecific,
      central,
      other,
    };
  }

  /**
   * Index a legal document for search
   * This is handled by the repository during creation/update
   */
  async indexDocument(document: LegalDocument): Promise<void> {
    // Embeddings are generated and stored during document creation/update
    // No separate indexing step needed
  }

  /**
   * Rebuild search index
   * This is handled by PostgreSQL/pgvector automatically
   */
  async rebuildIndex(): Promise<void> {
    // pgvector indexes are maintained automatically by PostgreSQL
    // No manual rebuild needed
  }
}

export const vectorSearchService = new VectorSearchService();
