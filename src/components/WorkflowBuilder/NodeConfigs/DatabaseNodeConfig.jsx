import React from 'react';
import { Database, Table, AlertTriangle } from 'lucide-react';

const DatabaseNodeConfig = ({ config, onChange, errors }) => {
  const connectionTypes = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'redis', label: 'Redis' },
    { value: 'custom', label: 'Custom Connection String' }
  ];

  const conflictActions = [
    { value: 'error', label: 'Throw Error' },
    { value: 'ignore', label: 'Ignore (Skip)' },
    { value: 'update', label: 'Update Existing' },
    { value: 'replace', label: 'Replace Existing' }
  ];

  return (
    <div className="space-y-4">
      {/* Database Connection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Database className="w-4 h-4 inline mr-1" />
          Database Type *
        </label>
        <select
          value={config.connection || 'postgresql'}
          onChange={(e) => onChange('connection', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            errors.connection ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">Select database type</option>
          {connectionTypes.map(conn => (
            <option key={conn.value} value={conn.value}>
              {conn.label}
            </option>
          ))}
        </select>
        {errors.connection && (
          <p className="text-xs text-red-600 mt-1">{errors.connection}</p>
        )}
      </div>

      {/* Connection Details */}
      {config.connection && config.connection !== 'custom' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={config.host || 'localhost'}
              onChange={(e) => onChange('host', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="localhost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port
            </label>
            <input
              type="number"
              value={config.port || getDefaultPort(config.connection)}
              onChange={(e) => onChange('port', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database Name
            </label>
            <input
              type="text"
              value={config.database || ''}
              onChange={(e) => onChange('database', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="database_name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={config.username || ''}
              onChange={(e) => onChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={config.password || ''}
              onChange={(e) => onChange('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="password"
            />
          </div>
        </div>
      )}

      {/* Custom Connection String */}
      {config.connection === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connection String
          </label>
          <textarea
            value={config.connectionString || ''}
            onChange={(e) => onChange('connectionString', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            placeholder="postgresql://user:password@localhost:5432/database"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the complete database connection string
          </p>
        </div>
      )}

      {/* Table/Collection Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Table className="w-4 h-4 inline mr-1" />
          {config.connection === 'mongodb' ? 'Collection Name' : 'Table Name'} *
        </label>
        <input
          type="text"
          value={config.table || ''}
          onChange={(e) => onChange('table', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            errors.table ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder={config.connection === 'mongodb' ? 'collection_name' : 'table_name'}
        />
        {errors.table && (
          <p className="text-xs text-red-600 mt-1">{errors.table}</p>
        )}
      </div>

      {/* Data Mapping */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Mapping *
        </label>
        <textarea
          value={config.dataMapping || ''}
          onChange={(e) => onChange('dataMapping', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${
            errors.dataMapping ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder={`{
  "name": "{{input.name}}",
  "email": "{{input.email}}",
  "created_at": "{{now()}}"
}`}
        />
        {errors.dataMapping && (
          <p className="text-xs text-red-600 mt-1">{errors.dataMapping}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Map input data to database fields using JSON format. Use {`{{variable}}`} syntax for dynamic values.
        </p>
      </div>

      {/* Conflict Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          On Conflict
        </label>
        <select
          value={config.onConflict || 'error'}
          onChange={(e) => onChange('onConflict', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {conflictActions.map(action => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          What to do when a record with the same key already exists
        </p>
      </div>

      {/* Conflict Key (for update/replace) */}
      {(config.onConflict === 'update' || config.onConflict === 'replace') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conflict Key
          </label>
          <input
            type="text"
            value={config.conflictKey || 'id'}
            onChange={(e) => onChange('conflictKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="id"
          />
          <p className="text-xs text-gray-500 mt-1">
            The field to check for conflicts (usually primary key or unique field)
          </p>
        </div>
      )}

      {/* Advanced Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Use Transaction
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.useTransaction !== false}
                onChange={(e) => onChange('useTransaction', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Return Inserted Record
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.returnRecord || false}
                onChange={(e) => onChange('returnRecord', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size
            </label>
            <input
              type="number"
              value={config.batchSize || 1}
              onChange={(e) => onChange('batchSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="1"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of records to insert in a single batch (for bulk operations)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Timeout (seconds)
            </label>
            <input
              type="number"
              value={config.connectionTimeout || 30}
              onChange={(e) => onChange('connectionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="5"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* SSL Options (for supported databases) */}
      {['postgresql', 'mysql'].includes(config.connection) && (
        <div className="border-t border-gray-200 pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">SSL Configuration</h5>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Enable SSL
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.ssl || false}
                  onChange={(e) => onChange('ssl', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.ssl && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Reject Unauthorized
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sslRejectUnauthorized !== false}
                    onChange={(e) => onChange('sslRejectUnauthorized', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get default ports
const getDefaultPort = (connectionType) => {
  const defaultPorts = {
    postgresql: 5432,
    mysql: 3306,
    sqlite: null,
    mongodb: 27017,
    redis: 6379
  };
  return defaultPorts[connectionType] || '';
};

export default DatabaseNodeConfig;