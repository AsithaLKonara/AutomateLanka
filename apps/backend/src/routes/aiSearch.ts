/**
 * Smart Search API Routes
 * Fast local search with intelligent analysis
 */

import { Router, Request, Response } from 'express';
import { WorkflowDatabase } from '../services/workflowDatabase';
import { getSmartSearchService } from '../services/smartSearchService';
import { resolve, join } from 'path';

const router = Router();

// Initialize services
const projectRoot = resolve(process.cwd(), '../..');
const dbPath = join(projectRoot, 'database/workflows.db');
const workflowsDir = join(projectRoot, 'workflows');
const db = new WorkflowDatabase(dbPath, workflowsDir);
const smartSearch = getSmartSearchService();

/**
 * POST /api/ai-search/semantic
 * Smart search using local text analysis
 */
router.post('/semantic', async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get all workflows
    const allWorkflows = db.search({
      query: '',
      per_page: 10000,
    });

    // Perform smart search
    const scoredResults = smartSearch.search(
      query,
      allWorkflows.workflows,
      limit
    );

    // Analyze query and generate explanation
    const analysis = smartSearch.analyzeQuery(query);
    const explanation = smartSearch.explainResults(query, scoredResults);

    // Format results
    const results = scoredResults.map(r => ({
      ...r.workflow,
      score: r.score,
      matches: r.matches,
    }));

    res.json({
      query,
      results,
      total: results.length,
      analysis,
      explanation,
      searchType: 'smart-local',
    });
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/ai-search/suggestions
 * Get search suggestions
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q = '' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({ suggestions: [] });
    }

    const suggestions = smartSearch.generateSuggestions(q);

    res.json({
      query: q,
      suggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * POST /api/ai-search/analyze
 * Analyze query intent and extract concepts
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const analysis = smartSearch.analyzeQuery(query);

    // Get workflow recommendations based on analysis
    const filters: any = {};
    if (analysis.triggerType) {
      filters.trigger = analysis.triggerType.toLowerCase();
    }
    if (analysis.complexity) {
      filters.complexity = analysis.complexity;
    }

    const recommendations = db.search({
      query: [...analysis.services, ...analysis.actions].join(' '),
      ...filters,
      per_page: 5,
    });

    res.json({
      query,
      analysis,
      recommendations: recommendations.workflows,
      suggestedFilters: {
        trigger: analysis.triggerType?.toLowerCase(),
        complexity: analysis.complexity,
        keywords: analysis.services,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Query analysis failed' });
  }
});

/**
 * GET /api/ai-search/similar/:filename
 * Find similar workflows using local analysis
 */
router.get('/similar/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { limit = 5 } = req.query;

    const workflow = db.getWorkflow(filename);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Get all workflows
    const allWorkflows = db.search({ query: '', per_page: 10000 });

    // Find similar workflows
    const scoredResults = smartSearch.findSimilar(
      workflow,
      allWorkflows.workflows,
      parseInt(limit as string, 10)
    );

    const similar = scoredResults.map(r => ({
      ...r.workflow,
      similarity: r.score / 100, // Normalize score to 0-1
      matches: r.matches,
    }));

    res.json({
      original: workflow,
      similar,
      total: similar.length,
    });
  } catch (error) {
    console.error('Similar workflows error:', error);
    res.status(500).json({ error: 'Failed to find similar workflows' });
  }
});

/**
 * POST /api/ai-search/recommend
 * Get personalized workflow recommendations
 */
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { preferences, limit = 10 } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Preferences are required' });
    }

    // Get all workflows
    const allWorkflows = db.search({ query: '', per_page: 10000 });

    // Get recommendations
    const scoredResults = smartSearch.recommend(
      preferences,
      allWorkflows.workflows,
      limit
    );

    const recommendations = scoredResults.map(r => ({
      ...r.workflow,
      score: r.score,
      matches: r.matches,
    }));

    res.json({
      preferences,
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

/**
 * POST /api/ai-search/describe
 * Describe what you want and find workflows
 */
router.post('/describe', async (req: Request, res: Response) => {
  try {
    const { description, limit = 10 } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Analyze the description
    const analysis = smartSearch.analyzeQuery(description);

    // Get all workflows
    const allWorkflows = db.search({ query: '', per_page: 10000 });

    // Apply filters based on analysis
    let filteredWorkflows = allWorkflows.workflows;

    if (analysis.triggerType) {
      filteredWorkflows = filteredWorkflows.filter(
        (w) => w.trigger_type === analysis.triggerType
      );
    }

    if (analysis.complexity) {
      filteredWorkflows = filteredWorkflows.filter(
        (w) => w.complexity === analysis.complexity
      );
    }

    // Perform smart search
    const scoredResults = smartSearch.search(
      description,
      filteredWorkflows,
      limit
    );

    const explanation = smartSearch.explainResults(description, scoredResults);

    const results = scoredResults.map(r => ({
      ...r.workflow,
      score: r.score,
      matches: r.matches,
    }));

    res.json({
      description,
      analysis,
      explanation,
      results,
      total: results.length,
      appliedFilters: {
        triggerType: analysis.triggerType,
        complexity: analysis.complexity,
        services: analysis.services,
      },
    });
  } catch (error) {
    console.error('Describe search error:', error);
    res.status(500).json({ error: 'Describe search failed' });
  }
});

export default router;

