import React, { useState } from 'react';
import { Code, Play, Eye, EyeOff, FileText, Download } from 'lucide-react';

const TransformNodeConfig = ({ config, onChange, errors }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  const codeTemplates = [
    {
      name: 'Basic Transform',
      code: `// Transform input data
return {
  ...input,
  processed: true,
  timestamp: new Date().toISOString()
};`
    },
    {
      name: 'Filter Array',
      code: `// Filter array items
if (Array.isArray(input.items)) {
  return {
    ...input,
    items: input.items.filter(item => item.active === true)
  };
}
return input;`
    },
    {
      name: 'Map Array',
      code: `// Transform array items
if (Array.isArray(input.items)) {
  return {
    ...input,
    items: input.items.map(item => ({
      ...item,
      fullName: \`\${item.firstName} \${item.lastName}\`
    }))
  };
}
return input;`
    },
    {
      name: 'Aggregate Data',
      code: `// Aggregate array data
if (Array.isArray(input.items)) {
  const total = input.items.reduce((sum, item) => sum + (item.value || 0), 0);
  const count = input.items.length;
  
  return {
    ...input,
    summary: {
      total,
      count,
      average: count > 0 ? total / count : 0
    }
  };
}
return input;`
    },
    {
      name: 'Format Data',
      code: `// Format and clean data
return {
  id: input.id,
  name: (input.name || '').trim().toLowerCase(),
  email: (input.email || '').trim().toLowerCase(),
  phone: (input.phone || '').replace(/[^0-9]/g, ''),
  createdAt: new Date().toISOString(),
  metadata: {
    source: 'workflow',
    processed: true
  }
};`
    }
  ];

  const testTransform = () => {
    try {
      const inputData = testInput ? JSON.parse(testInput) : {};
      const code = config.code || '';
      
      // Create a safe execution context
      const func = new Function('input', code);
      const result = func(inputData);
      
      setTestOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestOutput(`Error: ${error.message}`);
    }
  };

  const loadTemplate = (template) => {
    onChange('code', template.code);
  };

  const exportCode = () => {
    const blob = new Blob([config.code || ''], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transform-function.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Code Templates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Code Templates
        </label>
        <select
          onChange={(e) => {
            const template = codeTemplates.find(t => t.name === e.target.value);
            if (template) loadTemplate(template);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          defaultValue=""
        >
          <option value="">Select a template...</option>
          {codeTemplates.map(template => (
            <option key={template.name} value={template.name}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* JavaScript Code */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            <Code className="w-4 h-4 inline mr-1" />
            JavaScript Code *
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCode}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
              title="Export code"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>
        <textarea
          value={config.code || ''}
          onChange={(e) => onChange('code', e.target.value)}
          rows={12}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${
            errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder={`// Transform the input data
// Available variables: input (the input data)
// Return the transformed data

return {
  ...input,
  processed: true,
  timestamp: new Date().toISOString()
};`}
        />
        {errors.code && (
          <p className="text-xs text-red-600 mt-1">{errors.code}</p>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p className="font-medium mb-1">Available functions and variables:</p>
          <ul className="space-y-1">
            <li><code className="bg-gray-100 px-1 rounded">input</code> - The input data from previous nodes</li>
            <li><code className="bg-gray-100 px-1 rounded">console.log()</code> - Log messages for debugging</li>
            <li><code className="bg-gray-100 px-1 rounded">JSON.parse()</code>, <code className="bg-gray-100 px-1 rounded">JSON.stringify()</code> - JSON utilities</li>
            <li><code className="bg-gray-100 px-1 rounded">Date</code>, <code className="bg-gray-100 px-1 rounded">Math</code> - Standard JavaScript objects</li>
          </ul>
        </div>
      </div>

      {/* Test Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">Test Transform</h5>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Test
          </button>
        </div>

        {showPreview && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Input (JSON)
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder={`{
  "name": "John Doe",
  "email": "john@example.com",
  "items": [1, 2, 3]
}`}
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={testTransform}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                Run Test
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Output
              </label>
              <textarea
                value={testOutput}
                readOnly
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                placeholder="Test output will appear here..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Schema Validation */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Schema Validation</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Validate Input Schema
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.validateInput || false}
                onChange={(e) => onChange('validateInput', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.validateInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Schema (JSON Schema)
              </label>
              <textarea
                value={config.inputSchema || ''}
                onChange={(e) => onChange('inputSchema', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder={`{
  "type": "object",
  "properties": {
    "name": {"type": "string"},
    "email": {"type": "string", "format": "email"}
  },
  "required": ["name", "email"]
}`}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Validate Output Schema
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.validateOutput || false}
                onChange={(e) => onChange('validateOutput', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.validateOutput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Schema (JSON Schema)
              </label>
              <textarea
                value={config.outputSchema || ''}
                onChange={(e) => onChange('outputSchema', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder={`{
  "type": "object",
  "properties": {
    "processed": {"type": "boolean"},
    "timestamp": {"type": "string", "format": "date-time"}
  }
}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Handling */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Error Handling</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Continue on Error
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.continueOnError || false}
                onChange={(e) => onChange('continueOnError', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Output on Error
            </label>
            <textarea
              value={config.defaultOutput || ''}
              onChange={(e) => onChange('defaultOutput', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder={`{
  "error": true,
  "message": "Transform failed"
}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Execution Timeout (seconds)
            </label>
            <input
              type="number"
              value={config.timeout || 30}
              onChange={(e) => onChange('timeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="1"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* Performance Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Performance</h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Limit (MB)
            </label>
            <input
              type="number"
              value={config.memoryLimit || 128}
              onChange={(e) => onChange('memoryLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="64"
              max="1024"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enable Caching
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableCaching || false}
                onChange={(e) => onChange('enableCaching', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.enableCaching && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cache TTL (seconds)
              </label>
              <input
                type="number"
                value={config.cacheTtl || 300}
                onChange={(e) => onChange('cacheTtl', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="60"
                max="3600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransformNodeConfig;