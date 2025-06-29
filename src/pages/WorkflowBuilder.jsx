import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NodePalette from '../components/WorkflowBuilder/NodePalette';
import WorkflowCanvas from '../components/WorkflowBuilder/WorkflowCanvas';
import { WorkflowNode, NodeTemplate } from '../types/workflow';
import { Save, Play, Settings, ArrowLeft, Zap } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createWorkflow, updateWorkflow, workflows } = useWorkflow();
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing workflow if editing
  useEffect(() => {
    if (id && workflows.length > 0) {
      setIsLoading(true);
      const workflow = workflows.find(w => w.id === id);
      if (workflow) {
        setWorkflowName(workflow.name);
        setWorkflowDescription(workflow.description || '');
        if (workflow.definition) {
          setNodes(workflow.definition.nodes || []);
          setEdges(workflow.definition.edges || []);
        }
      }
      setIsLoading(false);
    }
  }, [id, workflows]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        definition: {
          nodes,
          edges,
          variables: {},
          settings: {}
        },
        tags: [],
        status: 'draft'
      };

      if (id) {
        // Update existing workflow
        await updateWorkflow(id, workflowData);
      } else {
        // Create new workflow
        const newWorkflow = await createWorkflow(workflowData);
        if (newWorkflow) {
          navigate(`/workflows/${newWorkflow.id}/edit`);
        }
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to test the workflow');
      return;
    }
    
    // TODO: Implement workflow testing
    console.log('Testing workflow with nodes:', nodes, 'and edges:', edges);
    alert('Workflow testing is not yet implemented');
  };

  const handleNodeSelect = (template) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      label: template.name,
      position: { x: 200, y: 100 + nodes.length * 150 },
      data: {},
    };
    setNodes([...nodes, newNode]);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    );
  }

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
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white px-2 py-1 rounded"
                  placeholder="Workflow name"
                />
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  className="block text-sm text-gray-500 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white px-2 py-1 rounded mt-1"
                  placeholder="Add a description..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              {nodes.length} nodes • {edges.length} connections
            </div>
            
            <button 
              onClick={handleTest}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Test
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !workflowName.trim()}
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
        <WorkflowCanvas 
          nodes={nodes} 
          edges={edges}
          onNodesChange={setNodes} 
          onEdgesChange={setEdges}
        />
      </div>

      {/* Instructions */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>💡 <strong>Tip:</strong> Drag nodes from the left panel to the canvas</span>
            <span>🔗 Click the blue/green dots on nodes to create connections</span>
            <span>🎯 Click nodes to select them, drag to move</span>
          </div>
          <div className="text-xs text-gray-500">
            Press Esc to cancel connections
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;