/**
 * Enhanced node templates with comprehensive configuration options
 */

export const enhancedNodeTemplates = [
  // TRIGGERS
  {
    id: 'webhook-trigger',
    type: 'webhook',
    category: 'trigger',
    name: 'Webhook',
    description: 'Trigger workflow when a webhook is received',
    icon: 'Webhook',
    color: '#10b981',
    complexity: 'beginner',
    inputs: [],
    outputs: [
      { id: 'webhook-data', name: 'Webhook Data', type: 'object' },
      { id: 'headers', name: 'Headers', type: 'object' },
      { id: 'query-params', name: 'Query Parameters', type: 'object' }
    ],
    config: [
      { 
        name: 'url', 
        type: 'string', 
        label: 'Webhook URL', 
        required: true,
        description: 'The endpoint URL for receiving webhooks'
      },
      { 
        name: 'method', 
        type: 'select', 
        label: 'HTTP Method', 
        required: true, 
        options: [
          { value: 'POST', label: 'POST' },
          { value: 'GET', label: 'GET' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ]
      },
      {
        name: 'authentication',
        type: 'select',
        label: 'Authentication',
        options: [
          { value: 'none', label: 'None' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'api_key', label: 'API Key' }
        ]
      },
      {
        name: 'secret_token',
        type: 'string',
        label: 'Secret Token',
        description: 'Optional secret token for webhook verification'
      }
    ],
  },

  {
    id: 'schedule-trigger',
    type: 'schedule',
    category: 'trigger',
    name: 'Schedule',
    description: 'Trigger workflow on a schedule using cron expressions',
    icon: 'Clock',
    color: '#8b5cf6',
    complexity: 'intermediate',
    inputs: [],
    outputs: [
      { id: 'timestamp', name: 'Timestamp', type: 'datetime' },
      { id: 'execution-count', name: 'Execution Count', type: 'number' }
    ],
    config: [
      { 
        name: 'cron', 
        type: 'cron', 
        label: 'Cron Expression', 
        required: true,
        description: 'Schedule using cron syntax (e.g., 0 9 * * 1 for every Monday at 9 AM)'
      },
      { 
        name: 'timezone', 
        type: 'select', 
        label: 'Timezone', 
        options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Chicago', label: 'Central Time' },
          { value: 'America/Denver', label: 'Mountain Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' },
          { value: 'Europe/London', label: 'London' },
          { value: 'Europe/Paris', label: 'Paris' },
          { value: 'Asia/Tokyo', label: 'Tokyo' }
        ]
      },
      {
        name: 'enabled',
        type: 'boolean',
        label: 'Enabled',
        description: 'Whether the schedule is active'
      },
      {
        name: 'max_executions',
        type: 'number',
        label: 'Max Executions',
        description: 'Maximum number of times to execute (0 = unlimited)',
        min: 0
      }
    ],
  },

  {
    id: 'email-trigger',
    type: 'email-received',
    category: 'trigger',
    name: 'Email Received',
    description: 'Trigger when an email is received matching specified criteria',
    icon: 'Mail',
    color: '#06b6d4',
    complexity: 'intermediate',
    inputs: [],
    outputs: [
      { id: 'subject', name: 'Subject', type: 'string' },
      { id: 'body', name: 'Body', type: 'string' },
      { id: 'sender', name: 'Sender', type: 'string' },
      { id: 'recipients', name: 'Recipients', type: 'array' },
      { id: 'attachments', name: 'Attachments', type: 'array' }
    ],
    config: [
      { 
        name: 'email', 
        type: 'string', 
        label: 'Email Address', 
        required: true,
        description: 'Email address to monitor'
      },
      { 
        name: 'subject_filter', 
        type: 'string', 
        label: 'Subject Filter',
        description: 'Only trigger for emails with subjects containing this text'
      },
      {
        name: 'sender_filter',
        type: 'string',
        label: 'Sender Filter',
        description: 'Only trigger for emails from specific senders'
      },
      {
        name: 'include_attachments',
        type: 'boolean',
        label: 'Include Attachments',
        description: 'Whether to process email attachments'
      }
    ],
  },

  // ACTIONS
  {
    id: 'send-email',
    type: 'send-email',
    category: 'action',
    name: 'Send Email',
    description: 'Send an email message with full customization options',
    icon: 'Send',
    color: '#f59e0b',
    complexity: 'beginner',
    inputs: [
      { id: 'to', name: 'To Recipients', type: 'array', required: true },
      { id: 'subject', name: 'Subject', type: 'string', required: true },
      { id: 'body', name: 'Body', type: 'string', required: true },
      { id: 'cc', name: 'CC Recipients', type: 'array' },
      { id: 'bcc', name: 'BCC Recipients', type: 'array' },
      { id: 'attachments', name: 'Attachments', type: 'array' }
    ],
    outputs: [
      { id: 'message-id', name: 'Message ID', type: 'string' },
      { id: 'status', name: 'Status', type: 'string' }
    ],
    config: [
      {
        name: 'provider',
        type: 'select',
        label: 'Email Provider',
        required: true,
        options: [
          { value: 'smtp', label: 'SMTP' },
          { value: 'sendgrid', label: 'SendGrid' },
          { value: 'mailgun', label: 'Mailgun' },
          { value: 'ses', label: 'Amazon SES' }
        ]
      },
      {
        name: 'html',
        type: 'boolean',
        label: 'HTML Format',
        description: 'Send as HTML email'
      },
      {
        name: 'priority',
        type: 'select',
        label: 'Priority',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'High' }
        ]
      }
    ],
  },

  {
    id: 'http-request',
    type: 'http-request',
    category: 'action',
    name: 'HTTP Request',
    description: 'Make HTTP requests to APIs with full configuration options',
    icon: 'Globe',
    color: '#3b82f6',
    complexity: 'intermediate',
    inputs: [
      { id: 'url', name: 'URL', type: 'string', required: true },
      { id: 'headers', name: 'Headers', type: 'object' },
      { id: 'body', name: 'Body', type: 'object' },
      { id: 'query-params', name: 'Query Parameters', type: 'object' }
    ],
    outputs: [
      { id: 'response', name: 'Response', type: 'object' },
      { id: 'status', name: 'Status Code', type: 'number' },
      { id: 'headers', name: 'Response Headers', type: 'object' }
    ],
    config: [
      { 
        name: 'method', 
        type: 'select', 
        label: 'HTTP Method', 
        required: true, 
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
          { value: 'PATCH', label: 'PATCH' }
        ]
      },
      { 
        name: 'timeout', 
        type: 'number', 
        label: 'Timeout (ms)', 
        min: 1000, 
        max: 60000,
        description: 'Request timeout in milliseconds'
      },
      {
        name: 'retry_attempts',
        type: 'number',
        label: 'Retry Attempts',
        min: 0,
        max: 5,
        description: 'Number of retry attempts on failure'
      },
      {
        name: 'follow_redirects',
        type: 'boolean',
        label: 'Follow Redirects',
        description: 'Whether to follow HTTP redirects'
      }
    ],
  },

  {
    id: 'database-insert',
    type: 'database-insert',
    category: 'action',
    name: 'Database Insert',
    description: 'Insert data into a database with conflict resolution',
    icon: 'Database',
    color: '#059669',
    complexity: 'advanced',
    inputs: [
      { id: 'data', name: 'Data', type: 'object', required: true }
    ],
    outputs: [
      { id: 'record-id', name: 'Record ID', type: 'string' },
      { id: 'affected-rows', name: 'Affected Rows', type: 'number' }
    ],
    config: [
      { 
        name: 'connection', 
        type: 'select', 
        label: 'Database Connection', 
        required: true,
        options: [
          { value: 'default', label: 'Default Database' },
          { value: 'postgres', label: 'PostgreSQL' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'mongodb', label: 'MongoDB' }
        ]
      },
      { 
        name: 'table', 
        type: 'string', 
        label: 'Table/Collection Name', 
        required: true,
        description: 'Name of the table or collection to insert into'
      },
      {
        name: 'on_conflict',
        type: 'select',
        label: 'On Conflict',
        options: [
          { value: 'error', label: 'Throw Error' },
          { value: 'ignore', label: 'Ignore' },
          { value: 'update', label: 'Update' },
          { value: 'replace', label: 'Replace' }
        ]
      }
    ],
  },

  // CONDITIONS
  {
    id: 'condition',
    type: 'condition',
    category: 'condition',
    name: 'Condition',
    description: 'Branch workflow based on conditional logic',
    icon: 'GitBranch',
    color: '#dc2626',
    complexity: 'beginner',
    inputs: [
      { id: 'value', name: 'Value', type: 'any', required: true }
    ],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' }
    ],
    config: [
      { 
        name: 'operator', 
        type: 'select', 
        label: 'Operator', 
        required: true, 
        options: [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'greater_equal', label: 'Greater Than or Equal' },
          { value: 'less_equal', label: 'Less Than or Equal' },
          { value: 'contains', label: 'Contains' },
          { value: 'not_contains', label: 'Does Not Contain' },
          { value: 'starts_with', label: 'Starts With' },
          { value: 'ends_with', label: 'Ends With' },
          { value: 'is_empty', label: 'Is Empty' },
          { value: 'is_not_empty', label: 'Is Not Empty' }
        ]
      },
      { 
        name: 'compare_value', 
        type: 'string', 
        label: 'Compare Value',
        description: 'Value to compare against'
      },
      {
        name: 'case_sensitive',
        type: 'boolean',
        label: 'Case Sensitive',
        description: 'Whether string comparisons are case sensitive'
      }
    ],
  },

  {
    id: 'multi-condition',
    type: 'multi-condition',
    category: 'condition',
    name: 'Multi-Condition',
    description: 'Evaluate multiple conditions with AND/OR logic',
    icon: 'GitBranch',
    color: '#dc2626',
    complexity: 'advanced',
    inputs: [
      { id: 'data', name: 'Data', type: 'object', required: true }
    ],
    outputs: [
      { id: 'true', name: 'True', type: 'any' },
      { id: 'false', name: 'False', type: 'any' }
    ],
    config: [
      {
        name: 'logic_operator',
        type: 'select',
        label: 'Logic Operator',
        required: true,
        options: [
          { value: 'and', label: 'AND (all conditions must be true)' },
          { value: 'or', label: 'OR (any condition must be true)' }
        ]
      },
      {
        name: 'conditions',
        type: 'json',
        label: 'Conditions',
        required: true,
        description: 'Array of condition objects'
      }
    ],
  },

  // UTILITIES
  {
    id: 'delay',
    type: 'delay',
    category: 'utility',
    name: 'Delay',
    description: 'Add a delay to the workflow execution',
    icon: 'Timer',
    color: '#6b7280',
    complexity: 'beginner',
    inputs: [
      { id: 'input', name: 'Input', type: 'any' }
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'any' }
    ],
    config: [
      { 
        name: 'duration', 
        type: 'number', 
        label: 'Duration', 
        required: true, 
        min: 1,
        description: 'Duration to delay'
      },
      {
        name: 'unit',
        type: 'select',
        label: 'Time Unit',
        required: true,
        options: [
          { value: 'seconds', label: 'Seconds' },
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' }
        ]
      }
    ],
  },

  {
    id: 'transform-data',
    type: 'transform',
    category: 'utility',
    name: 'Transform Data',
    description: 'Transform data using JavaScript with schema validation',
    icon: 'Code',
    color: '#7c3aed',
    complexity: 'advanced',
    inputs: [
      { id: 'input', name: 'Input', type: 'any', required: true }
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'any' }
    ],
    config: [
      { 
        name: 'code', 
        type: 'code', 
        label: 'JavaScript Code', 
        required: true,
        description: 'JavaScript code to transform the data. Use "input" variable for input data, return the transformed result.'
      },
      {
        name: 'input_schema',
        type: 'json',
        label: 'Input Schema',
        description: 'JSON schema for input validation'
      },
      {
        name: 'output_schema',
        type: 'json',
        label: 'Output Schema',
        description: 'JSON schema for output validation'
      }
    ],
  },

  {
    id: 'logger',
    type: 'logger',
    category: 'utility',
    name: 'Logger',
    description: 'Log messages and data for debugging and monitoring',
    icon: 'FileText',
    color: '#6b7280',
    complexity: 'beginner',
    inputs: [
      { id: 'message', name: 'Message', type: 'string' },
      { id: 'data', name: 'Data', type: 'any' }
    ],
    outputs: [
      { id: 'output', name: 'Output', type: 'any' }
    ],
    config: [
      {
        name: 'level',
        type: 'select',
        label: 'Log Level',
        required: true,
        options: [
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' }
        ]
      },
      {
        name: 'include_timestamp',
        type: 'boolean',
        label: 'Include Timestamp',
        description: 'Whether to include timestamp in log messages'
      },
      {
        name: 'include_data',
        type: 'boolean',
        label: 'Include Data',
        description: 'Whether to include input data in log'
      }
    ],
  },

  {
    id: 'data-mapper',
    type: 'data-mapper',
    category: 'utility',
    name: 'Data Mapper',
    description: 'Map and transform data fields between different formats',
    icon: 'ArrowRightLeft',
    color: '#7c3aed',
    complexity: 'intermediate',
    inputs: [
      { id: 'input', name: 'Input Data', type: 'object', required: true }
    ],
    outputs: [
      { id: 'output', name: 'Mapped Data', type: 'object' }
    ],
    config: [
      {
        name: 'mapping',
        type: 'json',
        label: 'Field Mapping',
        required: true,
        description: 'JSON object defining how to map input fields to output fields'
      },
      {
        name: 'default_values',
        type: 'json',
        label: 'Default Values',
        description: 'Default values for missing fields'
      },
      {
        name: 'strict_mode',
        type: 'boolean',
        label: 'Strict Mode',
        description: 'Only include mapped fields in output'
      }
    ],
  }
];

// Export both for backward compatibility
export const nodeTemplates = enhancedNodeTemplates;