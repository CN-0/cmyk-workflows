import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff, Plus, Trash2, Calendar, Clock } from 'lucide-react';

const ConfigField = ({ field, value, onChange, errors = {} }) => {
  const [showPassword, setShowPassword] = useState(false);

  const renderField = () => {
    switch (field.type) {
      case 'string':
        return (
          <input
            type={field.name === 'password' || field.name === 'secret' ? (showPassword ? 'text' : 'password') : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            min={field.min}
            max={field.max}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-gray-700">{value ? 'Enabled' : 'Disabled'}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required={field.required}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.value));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'code':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={field.placeholder || 'Enter JavaScript code...'}
            required={field.required}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            required={field.required}
          />
        );

      case 'cron':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="0 0 * * *"
              required={field.required}
            />
            <div className="text-xs text-gray-500">
              <p>Examples:</p>
              <p>• 0 0 * * * - Daily at midnight</p>
              <p>• 0 9 * * 1 - Every Monday at 9 AM</p>
              <p>• */15 * * * * - Every 15 minutes</p>
            </div>
          </div>
        );

      case 'json':
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {
                onChange(e.target.value);
              }
            }}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder='{"key": "value"}'
            required={field.required}
          />
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...arrayValue];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`${field.label} ${index + 1}`}
                />
                <button
                  onClick={() => {
                    const newArray = arrayValue.filter((_, i) => i !== index);
                    onChange(newArray);
                  }}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange([...arrayValue, ''])}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
              Add {field.label}
            </button>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[field.name] ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {renderField()}
        {(field.name === 'password' || field.name === 'secret') && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      
      {errors[field.name] && (
        <p className="text-xs text-red-600">{errors[field.name]}</p>
      )}
    </div>
  );
};

const NodeConfigPanel = ({ node, onUpdate, onClose }) => {
  const [config, setConfig] = useState(node.config || {});
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    setConfig(node.config || {});
  }, [node]);

  const getNodeFields = () => {
    const baseFields = [
      {
        name: 'label',
        type: 'string',
        label: 'Node Label',
        required: true,
        description: 'Display name for this node'
      }
    ];

    switch (node.type) {
      case 'webhook':
        return [
          ...baseFields,
          {
            name: 'url',
            type: 'string',
            label: 'Webhook URL',
            required: true,
            description: 'The URL endpoint for the webhook'
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
            name: 'headers',
            type: 'json',
            label: 'Headers',
            description: 'HTTP headers to include with the request'
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
          }
        ];

      case 'schedule':
        return [
          ...baseFields,
          {
            name: 'cron',
            type: 'cron',
            label: 'Cron Expression',
            required: true,
            description: 'Schedule using cron syntax'
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
          }
        ];

      case 'send-email':
        return [
          ...baseFields,
          {
            name: 'to',
            type: 'array',
            label: 'To Recipients',
            required: true,
            description: 'Email addresses to send to'
          },
          {
            name: 'cc',
            type: 'array',
            label: 'CC Recipients',
            description: 'Email addresses to CC'
          },
          {
            name: 'bcc',
            type: 'array',
            label: 'BCC Recipients',
            description: 'Email addresses to BCC'
          },
          {
            name: 'subject',
            type: 'string',
            label: 'Subject',
            required: true,
            description: 'Email subject line'
          },
          {
            name: 'body',
            type: 'textarea',
            label: 'Body',
            required: true,
            description: 'Email body content'
          },
          {
            name: 'html',
            type: 'boolean',
            label: 'HTML Format',
            description: 'Send as HTML email'
          },
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
          }
        ];

      case 'http-request':
        return [
          ...baseFields,
          {
            name: 'url',
            type: 'string',
            label: 'URL',
            required: true,
            description: 'The API endpoint URL'
          },
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
            name: 'headers',
            type: 'json',
            label: 'Headers',
            description: 'HTTP headers to include'
          },
          {
            name: 'body',
            type: 'json',
            label: 'Request Body',
            description: 'Request body data'
          },
          {
            name: 'timeout',
            type: 'number',
            label: 'Timeout (ms)',
            min: 1000,
            max: 60000,
            description: 'Request timeout in milliseconds'
          }
        ];

      case 'condition':
        return [
          ...baseFields,
          {
            name: 'field',
            type: 'string',
            label: 'Field to Compare',
            required: true,
            description: 'The field or variable to evaluate'
          },
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
            name: 'value',
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
        ];

      case 'delay':
        return [
          ...baseFields,
          {
            name: 'duration',
            type: 'number',
            label: 'Duration (seconds)',
            required: true,
            min: 1,
            description: 'How long to delay execution'
          },
          {
            name: 'unit',
            type: 'select',
            label: 'Time Unit',
            options: [
              { value: 'seconds', label: 'Seconds' },
              { value: 'minutes', label: 'Minutes' },
              { value: 'hours', label: 'Hours' },
              { value: 'days', label: 'Days' }
            ]
          }
        ];

      case 'transform':
        return [
          ...baseFields,
          {
            name: 'code',
            type: 'code',
            label: 'JavaScript Code',
            required: true,
            description: 'JavaScript code to transform the data'
          },
          {
            name: 'input_schema',
            type: 'json',
            label: 'Input Schema',
            description: 'Expected input data structure'
          },
          {
            name: 'output_schema',
            type: 'json',
            label: 'Output Schema',
            description: 'Expected output data structure'
          }
        ];

      case 'database-insert':
        return [
          ...baseFields,
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
            description: 'Name of the table or collection'
          },
          {
            name: 'data_mapping',
            type: 'json',
            label: 'Data Mapping',
            required: true,
            description: 'Map input data to database fields'
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
        ];

      default:
        return baseFields;
    }
  };

  const validateConfig = () => {
    const fields = getNodeFields();
    const newErrors = {};

    fields.forEach(field => {
      if (field.required && (!config[field.name] || config[field.name] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === 'number' && config[field.name] !== undefined) {
        const value = Number(config[field.name]);
        if (isNaN(value)) {
          newErrors[field.name] = `${field.label} must be a number`;
        } else {
          if (field.min !== undefined && value < field.min) {
            newErrors[field.name] = `${field.label} must be at least ${field.min}`;
          }
          if (field.max !== undefined && value > field.max) {
            newErrors[field.name] = `${field.label} must be at most ${field.max}`;
          }
        }
      }

      if (field.type === 'json' && config[field.name]) {
        try {
          if (typeof config[field.name] === 'string') {
            JSON.parse(config[field.name]);
          }
        } catch {
          newErrors[field.name] = `${field.label} must be valid JSON`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onUpdate({ config, label: config.label || node.label });
    }
  };

  const handleConfigChange = (fieldName, value) => {
    setConfig(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const fields = getNodeFields();

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Configure Node</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">{node.type}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Data Flow
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'config' && (
          <div className="space-y-6">
            {fields.map((field) => (
              <ConfigField
                key={field.name}
                field={field}
                value={config[field.name]}
                onChange={(value) => handleConfigChange(field.name, value)}
                errors={errors}
              />
            ))}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Input Data</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(node.inputs || [], null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Output Data</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(node.outputs || [], null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Configuration</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;