import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Bull queue configuration for workflow execution
 */
export const workflowQueue = new Queue('workflow-execution', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
    timeout: 300000, // 5 minutes timeout
  },
  settings: {
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
    maxStalledCount: 2,
  },
});

/**
 * Queue event handlers
 */
workflowQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

workflowQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

workflowQueue.on('active', (job) => {
  console.log(`Job ${job.id} has started`);
});

workflowQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

workflowQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err.message);
});

workflowQueue.on('stalled', (jobId) => {
  console.warn(`Job ${jobId} has stalled`);
});

export default workflowQueue;

