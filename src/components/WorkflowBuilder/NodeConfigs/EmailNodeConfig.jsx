import React from 'react';
import { Mail, Server, Shield, Plus, Trash2 } from 'lucide-react';

const EmailNodeConfig = ({ config, onChange, errors, nodeType }) => {
  const emailProviders = [
    { value: 'smtp', label: 'SMTP' },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'mailgun', label: 'Mailgun' },
    { value: 'ses', label: 'Amazon SES' },
    { value: 'outlook', label: 'Outlook/Office 365' },
    { value: 'gmail', label: 'Gmail' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' }
  ];

  const addRecipient = (field) => {
    const currentList = config[field] || [];
    onChange(field, [...currentList, '']);
  };

  const updateRecipient = (field, index, value) => {
    const currentList = config[field] || [];
    const newList = [...currentList];
    newList[index] = value;
    onChange(field, newList);
  };

  const removeRecipient = (field, index) => {
    const currentList = config[field] || [];
    const newList = currentList.filter((_, i) => i !== index);
    onChange(field, newList);
  };

  const renderRecipientList = (field, label, required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Mail className="w-4 h-4 inline mr-1" />
        {label} {required && '*'}
      </label>
      <div className="space-y-2">
        {(config[field] || []).map((recipient, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="email"
              value={recipient}
              onChange={(e) => updateRecipient(field, index, e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors[field] && index === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
            />
            <button
              onClick={() => removeRecipient(field, index)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => addRecipient(field)}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add {label.toLowerCase()}
        </button>
      </div>
      {errors[field] && (
        <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
      )}
    </div>
  );

  if (nodeType === 'send-email') {
    return (
      <div className="space-y-4">
        {/* Email Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Server className="w-4 h-4 inline mr-1" />
            Email Provider *
          </label>
          <select
            value={config.provider || 'smtp'}
            onChange={(e) => onChange('provider', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
              errors.provider ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select provider</option>
            {emailProviders.map(provider => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="text-xs text-red-600 mt-1">{errors.provider}</p>
          )}
        </div>

        {/* Recipients */}
        {renderRecipientList('toRecipients', 'To Recipients', true)}
        {renderRecipientList('ccRecipients', 'CC Recipients')}
        {renderRecipientList('bccRecipients', 'BCC Recipients')}

        {/* From Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Address
          </label>
          <input
            type="email"
            value={config.fromAddress || ''}
            onChange={(e) => onChange('fromAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="sender@example.com"
          />
        </div>

        {/* From Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            type="text"
            value={config.fromName || ''}
            onChange={(e) => onChange('fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Your Name"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={config.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
              errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Email subject"
          />
          {errors.subject && (
            <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body *
          </label>
          <textarea
            value={config.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
              errors.body ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Email content..."
          />
          {errors.body && (
            <p className="text-xs text-red-600 mt-1">{errors.body}</p>
          )}
        </div>

        {/* HTML Format */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            HTML Format
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.isHtml || false}
              onChange={(e) => onChange('isHtml', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={config.priority || 'normal'}
            onChange={(e) => onChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Provider-specific settings */}
        {config.provider === 'smtp' && (
          <div className="border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">SMTP Settings</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={config.smtpHost || ''}
                  onChange={(e) => onChange('smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="smtp.example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={config.smtpPort || 587}
                  onChange={(e) => onChange('smtpPort', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Use TLS/SSL
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.smtpSecure || false}
                    onChange={(e) => onChange('smtpSecure', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={config.smtpUsername || ''}
                  onChange={(e) => onChange('smtpUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={config.smtpPassword || ''}
                  onChange={(e) => onChange('smtpPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Email Received Node Configuration
  return (
    <div className="space-y-4">
      {/* Email Provider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Server className="w-4 h-4 inline mr-1" />
          Email Provider *
        </label>
        <select
          value={config.provider || 'imap'}
          onChange={(e) => onChange('provider', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="imap">IMAP</option>
          <option value="pop3">POP3</option>
          <option value="gmail">Gmail API</option>
          <option value="outlook">Outlook API</option>
        </select>
      </div>

      {/* Email Address to Monitor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address to Monitor *
        </label>
        <input
          type="email"
          value={config.emailAddress || ''}
          onChange={(e) => onChange('emailAddress', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="monitor@example.com"
        />
      </div>

      {/* Filters */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Email Filters</h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Filter
            </label>
            <input
              type="text"
              value={config.subjectFilter || ''}
              onChange={(e) => onChange('subjectFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Contains text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender Filter
            </label>
            <input
              type="text"
              value={config.senderFilter || ''}
              onChange={(e) => onChange('senderFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="sender@example.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Include Attachments
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeAttachments || false}
                onChange={(e) => onChange('includeAttachments', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Mark as Read
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.markAsRead || false}
                onChange={(e) => onChange('markAsRead', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      {(config.provider === 'imap' || config.provider === 'pop3') && (
        <div className="border-t border-gray-200 pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Connection Settings</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server Host
              </label>
              <input
                type="text"
                value={config.serverHost || ''}
                onChange={(e) => onChange('serverHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="imap.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port
              </label>
              <input
                type="number"
                value={config.serverPort || (config.provider === 'imap' ? 993 : 995)}
                onChange={(e) => onChange('serverPort', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Use SSL/TLS
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.useSSL !== false}
                  onChange={(e) => onChange('useSSL', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNodeConfig;