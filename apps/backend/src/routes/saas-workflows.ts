import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { prismaWorkflowService, CreateWorkflowInput, UpdateWorkflowInput } from '../services/prismaWorkflowService';
import { checkWorkflowLimit } from '../middleware/planLimitsMiddleware';
import { z } from 'zod';

const router = Router();

// All SaaS workflow routes require authentication
router.use(authMiddleware);

// Validation schemas
const createWorkflowSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    workspaceId: z.string().uuid('Invalid workspace ID'),
    json: z.record(z.any()),
    active: z.boolean().optional(),
    public: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
});

const updateWorkflowSchema = z.object({
    name: z.string().min(1).optional(),
    json: z.record(z.any()).optional(),
    active: z.boolean().optional(),
    public: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
});

/**
 * GET /api/saas-workflows
 * List/Search workspace workflows
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const {
            workspaceId,
            query,
            category,
            active,
            page,
            limit,
            includePublic
        } = req.query;

        const result = await prismaWorkflowService.searchWorkflows({
            workspaceId: workspaceId as string,
            query: query as string,
            category: category as string,
            active: active === 'true' ? true : active === 'false' ? false : undefined,
            page: page ? parseInt(page as string, 10) : 1,
            limit: limit ? parseInt(limit as string, 10) : 30,
            includePublic: includePublic === 'true' || !workspaceId,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Search workflows error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search workflows',
        });
    }
});

/**
 * POST /api/saas-workflows
 * Create new workflow
 */
router.post('/', checkWorkflowLimit, async (req: AuthRequest, res: Response) => {
    try {
        const validation = createWorkflowSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                details: validation.error.errors,
            });
        }

        const input: CreateWorkflowInput = {
            ...validation.data,
            createdBy: req.user!.userId,
        };

        const workflow = await prismaWorkflowService.createWorkflow(input);

        res.status(201).json({
            success: true,
            data: workflow,
        });
    } catch (error: any) {
        console.error('Create workflow error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create workflow',
        });
    }
});

/**
 * GET /api/saas-workflows/:id
 * Get workflow details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const workflow = await prismaWorkflowService.getWorkflow(
            req.params.id,
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            data: workflow,
        });
    } catch (error: any) {
        console.error('Get workflow error:', error);
        res.status(error.message.includes('denied') ? 403 : 404).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * PUT /api/saas-workflows/:id
 * Update workflow
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const validation = updateWorkflowSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                details: validation.error.errors,
            });
        }

        const { createVersion } = req.query;

        const workflow = await prismaWorkflowService.updateWorkflow(
            req.params.id,
            req.user!.userId,
            validation.data,
            createVersion === 'true'
        );

        res.status(200).json({
            success: true,
            data: workflow,
        });
    } catch (error: any) {
        console.error('Update workflow error:', error);
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * DELETE /api/saas-workflows/:id
 * Delete workflow
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        await prismaWorkflowService.deleteWorkflow(req.params.id, req.user!.userId);

        res.status(200).json({
            success: true,
            message: 'Workflow deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete workflow error:', error);
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * POST /api/saas-workflows/:id/clone
 * Clone workflow
 */
router.post('/:id/clone', checkWorkflowLimit, async (req: AuthRequest, res: Response) => {
    try {
        const { targetWorkspaceId, newName } = req.body;

        if (!targetWorkspaceId) {
            return res.status(400).json({
                success: false,
                message: 'targetWorkspaceId is required',
            });
        }

        const workflow = await prismaWorkflowService.cloneWorkflow(
            req.params.id,
            targetWorkspaceId,
            req.user!.userId,
            newName
        );

        res.status(201).json({
            success: true,
            data: workflow,
        });
    } catch (error: any) {
        console.error('Clone workflow error:', error);
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * GET /api/saas-workflows/:id/versions
 * Get workflow versions
 */
router.get('/:id/versions', async (req: AuthRequest, res: Response) => {
    try {
        const versions = await prismaWorkflowService.getWorkflowVersions(
            req.params.id,
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            data: versions,
        });
    } catch (error: any) {
        console.error('Get versions error:', error);
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * POST /api/saas-workflows/:id/restore/:version
 * Restore workflow version
 */
router.post('/:id/restore/:version', async (req: AuthRequest, res: Response) => {
    try {
        const workflow = await prismaWorkflowService.restoreVersion(
            req.params.id,
            parseInt(req.params.version, 10),
            req.user!.userId
        );

        res.status(200).json({
            success: true,
            data: workflow,
        });
    } catch (error: any) {
        console.error('Restore version error:', error);
        res.status(403).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
