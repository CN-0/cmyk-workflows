import React from 'react';
import { Timer, Clock, Calendar } from 'lucide-react';

const DelayNodeConfig = ({ config, onChange, errors }) => {
  const timeUnits = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
  ];

  const delayTypes = [
    { value: 'fixed', label: 'Fixed Delay' },
    { value: 'random', label: 'Random Delay' },
    { value: 'until_time', label: 'Until Specific Time' },
    { value: 'until_date', label: 'Until Specific Date' }
  ];

  const calculateTotalSeconds = () => {
    const duration = config.duration || 0;
    const unit = config.unit || 'seconds';
    
    const multipliers = {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800
    };
    
    return duration * multipliers[unit];
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 604800) return `${Math.round(seconds / 86400)} days`;
    return `${Math.round(seconds / 604800)} weeks`;
  };

  return (
    <div className="space-y-4">
      {/* Delay Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Timer className="w-4 h-4 inline mr-1" />
          Delay Type
        </label>
        <select
          value={config.delayType || 'fixed'}
          onChange={(e) => onChange('delayType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {delayTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Fixed Delay Configuration */}
      {(config.delayType === 'fixed' || !config.delayType) && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration *
            </label>
            <input
              type="number"
              value={config.duration || ''}
              onChange={(e) => onChange('duration', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              min="1"
              placeholder="Enter duration"
            />
            {errors.duration && (
              <p className="text-xs text-red-600 mt-1">{errors.duration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Unit
            </label>
            <select
              value={config.unit || 'seconds'}
              onChange={(e) => onChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {timeUnits.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {config.duration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Total delay: {formatDuration(calculateTotalSeconds())}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Random Delay Configuration */}
      {config.delayType === 'random' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Duration *
            </label>
            <input
              type="number"
              value={config.minDuration || ''}
              onChange={(e) => onChange('minDuration', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="1"
              placeholder="Minimum delay"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Duration *
            </label>
            <input
              type="number"
              value={config.maxDuration || ''}
              onChange={(e) => onChange('maxDuration', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              min="1"
              placeholder="Maximum delay"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Unit
            </label>
            <select
              value={config.unit || 'seconds'}
              onChange={(e) => onChange('unit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {timeUnits.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {config.minDuration && config.maxDuration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Clock className="w-4 h-4 inline mr-1" />
                Random delay between {config.minDuration} and {config.maxDuration} {config.unit || 'seconds'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Until Specific Time */}
      {config.delayType === 'until_time' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Target Time *
          </label>
          <input
            type="time"
            value={config.targetTime || ''}
            onChange={(e) => onChange('targetTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Workflow will wait until this time today (or tomorrow if the time has passed)
          </p>
        </div>
      )}

      {/* Until Specific Date */}
      {config.delayType === 'until_date' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Target Date & Time *
          </label>
          <input
            type="datetime-local"
            value={config.targetDateTime || ''}
            onChange={(e) => onChange('targetDateTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Workflow will wait until this specific date and time
          </p>
        </div>
      )}

      {/* Advanced Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Allow Cancellation
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.allowCancellation !== false}
                onChange={(e) => onChange('allowCancellation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Skip Weekends
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.skipWeekends || false}
                onChange={(e) => onChange('skipWeekends', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.skipWeekends && (
            <p className="text-xs text-gray-500">
              If the delay would end on a weekend, it will be extended to the next Monday
            </p>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Skip Holidays
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.skipHolidays || false}
                onChange={(e) => onChange('skipHolidays', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.skipHolidays && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holiday Calendar
              </label>
              <select
                value={config.holidayCalendar || 'us'}
                onChange={(e) => onChange('holidayCalendar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="custom">Custom Holiday List</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={config.timezone || 'UTC'}
              onChange={(e) => onChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Options */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Notifications</h5>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Send Start Notification
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifyOnStart || false}
                onChange={(e) => onChange('notifyOnStart', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Send Completion Notification
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifyOnComplete || false}
                onChange={(e) => onChange('notifyOnComplete', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {(config.notifyOnStart || config.notifyOnComplete) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Recipients
              </label>
              <input
                type="text"
                value={config.notificationRecipients || ''}
                onChange={(e) => onChange('notificationRecipients', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="email@example.com, another@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of email addresses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelayNodeConfig;