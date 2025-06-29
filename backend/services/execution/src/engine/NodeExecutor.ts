import axios from 'axios';
import { VM } from 'vm2';
import nodemailer from 'nodemailer';
import { Database } from '@flowforge/shared/src/utils/database';
import { RedisClient } from '@flowforge/shared/src/utils/redis';
import logger from '@flowforge/shared/src/utils/logger';

export class NodeExecutor {
  constructor(private db: Database, private redis: RedisClient) {}

  async execute(node: any, context: any): Promise<any> {
    switch (node.type) {
      case 'webhook':
        return this.executeWebhookTrigger(node, context);
      case 'schedule':
        return this.executeScheduleTrigger(node, context);
      case 'email-received':
        return this.executeEmailTrigger(node, context);
      case 'send-email':
        return this.executeSendEmail(node, context);
      case 'http-request':
        return this.executeHttpRequest(node, context);
      case 'database-insert':
        return this.executeDatabaseInsert(node, context);
      case 'condition':
        return this.executeCondition(node, context);
      case 'delay':
        return this.executeDelay(node, context);
      case 'transform':
        return this.executeTransform(node, context);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async executeWebhookTrigger(node: any, context: any): Promise<any> {
    // Webhook trigger - return the trigger data
    return context.triggerData;
  }

  private async executeScheduleTrigger(node: any, context: any): Promise<any> {
    // Schedule trigger - return current timestamp
    return { timestamp: new Date().toISOString() };
  }

  private async executeEmailTrigger(node: any, context: any): Promise<any> {
    // Email trigger - return email data from trigger
    return context.triggerData;
  }

  private async executeSendEmail(node: any, context: any): Promise<any> {
    const { to, subject, body } = this.resolveInputs(node, context);
    const config = node.config || {};

    // Create transporter based on provider
    let transporter;
    switch (config.provider) {
      case 'smtp':
        transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        break;
      case 'sendgrid':
        transporter = nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@flowforge.com',
      to,
      subject,
      html: body
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    };
  }

  private async executeHttpRequest(node: any, context: any): Promise<any> {
    const { url, headers, body } = this.resolveInputs(node, context);
    const config = node.config || {};

    const requestConfig: any = {
      method: config.method || 'GET',
      url,
      timeout: config.timeout || 5000
    };

    if (headers) {
      requestConfig.headers = headers;
    }

    if (body && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
      requestConfig.data = body;
    }

    try {
      const response = await axios(requestConfig);
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error: any) {
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          error: true
        };
      }
      throw error;
    }
  }

  private async executeDatabaseInsert(node: any, context: any): Promise<any> {
    const { data } = this.resolveInputs(node, context);
    const config = node.config || {};

    // This is a simplified implementation
    // In production, you'd want proper connection management and support for different databases
    const tableName = config.table;
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');

    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const result = await this.db.query(query, values);
    
    return {
      recordId: result.rows[0]?.id || 'inserted',
      insertedData: data
    };
  }

  private async executeCondition(node: any, context: any): Promise<any> {
    const { value } = this.resolveInputs(node, context);
    const config = node.config || {};

    const operator = config.operator;
    const compareValue = config.compare_value;

    let result = false;

    switch (operator) {
      case 'equals':
        result = value == compareValue;
        break;
      case 'not_equals':
        result = value != compareValue;
        break;
      case 'greater_than':
        result = Number(value) > Number(compareValue);
        break;
      case 'less_than':
        result = Number(value) < Number(compareValue);
        break;
      case 'contains':
        result = String(value).includes(String(compareValue));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return {
      condition: result,
      value,
      compareValue,
      operator
    };
  }

  private async executeDelay(node: any, context: any): Promise<any> {
    const { input } = this.resolveInputs(node, context);
    const config = node.config || {};

    const duration = config.duration * 1000; // Convert to milliseconds

    await new Promise(resolve => setTimeout(resolve, duration));

    return {
      output: input,
      delayDuration: duration
    };
  }

  private async executeTransform(node: any, context: any): Promise<any> {
    const { input } = this.resolveInputs(node, context);
    const config = node.config || {};

    const code = config.code;

    // Use VM2 for safe code execution
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        input,
        context: context.nodeOutputs,
        console: {
          log: (...args: any[]) => logger.info('Transform log', { args })
        }
      }
    });

    try {
      const result = vm.run(`
        (function() {
          ${code}
        })()
      `);

      return {
        output: result,
        input
      };
    } catch (error: any) {
      throw new Error(`Transform execution failed: ${error.message}`);
    }
  }

  private resolveInputs(node: any, context: any): any {
    const inputs: any = {};

    // Resolve input values from node data and context
    Object.entries(node.data).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Template variable - resolve from context
        const variablePath = value.slice(2, -2).trim();
        inputs[key] = this.resolveVariable(variablePath, context);
      } else {
        inputs[key] = value;
      }
    });

    return inputs;
  }

  private resolveVariable(path: string, context: any): any {
    const parts = path.split('.');
    let value = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}