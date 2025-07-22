import React from 'react';
import { Webhook, Shield, Key } from 'lucide-react';

const WebhookNodeConfig = ({ config, onChange, errors }) => {
  const httpMethods = [
    { value: 'POST', label: 'POST' },
    { value: 'GET', label: 'GET' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' }
  ];

  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'api_key', label: 'API Key' },
    { value: 'signature', label: 'Signature Verification' }
  ];

  return (
    <div className="space-y-4">
      {/* HTTP Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Webhook className="w-4 h-4 inline mr-1" />
          HTTP Method *
        </label>
        <select
          value={config.method || 'POST'}
          onChange={(e) => onChange('method', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            errors.method ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">Select method</option>
          {httpMethods.map(method => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        {errors.method && (
          <p className="text-xs text-red-600 mt-1">{errors.method}</p>
        )}
      </div>

      {/* Webhook URL (Read-only, generated) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <input
          type="text"
          value={config.webhookUrl || `https://api.flowforge.com/webhooks/${config.webhookId || 'generated-id'}`}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          This URL will be generated when the workflow is saved
        </p>
      </div>

      {/* Authentication */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="w-4 h-4 inline mr-1" />
          Authentication
        </label>
        <select
          value={config.authType || 'none'}
          onChange={(e) => onChange('authType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {authTypes.map(auth => (
            <option key={auth.value} value={auth.value}>
              {auth.label}
            </option>
          ))}
        </select>
      </div>

      {/* Authentication Details */}
      {config.authType === 'bearer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4 inline mr-1" />
            Bearer Token
          </label>
          <input
            type="password"
            value={config.bearerToken || ''}
            onChange={(e) => onChange('bearerToken', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Enter bearer token"
          />
        </div>
      )}

      {config.authType === 'basic' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={config.basicUsername || ''}
              onChange={(e) => onChange('basicUsername', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={config.basicPassword || ''}
              onChange={(e) => onChange('basicPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter password"
            />
          </div>
        </div>
      )}

      {config.authType === 'api_key' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key Header Name
            </label>
            <input
              type="text"
              value={config.apiKeyHeader || 'X-API-Key'}
              onChange={(e) => onChange('apiKeyHeader', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="X-API-Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key Value
            </label>
            <input
              type="password"
              value={config.apiKeyValue || ''}
              onChange={(e) => onChange('apiKeyValue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter API key"
            />
          </div>
        </div>
      )}

      {config.authType === 'signature' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Key
          </label>
          <input
            type="password"
            value={config.secretKey || ''}
            onChange={(e) => onChange('secretKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Enter secret key for signature verification"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used to verify webhook signatures (e.g., GitHub, Stripe style)
          </p>
        </div>
      )}

      {/* Request Validation */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Request Validation</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Validate Content Type
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.validateContentType || false}
                onChange={(e) => onChange('validateContentType', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.validateContentType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Content Type
              </label>
              <select
                value={config.expectedContentType || 'application/json'}
                onChange={(e) => onChange('expectedContentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="application/json">application/json</option>
                <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                <option value="text/plain">text/plain</option>
                <option value="application/xml">application/xml</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Headers
            </label>
            <textarea
              value={config.requiredHeaders || ''}
              onChange={(e) => onChange('requiredHeaders', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder="User-Agent&#10;X-Custom-Header"
            />
            <p className="text-xs text-gray-500 mt-1">
              One header name per line. Requests without these headers will be rejected.
            </p>
          </div>
        </div>
      </div>

      {/* Response Configuration */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Response Configuration</h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Response Code
            </label>
            <select
              value={config.successResponseCode || '200'}
              onChange={(e) => onChange('successResponseCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="200">200 OK</option>
              <option value="201">201 Created</option>
              <option value="202">202 Accepted</option>
              <option value="204">204 No Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Response Body
            </label>
            <textarea
              value={config.successResponseBody || '{"status": "received"}'}
              onChange={(e) => onChange('successResponseBody', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder='{"status": "received"}'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookNodeConfig;