import React from 'react';
import { Globe, Shield, Clock, RefreshCw } from 'lucide-react';

const HttpRequestNodeConfig = ({ config, onChange, errors }) => {
  const httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'HEAD', label: 'HEAD' },
    { value: 'OPTIONS', label: 'OPTIONS' }
  ];

  const authTypes = [
    { value: 'none', label: 'None' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth2', label: 'OAuth 2.0' }
  ];

  const contentTypes = [
    { value: 'application/json', label: 'JSON' },
    { value: 'application/x-www-form-urlencoded', label: 'Form Data' },
    { value: 'text/plain', label: 'Plain Text' },
    { value: 'application/xml', label: 'XML' },
    { value: 'multipart/form-data', label: 'Multipart Form' }
  ];

  return (
    <div className="space-y-4">
      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          URL *
        </label>
        <input
          type="url"
          value={config.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            errors.url ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="https://api.example.com/endpoint"
        />
        {errors.url && (
          <p className="text-xs text-red-600 mt-1">{errors.url}</p>
        )}
      </div>

      {/* HTTP Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTTP Method *
        </label>
        <select
          value={config.method || 'GET'}
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

      {/* Headers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headers
        </label>
        <textarea
          value={config.headers || ''}
          onChange={(e) => onChange('headers', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          placeholder={`{
  "Content-Type": "application/json",
  "User-Agent": "FlowForge/1.0"
}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter headers as JSON object
        </p>
      </div>

      {/* Request Body (for POST, PUT, PATCH) */}
      {['POST', 'PUT', 'PATCH'].includes(config.method) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request Body
          </label>
          <div className="space-y-2">
            <select
              value={config.contentType || 'application/json'}
              onChange={(e) => onChange('contentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <textarea
              value={config.body || ''}
              onChange={(e) => onChange('body', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder={config.contentType === 'application/json' ? 
                '{\n  "key": "value"\n}' : 
                'Request body content'
              }
            />
          </div>
        </div>
      )}

      {/* Query Parameters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Query Parameters
        </label>
        <textarea
          value={config.queryParams || ''}
          onChange={(e) => onChange('queryParams', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          placeholder={`{
  "param1": "value1",
  "param2": "value2"
}`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter query parameters as JSON object
        </p>
      </div>

      {/* Authentication */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          <Shield className="w-4 h-4 inline mr-1" />
          Authentication
        </h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authentication Type
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

          {config.authType === 'bearer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  API Key Location
                </label>
                <select
                  value={config.apiKeyLocation || 'header'}
                  onChange={(e) => onChange('apiKeyLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="header">Header</option>
                  <option value="query">Query Parameter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={config.apiKeyName || 'X-API-Key'}
                  onChange={(e) => onChange('apiKeyName', e.target.value)}
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
        </div>
      </div>

      {/* Request Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          <Clock className="w-4 h-4 inline mr-1" />
          Request Options
        </h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout (seconds)
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Retry Attempts
            </label>
            <input
              type="number"
              value={config.retryAttempts || 0}
              onChange={(e) => onChange('retryAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="0"
              max="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retry Delay (seconds)
            </label>
            <input
              type="number"
              value={config.retryDelay || 1}
              onChange={(e) => onChange('retryDelay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="1"
              max="60"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Follow Redirects
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.followRedirects !== false}
                onChange={(e) => onChange('followRedirects', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Verify SSL Certificate
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.verifySSL !== false}
                onChange={(e) => onChange('verifySSL', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Response Handling */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Response Handling</h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Status Codes
            </label>
            <input
              type="text"
              value={config.expectedStatusCodes || '200,201,202'}
              onChange={(e) => onChange('expectedStatusCodes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="200,201,202"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of acceptable status codes
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Parse JSON Response
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.parseJson !== false}
                onChange={(e) => onChange('parseJson', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Include Response Headers
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeHeaders || false}
                onChange={(e) => onChange('includeHeaders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HttpRequestNodeConfig;