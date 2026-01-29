import express from 'express';
import { webhookService } from '../services/webhookService';

const router = express.Router();

/**
 * Handle incoming webhooks
 * path can be anything, e.g. /my-webhook/123
 */
router.all('/:path(*)', async (req, res) => {
  try {
    const method = req.method;
    const path = req.params.path || ''; // The matched path part
    const headers = req.headers;
    const body = req.body;
    const query = req.query;

    console.log(`Webhook received: ${method} /${path}`);

    const executions = await webhookService.handleWebhook(
      method,
      path,
      headers,
      body,
      query
    );

    res.status(200).json({
      success: true,
      message: 'Webhook received',
      executions,
    });
  } catch (error: any) {
    console.error('Webhook error:', error.message);

    if (error.message.includes('No workflow found')) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error processing webhook',
    });
  }
});

export default router;
