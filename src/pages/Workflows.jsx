import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Header from '../components/Layout/Header';
import WorkflowCard from '../components/Workflows/WorkflowCard';
import { useWorkflow } from '../contexts/WorkflowContext';
import { Plus, Filter, SortAsc } from 'lucide-react';

const Workflows = () => {
  const navigate = useNavigate();
  const { workflows, executeWorkflow, deleteWorkflow } = useWorkflow();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'all') return true;
    return workflow.status === filter;
  });

  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'executions':
        return b.executionCount - a.executionCount;
      default:
        return 0;
    }
  });

  const handleEdit = (id) => {
    navigate(`/workflows/${id}/edit`);
  };

  const handleDuplicate = (id) => {
    // TODO: Implement duplication logic
    console.log('Duplicate workflow:', id);
  };

  return (
    <Layout>
      <Header 
        title="Workflows" 
        subtitle={`${workflows.length} workflows • ${workflows.filter(w => w.status === 'active').length} active`}
        actions={
          <button
            onClick={() => navigate('/workflows/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        }
      />
      
      <div className="flex-1 overflow-auto">
        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created">Created Date</option>
                  <option value="name">Name</option>
                  <option value="executions">Executions</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Workflows Grid */}
        <div className="p-6">
          {sortedWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onExecute={executeWorkflow}
                  onEdit={handleEdit}
                  onDelete={deleteWorkflow}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "Get started by creating your first workflow" 
                  : `No workflows with status "${filter}" found`
                }
              </p>
              <button
                onClick={() => navigate('/workflows/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Workflows;