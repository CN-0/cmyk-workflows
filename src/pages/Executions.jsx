import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Header from '../components/Layout/Header';
import { CheckCircle, XCircle, Clock, Calendar, Filter, Eye, Play, X } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import apiService from '../services/api';

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'running':
      return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const StatusBadge = ({ status }) => {
  const styles = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Executions = () => {
  const { executions, loading } = useWorkflow();
  const [filter, setFilter] = useState('all');
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const filteredExecutions = executions.filter(execution => {
    if (filter === 'all') return true;
    return execution.status === filter;
  });

  const formatDuration = (startedAt, completedAt) => {
    if (!completedAt) {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
    
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const ms = duration % 1000;
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    if (seconds > 0) return `${seconds}.${Math.floor(ms/100)}s`;
    return `${ms}ms`;
  };

  const viewLogs = async (execution) => {
    try {
      const response = await apiService.getExecution(execution.id);
      if (response.success) {
        setSelectedExecution(response.data);
        setExecutionLogs(response.data.logs || []);
        setShowLogsModal(true);
      }
    } catch (error) {
      console.error('Failed to load execution logs:', error);
    }
  };

  const cancelExecution = async (executionId) => {
    try {
      await apiService.cancelExecution(executionId);
      // Refresh executions list
      window.location.reload();
    } catch (error) {
      console.error('Failed to cancel execution:', error);
    }
  };

  return (
    <Layout>
      <Header 
        title="Executions" 
        subtitle="Monitor workflow execution history and performance"
      />
      
      <div className="flex-1 overflow-auto">
        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Executions Table */}
        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Workflow</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Triggered By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Started</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        Loading executions...
                      </td>
                    </tr>
                  ) : filteredExecutions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No executions found
                      </td>
                    </tr>
                  ) : (
                    filteredExecutions.map((execution) => (
                      <tr key={execution.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon status={execution.status} />
                            <StatusBadge status={execution.status} />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {execution.context ? JSON.parse(execution.context).workflowName : 'Unknown Workflow'}
                            </p>
                            {execution.error_message && (
                              <p className="text-xs text-red-600 mt-1">{execution.error_message}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600 capitalize">{execution.triggered_by}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {new Date(execution.started_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(execution.started_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {formatDuration(execution.started_at, execution.completed_at)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => viewLogs(execution)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Logs
                            </button>
                            {execution.status === 'running' && (
                              <button 
                                onClick={() => cancelExecution(execution.id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing 1 to {filteredExecutions.length} of {filteredExecutions.length} results
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Logs Modal */}
      {showLogsModal && selectedExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Execution Logs</h3>
                <p className="text-sm text-gray-500">
                  {selectedExecution.context ? JSON.parse(selectedExecution.context).workflowName : 'Unknown Workflow'} - {selectedExecution.id}
                </p>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {executionLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No logs available</p>
              ) : (
                <div className="space-y-2">
                  {executionLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 mt-0.5">
                        {log.level === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        {log.level === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {log.level === 'info' && <Clock className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">{log.node_id}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium capitalize">{selectedExecution.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">
                    {formatDuration(selectedExecution.started_at, selectedExecution.completed_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Executions;