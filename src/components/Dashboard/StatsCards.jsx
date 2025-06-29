import React from 'react';
import { Workflow, Activity, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <div className="flex items-center mt-2">
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
          <span className="text-xs text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Workflows"
        value={24}
        change="+12%"
        trend="up"
        icon={<Workflow className="w-6 h-6 text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard
        title="Active Executions"
        value={152}
        change="+8%"
        trend="up"
        icon={<Activity className="w-6 h-6 text-green-600" />}
        color="bg-green-50"
      />
      <StatCard
        title="Success Rate"
        value="96.5%"
        change="+2.1%"
        trend="up"
        icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
        color="bg-emerald-50"
      />
      <StatCard
        title="Failed Executions"
        value={8}
        change="-15%"
        trend="up"
        icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        color="bg-red-50"
      />
    </div>
  );
};

export default StatsCards;