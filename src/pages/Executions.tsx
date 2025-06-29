import React from 'react';
import Layout from '../components/Layout/Layout';
import Header from '../components/Layout/Header';
import { CheckCircle, XCircle, Clock, Calendar, Filter } from 'lucide-react';

const executions = [
  {
    id: '1',
    workflowName: 'Email Marketing Automation',
    status: 'completed',
    startedAt: new Date(Date.now() - 300000),
    completedAt: new Date(Date.now() - 295000),
    duration: '5.2s',
    triggeredBy: 'Schedule',
  },
  {
    id: '2',
    workflowName: 'Lead Processing Pipeline',
    status: 'running',
    startedAt: new Date(Date.now() - 120000),
    duration: '2m 0s',
    triggeredBy: 'Webhook',
  },
  {
    id: '3',
    workflowName: 'Customer Support Routing',
    status: 'failed',
    startedAt: new Date(Date.now() - 600000),
    completedAt: new Date(Date.now() - 598000),
    duration: '2.1s',
    triggeredBy: 'API Call',
    error: 'Connection timeout to external service',
  },
  {
    id: '4',
    workflowName: 'Data Backup Process',
    status: 'completed',
    startedAt: new Date(Date.now() - 900000),
    completedAt: new Date(Date.now() - 855000),
    duration: '45.2s',
    triggeredBy: 'Schedule',
  },
];

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Executions: React.FC = () => {
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
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Completed</option>
                <option>Running</option>
                <option>Failed</option>
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
                  {executions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={execution.status} />
                          <StatusBadge status={execution.status} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{execution.workflowName}</p>
                          {execution.error && (
                            <p className="text-xs text-red-600 mt-1">{execution.error}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{execution.triggeredBy}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            {execution.startedAt.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {execution.startedAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{execution.duration}</span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing 1 to {executions.length} of {executions.length} results
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
    </Layout>
  );
};

export default Executions;