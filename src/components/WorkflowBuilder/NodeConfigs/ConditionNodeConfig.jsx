import React from 'react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';

const ConditionNodeConfig = ({ config, onChange, errors }) => {
  const operators = [
    { value: 'equals', label: 'Equals (==)' },
    { value: 'not_equals', label: 'Not Equals (!=)' },
    { value: 'greater_than', label: 'Greater Than (>)' },
    { value: 'less_than', label: 'Less Than (<)' },
    { value: 'greater_equal', label: 'Greater Than or Equal (>=)' },
    { value: 'less_equal', label: 'Less Than or Equal (<=)' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'regex_match', label: 'Regex Match' },
    { value: 'in_array', label: 'In Array' },
    { value: 'not_in_array', label: 'Not In Array' }
  ];

  const logicOperators = [
    { value: 'and', label: 'AND (all conditions must be true)' },
    { value: 'or', label: 'OR (any condition must be true)' }
  ];

  const dataTypes = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'date', label: 'Date' },
    { value: 'array', label: 'Array' },
    { value: 'object', label: 'Object' }
  ];

  const addCondition = () => {
    const conditions = config.conditions || [];
    onChange('conditions', [
      ...conditions,
      {
        field: '',
        operator: 'equals',
        value: '',
        dataType: 'string'
      }
    ]);
  };

  const updateCondition = (index, field, value) => {
    const conditions = [...(config.conditions || [])];
    conditions[index] = { ...conditions[index], [field]: value };
    onChange('conditions', conditions);
  };

  const removeCondition = (index) => {
    const conditions = config.conditions || [];
    onChange('conditions', conditions.filter((_, i) => i !== index));
  };

  const conditions = config.conditions || [];
  const isMultipleConditions = conditions.length > 1;

  return (
    <div className="space-y-4">
      {/* Simple/Advanced Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          <GitBranch className="w-4 h-4 inline mr-1" />
          Condition Mode
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Simple</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.advancedMode || false}
              onChange={(e) => onChange('advancedMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm text-gray-600">Advanced</span>
        </div>
      </div>

      {/* Simple Mode - Single Condition */}
      {!config.advancedMode && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field to Compare *
            </label>
            <input
              type="text"
              value={config.field || ''}
              onChange={(e) => onChange('field', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.field ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="input.fieldName or variable"
            />
            {errors.field && (
              <p className="text-xs text-red-600 mt-1">{errors.field}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use dot notation to access nested fields (e.g., input.user.name)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operator *
            </label>
            <select
              value={config.operator || 'equals'}
              onChange={(e) => onChange('operator', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.operator ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select operator</option>
              {operators.map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            {errors.operator && (
              <p className="text-xs text-red-600 mt-1">{errors.operator}</p>
            )}
          </div>

          {/* Value field (not needed for is_empty/is_not_empty) */}
          {!['is_empty', 'is_not_empty'].includes(config.operator) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare Value
              </label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => onChange('value', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Value to compare against"
              />
              <p className="text-xs text-gray-500 mt-1">
                For arrays, use comma-separated values. For regex, enter the pattern.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Case Sensitive
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.caseSensitive !== false}
                onChange={(e) => onChange('caseSensitive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* Advanced Mode - Multiple Conditions */}
      {config.advancedMode && (
        <div className="space-y-4">
          {/* Logic Operator (for multiple conditions) */}
          {isMultipleConditions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logic Operator
              </label>
              <select
                value={config.logicOperator || 'and'}
                onChange={(e) => onChange('logicOperator', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {logicOperators.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditions List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Conditions
              </label>
              <button
                onClick={addCondition}
                className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Condition
              </button>
            </div>

            {conditions.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">No conditions added yet</p>
                <button
                  onClick={addCondition}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Add your first condition
                </button>
              </div>
            )}

            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Condition {index + 1}
                    </span>
                    <button
                      onClick={() => removeCondition(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Field
                      </label>
                      <input
                        type="text"
                        value={condition.field || ''}
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="input.fieldName"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Data Type
                      </label>
                      <select
                        value={condition.dataType || 'string'}
                        onChange={(e) => updateCondition(index, 'dataType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {dataTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Operator
                      </label>
                      <select
                        value={condition.operator || 'equals'}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Value
                        </label>
                        <input
                          type="text"
                          value={condition.value || ''}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Compare value"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JavaScript Expression (Advanced) */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Custom JavaScript Expression
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.useCustomExpression || false}
              onChange={(e) => onChange('useCustomExpression', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {config.useCustomExpression && (
          <div>
            <textarea
              value={config.customExpression || ''}
              onChange={(e) => onChange('customExpression', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              placeholder="return input.value > 100 && input.status === 'active';"
            />
            <p className="text-xs text-gray-500 mt-1">
              Write a JavaScript expression that returns true or false. Use 'input' to access the input data.
            </p>
          </div>
        )}
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
              Default Result on Error
            </label>
            <select
              value={config.defaultResult || 'false'}
              onChange={(e) => onChange('defaultResult', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="false">False (go to false branch)</option>
              <option value="true">True (go to true branch)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionNodeConfig;