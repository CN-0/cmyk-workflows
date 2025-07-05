import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnhancedNodePalette from '../components/WorkflowBuilder/EnhancedNodePalette';
import NodeCanvas from '../components/WorkflowBuilder/NodeCanvas';
import ConnectionManager from '../components/WorkflowBuilder/ConnectionManager';
import { Save, Play, Settings, ArrowLeft, Zap, Eye, TestTube, Download } from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';

const EnhancedWorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createWorkflow, updateWorkflow, workflows } = useWorkflow();
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectionManager, setShowConnectionManager] = useState(false);
  const [executionStatuses, setExecutionStatuses] = useState({});
  const [isTestMode, setIsTestMode] = useState(false);

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

  const handleTest = async () => {
    if (nodes.length === 0) {
      alert('Please add some nodes to test the workflow');
      return;
    }
    
    setIsTestMode(true);
    
    // Simulate workflow execution
    const triggerNodes = nodes.filter(node => 
      node.type === 'webhook' || node.type === 'schedule' || node.type === 'email-received'
    );
    
    if (triggerNodes.length === 0) {
      alert('Please add at least one trigger node to test the workflow');
      setIsTestMode(false);
      return;
    }

    // Simulate execution flow
    const executionOrder = getExecutionOrder();
    
    for (let i = 0; i < executionOrder.length; i++) {
      const nodeId = executionOrder[i];
      
      // Set node as running
      setExecutionStatuses(prev => ({ ...prev, [nodeId]: 'running' }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Randomly determine success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      setExecutionStatuses(prev => ({ 
        ...prev, 
        [nodeId]: success ? 'success' : 'error' 
      }));
      
      // If a node fails, stop execution
      if (!success) {
        alert(`Workflow execution failed at node: ${nodes.find(n => n.id === nodeId)?.label}`);
        break;
      }
    }
    
    setIsTestMode(false);
    
    // Clear statuses after 3 seconds
    setTimeout(() => {
      setExecutionStatuses({});
    }, 3000);
  };

  const getExecutionOrder = () => {
    // Simple topological sort to determine execution order
    const visited = new Set();
    const order = [];
    
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit dependencies first
      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      incomingEdges.forEach(edge => visit(edge.source));
      
      order.push(nodeId);
    };
    
    // Start with trigger nodes
    const triggerNodes = nodes.filter(node => 
      node.type === 'webhook' || node.type === 'schedule' || node.type === 'email-received'
    );
    
    triggerNodes.forEach(node => visit(node.id));
    
    return order;
  };

  const handleExport = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      definition: { nodes, edges },
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNodeSelect = (template) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: template.type,
      label: template.name,
      position: { x: 200, y: 100 + nodes.length * 150 },
      data: {},
      config: {},
      inputs: template.inputs || [],
      outputs: template.outputs || [],
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
              onClick={() => setShowConnectionManager(!showConnectionManager)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showConnectionManager 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              Connections
            </button>
            
            <button 
              onClick={handleTest}
              disabled={isTestMode}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <TestTube className="w-4 h-4" />
              {isTestMode ? 'Testing...' : 'Test'}
            </button>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
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
      <div className="flex-1 flex overflow-hidden relative">
        <EnhancedNodePalette onNodeSelect={handleNodeSelect} />
        
        <NodeCanvas 
          nodes={nodes} 
          edges={edges}
          onNodesChange={setNodes} 
          onEdgesChange={setEdges}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          executionStatuses={executionStatuses}
        />
        
        {showConnectionManager && (
          <ConnectionManager
            nodes={nodes}
            edges={edges}
            onEdgesChange={setEdges}
            selectedConnection={selectedConnection}
            onConnectionSelect={setSelectedConnection}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>💡 <strong>Tip:</strong> Drag nodes from the left panel to the canvas</span>
            <span>🔗 Click connection points to link nodes</span>
            <span>⚙️ Select nodes to configure them</span>
          </div>
          <div className="flex items-center gap-4">
            {isTestMode && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Testing workflow...</span>
              </div>
            )}
            <div className="text-xs text-gray-500">
              Last saved: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWorkflowBuilder;