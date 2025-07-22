import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';

const GenericNodeConfig = ({ config, onChange, errors }) => {
  const addCustomField = () => {
    const customFields = config.customFields || [];
    onChange('customFields', [
      ...customFields,
      { key: '', value: '', type: 'string' }
    ]);
  };

  const updateCustomField = (index, field, value) => {
    const customFields = [...(config.customFields || [])];
    customFields[index] = { ...customFields[index], [field]: value };
    onChange('customFields', customFields);
  };

  const removeCustomField = (index) => {
    const customFields = config.customFields || [];
    onChange('customFields', customFields.filter((_, i) => i !== index));
  };

  const fieldTypes = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'json', label: 'JSON' },
    { value: 'array', label: 'Array' }
  ];

  return (
    <div className="space-y-4">
      {/* Node Type Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Generic Node Configuration</span>
        </div>
        <p className="text-xs text-blue-700">
          This node type doesn't have specific configuration options. You can add custom fields below.
        </p>
      </div>

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Custom Configuration Fields
          </label>
          <button
            onClick={addCustomField}
            className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        {(!config.customFields || config.customFields.length === 0) && (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">No custom fields added yet</p>
            <button
              onClick={addCustomField}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add your first custom field
            </button>
          </div>
        )}

        <div className="space-y-3">
          {(config.customFields || []).map((field, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Field {index + 1}
                </span>
                <button
                  onClick={() => removeCustomField(index)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.key || ''}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="fieldName"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Field Type
                  </label>
                  <select
                    value={field.type || 'string'}
                    onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Value
                  </label>
                  {field.type === 'boolean' ? (
                    <select
                      value={field.value || 'false'}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="false">False</option>
                      <option value="true">True</option>
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={field.value || ''}
                      onChange={(e) => updateCustomField(index, 'value', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0"
                    />
                  ) : field.type === 'json' || field.type === 'array' ? (
                    <textarea
                      value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value || ''}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateCustomField(index, 'value', parsed);
                        } catch {
                          updateCustomField(index, 'value', e.target.value);
                        }
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                      placeholder={field.type === 'array' ? '[]' : '{}'}
                    />
                  ) : (
                    <input
                      type="text"
                      value={field.value || ''}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter value"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Configuration */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Raw Configuration (JSON)</h5>
        <textarea
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              Object.keys(parsed).forEach(key => {
                onChange(key, parsed[key]);
              });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          placeholder="{}"
        />
        <p className="text-xs text-gray-500 mt-1">
          Advanced: Edit the raw JSON configuration directly
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h6 className="text-sm font-medium text-gray-700 mb-2">Configuration Tips</h6>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use custom fields to store node-specific settings</li>
          <li>• Field names should be descriptive and use camelCase</li>
          <li>• JSON and Array fields accept valid JSON syntax</li>
          <li>• Changes are automatically saved when you modify the configuration</li>
        </ul>
      </div>
    </div>
  );
};

export default GenericNodeConfig;