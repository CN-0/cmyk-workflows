import React from 'react';
import { CheckCircle, XCircle, Clock, Play } from 'lucide-react';

const executions = [
  {
    id: '1',
    workflowName: 'Email Marketing Automation',
    status: 'completed',
    startedAt: new Date(Date.now() - 300000),
    duration: '2.3s',
  },
  {
    id: '2',
    workflowName: 'Lead Processing Pipeline',
    status: 'running',
    startedAt: new Date(Date.now() - 120000),
    duration: '2m 0s',
  },
  {
    id: '3',
    workflowName: 'Customer Support Routing',
    status: 'failed',
    startedAt: new Date(Date.now() - 600000),
    duration: '1.2s',
  },
  {
    id: '4',
    workflowName: 'Data Backup Process',
    status: 'completed',
    startedAt: new Date(Date.now() - 900000),
    duration: '45.2s',
  },
  {
    id: '5',
    workflowName: 'Invoice Generation',
    status: 'completed',
    startedAt: new Date(Date.now() - 1200000),
    duration: '3.1s',
  },
];

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'running':
      return <Play className="w-4 h-4 text-blue-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
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

const RecentExecutions: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Executions</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {executions.map((execution) => (
          <div key={execution.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={execution.status} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {execution.workflowName}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Started {execution.startedAt.toLocaleTimeString()} • Duration: {execution.duration}
                  </p>
                </div>
              </div>
              <StatusBadge status={execution.status} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View all executions →
        </button>
      </div>
    </div>
  );
};

export default RecentExecutions;