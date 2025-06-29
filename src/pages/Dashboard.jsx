import React from 'react';
import Layout from '../components/Layout/Layout';
import Header from '../components/Layout/Header';
import StatsCards from '../components/Dashboard/StatsCards';
import ExecutionChart from '../components/Dashboard/ExecutionChart';
import RecentExecutions from '../components/Dashboard/RecentExecutions';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header 
        title="Dashboard" 
        subtitle="Monitor your workflow automation platform"
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
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExecutionChart />
            </div>
            <div>
              <RecentExecutions />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;