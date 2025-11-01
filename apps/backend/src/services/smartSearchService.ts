/**
 * Smart Local Search Service
 * Lightweight, fast search using simple text analysis (no heavy AI)
 */

import { WorkflowMetadata } from './workflowDatabase';

interface SearchScore {
  workflow: WorkflowMetadata;
  score: number;
  matches: string[];
}

export class SmartSearchService {
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'when', 'where', 'who', 'what', 'i',
    'me', 'my', 'we', 'need', 'want', 'can', 'do', 'have', 'get'
  ]);

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  /**
   * Calculate text similarity using simple word matching
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.extractKeywords(text1));
    const words2 = new Set(this.extractKeywords(text2));

    if (words1.size === 0 || words2.size === 0) return 0;

    // Calculate Jaccard similarity
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Score a workflow based on query
   */
  private scoreWorkflow(query: string, workflow: WorkflowMetadata): SearchScore {
    const queryLower = query.toLowerCase();
    const queryWords = this.extractKeywords(query);
    
    let score = 0;
    const matches: string[] = [];

    // 1. Exact name match (highest priority)
    if (workflow.name.toLowerCase().includes(queryLower)) {
      score += 100;
      matches.push('name');
    }

    // 2. Check description
    if (workflow.description && workflow.description.toLowerCase().includes(queryLower)) {
      score += 50;
      matches.push('description');
    }

    // 3. Check integrations
    const integrationMatch = workflow.integrations.some(int => 
      queryLower.includes(int.toLowerCase()) || int.toLowerCase().includes(queryLower)
    );
    if (integrationMatch) {
      score += 70;
      matches.push('integrations');
    }

    // 4. Check tags
    const tagMatch = workflow.tags.some(tag => 
      queryLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(queryLower)
    );
    if (tagMatch) {
      score += 30;
      matches.push('tags');
    }

    // 5. Word-by-word matching
    const workflowText = `${workflow.name} ${workflow.description} ${workflow.integrations.join(' ')}`.toLowerCase();
    let wordMatches = 0;
    queryWords.forEach(word => {
      if (workflowText.includes(word)) {
        wordMatches++;
        score += 10;
      }
    });

    // 6. Similarity bonus
    const similarity = this.calculateSimilarity(query, workflowText);
    score += similarity * 50;

    // 7. Boost for active workflows
    if (workflow.active) {
      score *= 1.1;
    }

    // 8. Consider complexity preference
    if (queryLower.includes('simple') || queryLower.includes('easy') || queryLower.includes('basic')) {
      if (workflow.complexity === 'low') score *= 1.2;
    } else if (queryLower.includes('complex') || queryLower.includes('advanced')) {
      if (workflow.complexity === 'high') score *= 1.2;
    }

    return { workflow, score, matches };
  }

  /**
   * Smart search with local analysis
   */
  search(query: string, workflows: WorkflowMetadata[], limit: number = 10): SearchScore[] {
    if (!query.trim()) return [];

    // Score all workflows
    const scored = workflows.map(workflow => this.scoreWorkflow(query, workflow));

    // Sort by score and return top results
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Generate search suggestions
   */
  generateSuggestions(partialQuery: string): string[] {
    const commonPatterns = [
      'send slack notifications',
      'schedule daily reports',
      'webhook automation',
      'email when form submitted',
      'sync data between apps',
      'google sheets integration',
      'database updates',
      'api integration',
      'automated backups',
      'customer notifications',
      'payment processing',
      'file processing',
      'social media posting',
      'calendar events',
      'task management',
    ];

    const query = partialQuery.toLowerCase().trim();
    if (query.length < 2) return [];

    return commonPatterns
      .filter(pattern => pattern.includes(query))
      .slice(0, 5);
  }

  /**
   * Analyze query and extract intent
   */
  analyzeQuery(query: string): {
    intent: string;
    services: string[];
    actions: string[];
    triggerType?: string;
    complexity?: string;
  } {
    const queryLower = query.toLowerCase();

    // Detect services
    const services: string[] = [];
    const serviceKeywords = [
      'slack', 'gmail', 'google', 'sheets', 'drive', 'calendar',
      'trello', 'asana', 'jira', 'github', 'aws', 'stripe',
      'shopify', 'mailchimp', 'hubspot', 'salesforce', 'zendesk',
      'discord', 'telegram', 'twitter', 'facebook', 'postgres',
      'mysql', 'mongodb', 'redis', 'webhook', 'http', 'api'
    ];

    for (const service of serviceKeywords) {
      if (queryLower.includes(service)) {
        services.push(service);
      }
    }

    // Detect actions
    const actions: string[] = [];
    const actionKeywords = [
      'send', 'post', 'create', 'add', 'insert', 'update', 'modify',
      'delete', 'remove', 'get', 'fetch', 'read', 'sync', 'notify',
      'schedule', 'trigger', 'process', 'generate', 'export'
    ];

    for (const action of actionKeywords) {
      if (queryLower.includes(action)) {
        actions.push(action);
      }
    }

    // Detect trigger type
    let triggerType: string | undefined;
    if (queryLower.match(/webhook|api|http|rest/)) {
      triggerType = 'Webhook';
    } else if (queryLower.match(/schedule|cron|daily|weekly|hourly|every/)) {
      triggerType = 'Scheduled';
    } else if (queryLower.match(/manual|button|click/)) {
      triggerType = 'Manual';
    }

    // Detect complexity
    let complexity: string | undefined;
    if (queryLower.match(/simple|basic|easy|beginner|quick/)) {
      complexity = 'low';
    } else if (queryLower.match(/complex|advanced|enterprise|multi-step/)) {
      complexity = 'high';
    }

    // Determine intent
    let intent = 'search';
    if (queryLower.match(/send|post|create|add/)) {
      intent = 'create';
    } else if (queryLower.match(/get|fetch|read|show/)) {
      intent = 'read';
    } else if (queryLower.match(/update|modify|change/)) {
      intent = 'update';
    } else if (queryLower.match(/sync|integrate|connect/)) {
      intent = 'integrate';
    } else if (queryLower.match(/notify|alert|inform/)) {
      intent = 'notify';
    }

    return {
      intent,
      services,
      actions,
      triggerType,
      complexity,
    };
  }

  /**
   * Explain search results
   */
  explainResults(
    query: string,
    results: SearchScore[]
  ): string {
    const analysis = this.analyzeQuery(query);
    
    let explanation = `Found ${results.length} workflows`;

    if (analysis.services.length > 0) {
      explanation += ` that work with ${analysis.services.join(', ')}`;
    }

    if (analysis.actions.length > 0) {
      explanation += ` and perform actions like ${analysis.actions.slice(0, 2).join(', ')}`;
    }

    if (analysis.triggerType) {
      explanation += `. Filtered by ${analysis.triggerType} triggers`;
    }

    if (results.length > 0) {
      const topResult = results[0].workflow;
      explanation += `. Best match: "${topResult.name}" (${topResult.node_count} nodes, ${topResult.integrations.length} integrations)`;
    }

    return explanation;
  }

  /**
   * Find similar workflows
   */
  findSimilar(
    targetWorkflow: WorkflowMetadata,
    allWorkflows: WorkflowMetadata[],
    limit: number = 5
  ): SearchScore[] {
    const searchText = `${targetWorkflow.name} ${targetWorkflow.description} ${targetWorkflow.integrations.join(' ')}`;
    
    return this.search(
      searchText,
      allWorkflows.filter(w => w.filename !== targetWorkflow.filename),
      limit
    );
  }

  /**
   * Get recommendations based on preferences
   */
  recommend(
    preferences: {
      services?: string[];
      useCase?: string;
      complexity?: string;
      triggerType?: string;
    },
    workflows: WorkflowMetadata[],
    limit: number = 10
  ): SearchScore[] {
    let filtered = workflows;

    // Apply filters
    if (preferences.complexity) {
      filtered = filtered.filter(w => w.complexity === preferences.complexity);
    }

    if (preferences.triggerType) {
      filtered = filtered.filter(w => 
        w.trigger_type.toLowerCase() === preferences.triggerType!.toLowerCase()
      );
    }

    // Build search query from preferences
    const queryParts: string[] = [];
    if (preferences.services) {
      queryParts.push(...preferences.services);
    }
    if (preferences.useCase) {
      queryParts.push(preferences.useCase);
    }

    const query = queryParts.join(' ');
    return this.search(query, filtered, limit);
  }
}

// Singleton instance
let smartSearchInstance: SmartSearchService | null = null;

export function getSmartSearchService(): SmartSearchService {
  if (!smartSearchInstance) {
    smartSearchInstance = new SmartSearchService();
  }
  return smartSearchInstance;
}

