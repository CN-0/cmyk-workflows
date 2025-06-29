import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NodePalette from '../components/WorkflowBuilder/NodePalette';
import WorkflowCanvas from '../components/WorkflowBuilder/WorkflowCanvas';
import { WorkflowNode, NodeTemplate } from '../types/workflow';
import { Save, Play, Settings, ArrowLeft } from 'lucide-react';

const WorkflowBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // TODO: Save workflow
  };

  const handleTest = () => {
    // TODO: Test workflow
    console.log('Testing workflow with nodes:', nodes);
  };

  const handleNodeSelect = (template: NodeTemplate) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      label: template.name,
      position: { x: 200, y: 100 + nodes.length * 150 },
      data: {},
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/workflows')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white px-2 py-1 rounded"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={handleTest}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Test
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <NodePalette onNodeSelect={handleNodeSelect} />
        <WorkflowCanvas nodes={nodes} onNodesChange={setNodes} />
      </div>
    </div>
  );
};

export default WorkflowBuilder;