import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Settings, Clock, Mail, Globe, Database, GitBranch, Timer, Code, Webhook } from 'lucide-react';
import ScheduleNodeConfig from './NodeConfigs/ScheduleNodeConfig';
import WebhookNodeConfig from './NodeConfigs/WebhookNodeConfig';
import EmailNodeConfig from './NodeConfigs/EmailNodeConfig';
import HttpRequestNodeConfig from './NodeConfigs/HttpRequestNodeConfig';
import DatabaseNodeConfig from './NodeConfigs/DatabaseNodeConfig';
import ConditionNodeConfig from './NodeConfigs/ConditionNodeConfig';
import DelayNodeConfig from './NodeConfigs/DelayNodeConfig';
import TransformNodeConfig from './NodeConfigs/TransformNodeConfig';
import GenericNodeConfig from './NodeConfigs/GenericNodeConfig';

const ConfigurationSidebar = ({ 
  selectedNode, 
  onNodeUpdate, 
  onClose, 
  isVisible 
}) => {
  const [config, setConfig] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize config when node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig({
        label: selectedNode.label || selectedNode.name || '',
        description: selectedNode.description || '',
        enabled: selectedNode.enabled !== false,
        ...selectedNode.config
      });
      setHasChanges(false);
      setErrors({});
    }
  }, [selectedNode]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateConfig = () => {
    const newErrors = {};
    
    // Common validations
    if (!config.label?.trim()) {
      newErrors.label = 'Label is required';
    }

    // Node-specific validations
    switch (selectedNode?.type) {
      case 'schedule':
        if (!config.frequency) {
          newErrors.frequency = 'Frequency is required';
        }
        if (config.frequency === 'custom' && !config.cronExpression) {
          newErrors.cronExpression = 'Cron expression is required for custom frequency';
        }
        break;
      
      case 'webhook':
        if (!config.method) {
          newErrors.method = 'HTTP method is required';
        }
        break;
      
      case 'send-email':
        if (!config.provider) {
          newErrors.provider = 'Email provider is required';
        }
        break;
      
      case 'http-request':
        if (!config.url?.trim()) {
          newErrors.url = 'URL is required';
        }
        if (!config.method) {
          newErrors.method = 'HTTP method is required';
        }
        break;
      
      case 'database-insert':
        if (!config.connection) {
          newErrors.connection = 'Database connection is required';
        }
        if (!config.table?.trim()) {
          newErrors.table = 'Table name is required';
        }
        break;
      
      case 'condition':
        if (!config.operator) {
          newErrors.operator = 'Operator is required';
        }
        break;
      
      case 'delay':
        if (!config.duration || config.duration <= 0) {
          newErrors.duration = 'Duration must be greater than 0';
        }
        break;
      
      case 'transform':
        if (!config.code?.trim()) {
          newErrors.code = 'JavaScript code is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onNodeUpdate(selectedNode.id, {
        label: config.label,
        description: config.description,
        enabled: config.enabled,
        config: { ...config }
      });
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    if (selectedNode) {
      setConfig({
        label: selectedNode.label || selectedNode.name || '',
        description: selectedNode.description || '',
        enabled: selectedNode.enabled !== false,
        ...selectedNode.config
      });
      setHasChanges(false);
      setErrors({});
    }
  };

  const getNodeIcon = (type) => {
    const icons = {
      schedule: Clock,
      webhook: Webhook,
      'send-email': Mail,
      'email-received': Mail,
      'http-request': Globe,
      'database-insert': Database,
      condition: GitBranch,
      delay: Timer,
      transform: Code,
    };
    return icons[type] || Settings;
  };

  const renderConfigurationPanel = () => {
    if (!selectedNode) return null;

    const commonProps = {
      config,
      onChange: handleConfigChange,
      errors
    };

    switch (selectedNode.type) {
      case 'schedule':
        return <ScheduleNodeConfig {...commonProps} />;
      case 'webhook':
        return <WebhookNodeConfig {...commonProps} />;
      case 'send-email':
      case 'email-received':
        return <EmailNodeConfig {...commonProps} nodeType={selectedNode.type} />;
      case 'http-request':
        return <HttpRequestNodeConfig {...commonProps} />;
      case 'database-insert':
        return <DatabaseNodeConfig {...commonProps} />;
      case 'condition':
        return <ConditionNodeConfig {...commonProps} />;
      case 'delay':
        return <DelayNodeConfig {...commonProps} />;
      case 'transform':
        return <TransformNodeConfig {...commonProps} />;
      default:
        return <GenericNodeConfig {...commonProps} />;
    }
  };

  if (!isVisible || !selectedNode) {
    return null;
  }

  const NodeIcon = getNodeIcon(selectedNode.type);

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <NodeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Configure Node</h3>
              <p className="text-sm text-gray-500 capitalize">{selectedNode.type.replace('-', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {hasChanges && (
          <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Unsaved changes
          </div>
        )}
      </div>

      {/* Common Configuration */}
      <div className="p-4 border-b border-gray-200 bg-gray-25">
        <h4 className="text-sm font-medium text-gray-900 mb-3">General Settings</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Label *
            </label>
            <input
              type="text"
              value={config.label || ''}
              onChange={(e) => handleConfigChange('label', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter node label"
            />
            {errors.label && (
              <p className="text-xs text-red-600 mt-1">{errors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Optional description"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enabled
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled !== false}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Node-Specific Configuration */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1).replace('-', ' ')} Settings
          </h4>
          {renderConfigurationPanel()}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset to original values"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {Object.keys(errors).length > 0 && (
          <div className="mt-2 text-xs text-red-600">
            Please fix the errors above before saving
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationSidebar;