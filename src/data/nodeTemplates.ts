import { NodeTemplate } from '../types/workflow';

export const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    id: 'webhook-trigger',
    type: 'webhook',
    category: 'trigger',
    name: 'Webhook',
    description: 'Trigger workflow when a webhook is received',
    icon: 'Webhook',
    color: '#10b981',
    inputs: [],
    outputs: [{ id: 'webhook-data', name: 'Webhook Data', type: 'object' }],
    config: [
      { id: 'url', name: 'url', type: 'string', label: 'Webhook URL', required: true },
      { id: 'method', name: 'method', type: 'select', label: 'HTTP Method', required: true, options: [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' },
        { value: 'PUT', label: 'PUT' },
      ]},
    ],
  },
  {
    id: 'schedule-trigger',
    type: 'schedule',
    category: 'trigger',
    name: 'Schedule',
    description: 'Trigger workflow on a schedule',
    icon: 'Clock',
    color: '#8b5cf6',
    inputs: [],
    outputs: [{ id: 'timestamp', name: 'Timestamp', type: 'datetime' }],
    config: [
      { id: 'cron', name: 'cron', type: 'string', label: 'Cron Expression', required: true },
      { id: 'timezone', name: 'timezone', type: 'string', label: 'Timezone', required: false, defaultValue: 'UTC' },
    ],
  },
  {
    id: 'email-trigger',
    type: 'email-received',
    category: 'trigger',
    name: 'Email Received',
    description: 'Trigger when an email is received',
    icon: 'Mail',
    color: '#06b6d4',
    inputs: [],
    outputs: [
      { id: 'subject', name: 'Subject', type: 'string' },
      { id: 'body', name: 'Body', type: 'string' },
      { id: 'sender', name: 'Sender', type: 'string' },
    ],
    config: [
      { id: 'email', name: 'email', type: 'string', label: 'Email Address', required: true },
      { id: 'filter', name: 'filter', type: 'string', label: 'Subject Filter', required: false },
    ],
  },

  // Actions
  {
    id: 'send-email',
    type: 'send-email',
    category: 'action',
    name: 'Send Email',
    description: 'Send an email message',
    icon: 'Send',
    color: '#f59e0b',
    inputs: [
      { id: 'to', name: 'To', type: 'string', required: true },
      { id: 'subject', name: 'Subject', type: 'string', required: true },
      { id: 'body', name: 'Body', type: 'string', required: true },
    ],
    outputs: [{ id: 'message-id', name: 'Message ID', type: 'string' }],
    config: [
      { id: 'provider', name: 'provider', type: 'select', label: 'Email Provider', required: true, options: [
        { value: 'smtp', label: 'SMTP' },
        { value: 'sendgrid', label: 'SendGrid' },
        { value: 'mailgun', label: 'Mailgun' },
      ]},
    ],
  },
  {
    id: 'http-request',
    type: 'http-request',
    category: 'action',
    name: 'HTTP Request',
    description: 'Make an HTTP request to an API',
    icon: 'Globe',
    color: '#3b82f6',
    inputs: [
      { id: 'url', name: 'URL', type: 'string', required: true },
      { id: 'headers', name: 'Headers', type: 'object', required: false },
      { id: 'body', name: 'Body', type: 'object', required: false },
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'object' },
      { id: 'status', name: 'Status Code', type: 'number' },
    ],
    config: [
      { id: 'method', name: 'method', type: 'select', label: 'HTTP Method', required: true, options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ]},
      { id: 'timeout', name: 'timeout', type: 'number', label: 'Timeout (ms)', required: false, defaultValue: 5000 },
    ],
  },
  {
    id: 'database-insert',
    type: 'database-insert',
    category: 'action',
    name: 'Database Insert',
    description: 'Insert data into a database',
    icon: 'Database',
    color: '#059669',
    inputs: [
      { id: 'data', name: 'Data', type: 'object', required: true },
    ],
    outputs: [{ id: 'record-id', name: 'Record ID', type: 'string' }],
    config: [
      { id: 'connection', name: 'connection', type: 'string', label: 'Database Connection', required: true },
      { id: 'table', name: 'table', type: 'string', label: 'Table Name', required: true },
    ],
  },

  // Conditions
  {
    id: 'condition',
    type: 'condition',
    category: 'condition',
    name: 'Condition',
    description: 'Branch workflow based on a condition',
    icon: 'GitBranch',
    color: '#dc2626',
    inputs: [
      { id: 'value', name: 'Value', type: 'any', required: true },
    ],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' },
    ],
    config: [
      { id: 'operator', name: 'operator', type: 'select', label: 'Operator', required: true, options: [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'contains', label: 'Contains' },
      ]},
      { id: 'compare_value', name: 'compare_value', type: 'string', label: 'Compare Value', required: true },
    ],
  },

  // Utilities
  {
    id: 'delay',
    type: 'delay',
    category: 'utility',
    name: 'Delay',
    description: 'Add a delay to the workflow',
    icon: 'Timer',
    color: '#6b7280',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: false }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    config: [
      { id: 'duration', name: 'duration', type: 'number', label: 'Duration (seconds)', required: true },
    ],
  },
  {
    id: 'transform-data',
    type: 'transform',
    category: 'utility',
    name: 'Transform Data',
    description: 'Transform data using JavaScript',
    icon: 'Code',
    color: '#7c3aed',
    inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
    outputs: [{ id: 'output', name: 'Output', type: 'any' }],
    config: [
      { id: 'code', name: 'code', type: 'string', label: 'JavaScript Code', required: true },
    ],
  },
];