import React from 'react';
import { Clock, Calendar, Globe } from 'lucide-react';

const ScheduleNodeConfig = ({ config, onChange, errors }) => {
  const frequencies = [
    { value: 'once', label: 'Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom (Cron)' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' }
  ];

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}`
  }));

  const generateCronExpression = () => {
    const frequency = config.frequency;
    const time = config.executionTime || '09:00';
    const [hours, minutes] = time.split(':');

    switch (frequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      case 'weekly':
        const dayOfWeek = config.dayOfWeek || 1;
        return `${minutes} ${hours} * * ${dayOfWeek}`;
      case 'monthly':
        const dayOfMonth = config.dayOfMonth || 1;
        return `${minutes} ${hours} ${dayOfMonth} * *`;
      case 'once':
        return `${minutes} ${hours} * * *`; // Will be handled differently in execution
      default:
        return config.cronExpression || '0 9 * * *';
    }
  };

  const handleFrequencyChange = (frequency) => {
    onChange('frequency', frequency);
    
    // Set default values based on frequency
    if (frequency === 'daily') {
      onChange('cronExpression', generateCronExpression());
    } else if (frequency === 'weekly') {
      if (!config.dayOfWeek) onChange('dayOfWeek', 1);
    } else if (frequency === 'monthly') {
      if (!config.dayOfMonth) onChange('dayOfMonth', 1);
    }
  };

  const handleTimeChange = (time) => {
    onChange('executionTime', time);
    if (config.frequency !== 'custom') {
      onChange('cronExpression', generateCronExpression());
    }
  };

  const handleDayChange = (field, value) => {
    onChange(field, value);
    if (config.frequency !== 'custom') {
      onChange('cronExpression', generateCronExpression());
    }
  };

  return (
    <div className="space-y-4">
      {/* Frequency Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Frequency *
        </label>
        <select
          value={config.frequency || 'daily'}
          onChange={(e) => handleFrequencyChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            errors.frequency ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">Select frequency</option>
          {frequencies.map(freq => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
        {errors.frequency && (
          <p className="text-xs text-red-600 mt-1">{errors.frequency}</p>
        )}
      </div>

      {/* Execution Time */}
      {config.frequency && config.frequency !== 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Execution Time
          </label>
          <input
            type="time"
            value={config.executionTime || '09:00'}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}

      {/* Day of Week (for weekly) */}
      {config.frequency === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Day of Week
          </label>
          <select
            value={config.dayOfWeek || 1}
            onChange={(e) => handleDayChange('dayOfWeek', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {daysOfWeek.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Day of Month (for monthly) */}
      {config.frequency === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Day of Month
          </label>
          <select
            value={config.dayOfMonth || 1}
            onChange={(e) => handleDayChange('dayOfMonth', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {daysOfMonth.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Cron Expression */}
      {config.frequency === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cron Expression *
          </label>
          <input
            type="text"
            value={config.cronExpression || ''}
            onChange={(e) => onChange('cronExpression', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${
              errors.cronExpression ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="0 9 * * *"
          />
          {errors.cronExpression && (
            <p className="text-xs text-red-600 mt-1">{errors.cronExpression}</p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-medium mb-1">Examples:</p>
            <ul className="space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">0 9 * * *</code> - Daily at 9:00 AM</li>
              <li><code className="bg-gray-100 px-1 rounded">0 9 * * 1</code> - Every Monday at 9:00 AM</li>
              <li><code className="bg-gray-100 px-1 rounded">*/15 * * * *</code> - Every 15 minutes</li>
              <li><code className="bg-gray-100 px-1 rounded">0 0 1 * *</code> - First day of every month</li>
            </ul>
          </div>
        </div>
      )}

      {/* Generated Cron (for non-custom frequencies) */}
      {config.frequency && config.frequency !== 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated Cron Expression
          </label>
          <input
            type="text"
            value={generateCronExpression()}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            This expression is automatically generated based on your settings
          </p>
        </div>
      )}

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          Timezone
        </label>
        <select
          value={config.timezone || 'UTC'}
          onChange={(e) => onChange('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h5>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Executions
            </label>
            <input
              type="number"
              value={config.maxExecutions || ''}
              onChange={(e) => onChange('maxExecutions', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Unlimited"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for unlimited executions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={config.startDate || ''}
              onChange={(e) => onChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="datetime-local"
              value={config.endDate || ''}
              onChange={(e) => onChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleNodeConfig;