/**
 * AI-Powered Semantic Search Service
 * Uses local embeddings (Xenova Transformers) for privacy and speed
 */

import { pipeline, Pipeline } from '@xenova/transformers';
import { WorkflowMetadata } from './workflowDatabase';

interface EmbeddingCache {
  [key: string]: number[];
}

export class AISearchService {
  private embedder: Pipeline | null = null;
  private embeddingCache: EmbeddingCache = {};
  private initialized = false;

  /**
   * Initialize the AI model for embeddings
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🤖 Initializing AI search model...');
      // Use a lightweight, fast model for embeddings
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
      this.initialized = true;
      console.log('✅ AI search model initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI model:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.initialize();
    }

    // Check cache
    if (this.embeddingCache[text]) {
      return this.embeddingCache[text];
    }

    try {
      const output = await this.embedder!(text, {
        pooling: 'mean',
        normalize: true,
      });

      const embedding = Array.from(output.data) as number[];
      
      // Cache the result
      this.embeddingCache[text] = embedding;
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Search workflows using natural language
   */
  async semanticSearch(
    query: string,
    workflows: WorkflowMetadata[],
    limit: number = 10
  ): Promise<Array<WorkflowMetadata & { similarity: number }>> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Score all workflows
      const scoredWorkflows = await Promise.all(
        workflows.map(async (workflow) => {
          // Create searchable text for the workflow
          const workflowText = `
            ${workflow.name} 
            ${workflow.description} 
            ${workflow.trigger_type} 
            ${workflow.integrations.join(' ')} 
            ${workflow.tags.join(' ')}
          `.toLowerCase();

          // Generate workflow embedding
          const workflowEmbedding = await this.generateEmbedding(workflowText);

          // Calculate similarity
          const similarity = this.cosineSimilarity(
            queryEmbedding,
            workflowEmbedding
          );

          return {
            ...workflow,
            similarity,
          };
        })
      );

      // Sort by similarity and return top results
      return scoredWorkflows
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw error;
    }
  }

  /**
   * Generate search suggestions based on partial query
   */
  async generateSuggestions(partialQuery: string): Promise<string[]> {
    const commonIntents = [
      'slack notifications',
      'schedule reports',
      'webhook automation',
      'email processing',
      'data synchronization',
      'form submissions',
      'api integration',
      'database updates',
      'file processing',
      'social media posting',
      'customer notifications',
      'payment processing',
      'inventory management',
      'analytics tracking',
      'user onboarding',
    ];

    // Simple fuzzy matching for suggestions
    const query = partialQuery.toLowerCase();
    return commonIntents
      .filter((intent) => intent.includes(query))
      .slice(0, 5);
  }

  /**
   * Analyze query intent and extract key concepts
   */
  analyzeQuery(query: string): {
    intent: string;
    concepts: string[];
    triggerType?: string;
    complexity?: string;
  } {
    const queryLower = query.toLowerCase();

    // Detect trigger types
    let triggerType: string | undefined;
    if (queryLower.match(/webhook|api|http|rest/i)) {
      triggerType = 'Webhook';
    } else if (queryLower.match(/schedule|cron|daily|weekly|monthly/i)) {
      triggerType = 'Scheduled';
    } else if (queryLower.match(/manual|button|trigger/i)) {
      triggerType = 'Manual';
    }

    // Detect complexity
    let complexity: string | undefined;
    if (queryLower.match(/simple|basic|easy|beginner/i)) {
      complexity = 'low';
    } else if (queryLower.match(/complex|advanced|multi-step|enterprise/i)) {
      complexity = 'high';
    }

    // Extract concepts (services, actions)
    const concepts: string[] = [];
    const services = [
      'slack',
      'gmail',
      'google',
      'sheets',
      'drive',
      'calendar',
      'trello',
      'asana',
      'jira',
      'github',
      'aws',
      'stripe',
      'shopify',
      'mailchimp',
      'hubspot',
      'salesforce',
      'zendesk',
      'discord',
      'telegram',
      'twitter',
      'facebook',
      'instagram',
      'linkedin',
      'postgres',
      'mysql',
      'mongodb',
      'redis',
      'webhook',
      'http',
      'api',
      'email',
      'sms',
      'notification',
    ];

    for (const service of services) {
      if (queryLower.includes(service)) {
        concepts.push(service);
      }
    }

    // Determine intent
    let intent = 'search';
    if (queryLower.match(/send|post|create|add|insert/i)) {
      intent = 'create';
    } else if (queryLower.match(/get|fetch|read|retrieve|find/i)) {
      intent = 'read';
    } else if (queryLower.match(/update|modify|change|edit/i)) {
      intent = 'update';
    } else if (queryLower.match(/sync|synchronize|integrate|connect/i)) {
      intent = 'integrate';
    } else if (queryLower.match(/notify|alert|inform|message/i)) {
      intent = 'notify';
    }

    return {
      intent,
      concepts,
      triggerType,
      complexity,
    };
  }

  /**
   * Generate natural language explanation of search results
   */
  explainResults(
    query: string,
    resultCount: number,
    topResult?: WorkflowMetadata
  ): string {
    const analysis = this.analyzeQuery(query);

    let explanation = `Found ${resultCount} workflows`;

    if (analysis.concepts.length > 0) {
      explanation += ` that work with ${analysis.concepts.join(', ')}`;
    }

    if (analysis.triggerType) {
      explanation += ` and use ${analysis.triggerType} triggers`;
    }

    if (topResult) {
      explanation += `. The best match is "${topResult.name}" which has ${topResult.node_count} nodes and integrates with ${topResult.integrations.length} services.`;
    }

    return explanation;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache = {};
  }
}

// Singleton instance
let aiSearchServiceInstance: AISearchService | null = null;

export function getAISearchService(): AISearchService {
  if (!aiSearchServiceInstance) {
    aiSearchServiceInstance = new AISearchService();
  }
  return aiSearchServiceInstance;
}

