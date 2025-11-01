import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import axios from 'axios';

const prisma = new PrismaClient();

export interface ExecutionResult {
  output: any;
  logs: string[];
  nodeExecutions: number;
}

/**
 * Workflow Executor
 * Parses and executes n8n workflow JSON
 */
export class WorkflowExecutor {
  private workflowJson: any;
  private workspaceId: string;
  private logs: string[];
  private nodeExecutions: number;
  private nodeOutputs: Map<string, any>;

  constructor(workflowJson: any, workspaceId: string) {
    this.workflowJson = workflowJson;
    this.workspaceId = workspaceId;
    this.logs = [];
    this.nodeExecutions = 0;
    this.nodeOutputs = new Map();
  }

  /**
   * Execute the workflow
   */
  async execute(inputData: any = {}): Promise<ExecutionResult> {
    this.log('🚀 Starting workflow execution');
    this.log(`Workflow: ${this.workflowJson.name || 'Unnamed'}`);

    const nodes = this.workflowJson.nodes || [];
    this.log(`Found ${nodes.length} nodes to execute`);

    try {
      // Build execution order (topological sort)
      const executionOrder = this.buildExecutionOrder(nodes);
      this.log(`Execution order: ${executionOrder.map(n => n.name).join(' → ')}`);

      // Execute nodes in order
      for (const node of executionOrder) {
        await this.executeNode(node, inputData);
      }

      this.log('✅ Workflow execution completed successfully');

      return {
        output: Object.fromEntries(this.nodeOutputs),
        logs: this.logs,
        nodeExecutions: this.nodeExecutions,
      };
    } catch (error: any) {
      this.log(`❌ Workflow execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: any, inputData: any): Promise<any> {
    const nodeName = node.name;
    const nodeType = node.type || 'unknown';

    this.log(`\n📍 Executing node: ${nodeName} (${nodeType})`);
    this.nodeExecutions++;

    try {
      // Get input from previous nodes
      const nodeInput = this.getNodeInput(node, inputData);

      // Execute based on node type
      let result;

      if (nodeType.includes('httpRequest') || nodeType.includes('HttpRequest')) {
        result = await this.executeHttpRequest(node, nodeInput);
      } else if (nodeType.includes('webhook')) {
        result = this.executeWebhook(node, nodeInput);
      } else if (nodeType.includes('set') || nodeType.includes('Set')) {
        result = this.executeSet(node, nodeInput);
      } else if (nodeType.includes('if') || nodeType.includes('If')) {
        result = this.executeIf(node, nodeInput);
      } else if (nodeType.includes('slack')) {
        result = await this.executeSlack(node, nodeInput);
      } else if (nodeType.includes('gmail') || nodeType.includes('Gmail')) {
        result = await this.executeGmail(node, nodeInput);
      } else {
        // Default handler for unknown nodes
        this.log(`⚠️  Unknown node type: ${nodeType}`);
        result = { message: `Node type ${nodeType} not yet implemented`, nodeType };
      }

      // Store node output
      this.nodeOutputs.set(nodeName, result);
      this.log(`✅ Node completed: ${nodeName}`);

      return result;
    } catch (error: any) {
      this.log(`❌ Node failed: ${nodeName} - ${error.message}`);
      throw new Error(`Node ${nodeName} failed: ${error.message}`);
    }
  }

  /**
   * Execute HTTP Request node
   */
  private async executeHttpRequest(node: any, input: any): Promise<any> {
    const params = node.parameters || {};
    const url = params.url || params.requestUrl || '';
    const method = (params.method || params.requestMethod || 'GET').toUpperCase();
    const headers = params.headers || {};
    const body = params.body || params.bodyParameters || null;

    this.log(`  HTTP ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body,
        timeout: 30000, // 30 second timeout
      });

      this.log(`  Response: ${response.status} ${response.statusText}`);

      return {
        statusCode: response.status,
        headers: response.headers,
        body: response.data,
      };
    } catch (error: any) {
      this.log(`  HTTP Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute Webhook node (trigger)
   */
  private executeWebhook(node: any, input: any): any {
    this.log(`  Webhook trigger - using input data`);
    return input || {};
  }

  /**
   * Execute Set node (data transformation)
   */
  private executeSet(node: any, input: any): any {
    const params = node.parameters || {};
    const values = params.values || {};

    this.log(`  Setting ${Object.keys(values).length} values`);

    const output: any = {};
    for (const [key, value] of Object.entries(values)) {
      output[key] = value;
    }

    return output;
  }

  /**
   * Execute If node (conditional)
   */
  private executeIf(node: any, input: any): any {
    const params = node.parameters || {};
    const conditions = params.conditions || {};

    // Simple implementation - just return input
    this.log(`  Evaluating conditions`);
    
    return {
      ...input,
      conditionMet: true,
    };
  }

  /**
   * Execute Slack node
   */
  private async executeSlack(node: any, input: any): Promise<any> {
    const params = node.parameters || {};
    const message = params.text || params.message || 'Hello from AutomateLanka!';
    const channel = params.channel || '#general';

    this.log(`  Would send Slack message to ${channel}`);
    this.log(`  Message: ${message}`);

    // In production, you would:
    // 1. Get Slack credentials from integrations table
    // 2. Decrypt credentials
    // 3. Make actual Slack API call
    
    return {
      ok: true,
      channel,
      message,
      ts: Date.now().toString(),
      simulated: true,
    };
  }

  /**
   * Execute Gmail node
   */
  private async executeGmail(node: any, input: any): Promise<any> {
    const params = node.parameters || {};
    const to = params.toEmail || params.to || '';
    const subject = params.subject || 'Email from AutomateLanka';
    const message = params.text || params.message || '';

    this.log(`  Would send email to ${to}`);
    this.log(`  Subject: ${subject}`);

    // In production, you would:
    // 1. Get Gmail credentials from integrations table
    // 2. Decrypt credentials
    // 3. Make actual Gmail API call

    return {
      messageId: `sim-${Date.now()}`,
      to,
      subject,
      sent: true,
      simulated: true,
    };
  }

  /**
   * Get input for a node from previous nodes
   */
  private getNodeInput(node: any, workflowInput: any): any {
    // Get connections to this node
    const connections = this.workflowJson.connections || {};
    
    // Find nodes that output to this node
    const inputs: any[] = [];

    for (const [sourceName, sourceConnections] of Object.entries(connections)) {
      const outputs = sourceConnections as any;
      
      // Check main output
      if (outputs.main) {
        for (const connection of outputs.main) {
          if (connection.node === node.name) {
            const sourceOutput = this.nodeOutputs.get(sourceName);
            if (sourceOutput) {
              inputs.push(sourceOutput);
            }
          }
        }
      }
    }

    // If no inputs from previous nodes, use workflow input
    if (inputs.length === 0) {
      return workflowInput;
    }

    // Return last input (simplified - in real n8n, this is more complex)
    return inputs[inputs.length - 1];
  }

  /**
   * Build execution order using topological sort
   */
  private buildExecutionOrder(nodes: any[]): any[] {
    const connections = this.workflowJson.connections || {};
    const visited = new Set<string>();
    const order: any[] = [];

    // Simple DFS-based topological sort
    const visit = (nodeName: string) => {
      if (visited.has(nodeName)) return;
      visited.add(nodeName);

      const node = nodes.find(n => n.name === nodeName);
      if (!node) return;

      // Visit dependencies first (nodes that output to this node)
      for (const [sourceName, sourceConnections] of Object.entries(connections)) {
        const outputs = sourceConnections as any;
        
        if (outputs.main) {
          for (const connection of outputs.main) {
            if (connection.node === nodeName) {
              visit(sourceName);
            }
          }
        }
      }

      order.push(node);
    };

    // Start with trigger nodes (nodes with no inputs)
    for (const node of nodes) {
      if (node.type?.includes('trigger') || node.type?.includes('webhook')) {
        visit(node.name);
      }
    }

    // Visit remaining nodes
    for (const node of nodes) {
      visit(node.name);
    }

    return order;
  }

  /**
   * Add log message
   */
  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }
}

