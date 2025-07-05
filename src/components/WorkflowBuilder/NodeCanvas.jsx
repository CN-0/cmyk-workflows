import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import * as LucideIcons from 'lucide-react';
import NodeConfigPanel from './NodeConfigPanel';
import ConnectionManager from './ConnectionManager';

const NodeComponent = ({ 
  node, 
  onUpdate, 
  onDelete, 
  onConnectionStart, 
  onConnectionEnd,
  isSelected, 
  onSelect,
  isConnecting,
  connectionSource,
  executionStatus
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } = useDraggable({
    id: node.id,
    data: { type: 'existing-node', node }
  });

  const style = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging || dndIsDragging ? 1000 : isSelected ? 100 : 1,
  };

  // Get node template info
  const getNodeInfo = () => {
    const defaultInfo = { icon: 'Circle', color: '#6b7280' };
    
    switch (node.type) {
      case 'webhook':
        return { icon: 'Webhook', color: '#10b981' };
      case 'schedule':
        return { icon: 'Clock', color: '#8b5cf6' };
      case 'email-received':
        return { icon: 'Mail', color: '#06b6d4' };
      case 'send-email':
        return { icon: 'Send', color: '#f59e0b' };
      case 'http-request':
        return { icon: 'Globe', color: '#3b82f6' };
      case 'database-insert':
        return { icon: 'Database', color: '#059669' };
      case 'condition':
        return { icon: 'GitBranch', color: '#dc2626' };
      case 'delay':
        return { icon: 'Timer', color: '#6b7280' };
      case 'transform':
        return { icon: 'Code', color: '#7c3aed' };
      default:
        return defaultInfo;
    }
  };

  const nodeInfo = getNodeInfo();
  const IconComponent = LucideIcons[nodeInfo.icon] || LucideIcons.Circle;

  const getStatusColor = () => {
    if (!executionStatus) return 'border-gray-200';
    switch (executionStatus) {
      case 'running': return 'border-blue-500 bg-blue-50';
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-200';
    }
  };

  const handleConnectionPoint = (e, type, handleId) => {
    e.stopPropagation();
    if (isConnecting && connectionSource) {
      onConnectionEnd(node.id, type, handleId);
    } else {
      onConnectionStart(node.id, type, handleId);
    }
  };

  const isValidConnectionTarget = (type, handleId) => {
    if (!isConnecting || !connectionSource) return false;
    
    // Can't connect to self
    if (connectionSource.nodeId === node.id) return false;
    
    // Can't connect output to output or input to input
    if (connectionSource.type === type) return false;
    
    return true;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg p-4 min-w-48 shadow-sm hover:shadow-md transition-all cursor-move select-none ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : getStatusColor()
      } ${isDragging || dndIsDragging ? 'opacity-75' : ''}`}
      onClick={() => onSelect && onSelect(node.id)}
      {...listeners}
      {...attributes}
    >
      {/* Input connection points */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 space-y-1">
        {node.inputs?.map((input, index) => (
          <div
            key={input.id}
            className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-colors ${
              isValidConnectionTarget('input', input.id) 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={(e) => handleConnectionPoint(e, 'input', input.id)}
            title={input.name}
            style={{ top: `${20 + index * 25}px` }}
          />
        )) || (
          <div
            className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-colors ${
              isValidConnectionTarget('input', 'default') 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={(e) => handleConnectionPoint(e, 'input', 'default')}
            title="Input"
          />
        )}
      </div>
      
      {/* Output connection points */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 space-y-1">
        {node.outputs?.map((output, index) => (
          <div
            key={output.id}
            className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-colors ${
              isValidConnectionTarget('output', output.id) 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={(e) => handleConnectionPoint(e, 'output', output.id)}
            title={output.name}
            style={{ top: `${20 + index * 25}px` }}
          />
        )) || (
          <div
            className={`w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-colors ${
              isValidConnectionTarget('output', 'default') 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={(e) => handleConnectionPoint(e, 'output', 'default')}
            title="Output"
          />
        )}
      </div>

      {/* Status indicator */}
      {executionStatus && (
        <div className="absolute -top-2 -right-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            executionStatus === 'running' ? 'bg-blue-500 animate-pulse' :
            executionStatus === 'success' ? 'bg-green-500' :
            executionStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}>
            {executionStatus === 'running' && <LucideIcons.Play className="w-3 h-3" />}
            {executionStatus === 'success' && <LucideIcons.Check className="w-3 h-3" />}
            {executionStatus === 'error' && <LucideIcons.X className="w-3 h-3" />}
            {executionStatus === 'warning' && <LucideIcons.AlertTriangle className="w-3 h-3" />}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-2 rounded-lg transition-transform"
          style={{ backgroundColor: nodeInfo.color + '20' }}
        >
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: nodeInfo.color }}
          />
        </div>
        <h4 className="font-medium text-gray-900 flex-1">{node.label}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(node.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LucideIcons.X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs text-gray-500">
          Type: {node.type}
        </div>
        {node.config && Object.keys(node.config).length > 0 && (
          <div className="text-xs text-gray-600">
            {Object.entries(node.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {String(value).substring(0, 20)}...
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NodeCanvas = ({ 
  nodes, 
  edges = [], 
  onNodesChange, 
  onEdgesChange,
  selectedNode,
  onNodeSelect,
  executionStatuses = {}
}) => {
  const [connecting, setConnecting] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const canvasRef = useRef(null);

  const { setNodeRef } = useDroppable({
    id: 'workflow-canvas',
  });

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (active.data.current?.type === 'existing-node') {
      setDraggedNode(active.data.current.node);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over, delta } = event;
    setDraggedNode(null);

    if (over?.id === 'workflow-canvas') {
      if (active.data.current?.type === 'template') {
        // Adding new node from palette
        try {
          const template = JSON.parse(active.data.current.template);
          const rect = canvasRef.current?.getBoundingClientRect();
          const newNode = {
            id: `node-${Date.now()}`,
            type: template.type,
            label: template.name,
            position: { 
              x: Math.max(0, (event.activatorEvent?.clientX || 200) - (rect?.left || 0) - 100), 
              y: Math.max(0, (event.activatorEvent?.clientY || 100) - (rect?.top || 0) - 50) 
            },
            data: {},
            config: {},
            inputs: template.inputs || [],
            outputs: template.outputs || [],
          };
          onNodesChange([...nodes, newNode]);
        } catch (error) {
          console.error('Error parsing node template:', error);
        }
      } else if (active.data.current?.type === 'existing-node') {
        // Moving existing node
        const nodeIndex = nodes.findIndex(n => n.id === active.id);
        if (nodeIndex !== -1 && delta) {
          const updatedNodes = [...nodes];
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            position: {
              x: Math.max(0, updatedNodes[nodeIndex].position.x + delta.x),
              y: Math.max(0, updatedNodes[nodeIndex].position.y + delta.y),
            },
          };
          onNodesChange(updatedNodes);
        }
      }
    }
  }, [nodes, onNodesChange]);

  const updateNode = useCallback((id, updates) => {
    const updatedNodes = nodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    );
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  const deleteNode = useCallback((id) => {
    const updatedNodes = nodes.filter(node => node.id !== id);
    const updatedEdges = edges.filter(edge => edge.source !== id && edge.target !== id);
    onNodesChange(updatedNodes);
    onEdgesChange && onEdgesChange(updatedEdges);
    if (selectedNode === id) {
      onNodeSelect(null);
      setShowConfigPanel(false);
    }
  }, [nodes, edges, onNodesChange, onEdgesChange, selectedNode, onNodeSelect]);

  const handleConnectionStart = useCallback((nodeId, type, handleId) => {
    setConnecting({ nodeId, type, handleId });
  }, []);

  const handleConnectionEnd = useCallback((targetNodeId, targetType, targetHandleId) => {
    if (connecting && connecting.nodeId !== targetNodeId) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: connecting.type === 'output' ? connecting.nodeId : targetNodeId,
        target: connecting.type === 'output' ? targetNodeId : connecting.nodeId,
        sourceHandle: connecting.type === 'output' ? connecting.handleId : targetHandleId,
        targetHandle: connecting.type === 'output' ? targetHandleId : connecting.handleId,
      };
      onEdgesChange && onEdgesChange([...edges, newEdge]);
    }
    setConnecting(null);
  }, [connecting, edges, onEdgesChange]);

  const deleteEdge = useCallback((edgeId) => {
    const updatedEdges = edges.filter(edge => edge.id !== edgeId);
    onEdgesChange && onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  const getConnectionPoint = (nodeId, type, handleId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const baseX = type === 'output' ? node.position.x + 192 : node.position.x;
    const baseY = node.position.y + 50;
    
    return { x: baseX, y: baseY };
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
      setConnecting(null);
      setShowConfigPanel(false);
    }
  };

  const handleNodeSelect = (nodeId) => {
    onNodeSelect(nodeId);
    setShowConfigPanel(!!nodeId);
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-1 overflow-hidden">
        <div 
          ref={(el) => {
            setNodeRef(el);
            canvasRef.current = el;
          }}
          className="flex-1 bg-gray-50 relative overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
          onClick={handleCanvasClick}
        >
          {/* Connection lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {edges.map((edge) => {
              const start = getConnectionPoint(edge.source, 'output', edge.sourceHandle);
              const end = getConnectionPoint(edge.target, 'input', edge.targetHandle);
              
              if (!start || !end) return null;
              
              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              
              return (
                <g key={edge.id}>
                  <path
                    d={`M ${start.x} ${start.y} Q ${midX} ${start.y} ${midX} ${midY} Q ${midX} ${end.y} ${end.x} ${end.y}`}
                    stroke="#6b7280"
                    strokeWidth="2"
                    fill="none"
                    className="hover:stroke-blue-500 cursor-pointer"
                    style={{ pointerEvents: 'stroke' }}
                    onClick={() => deleteEdge(edge.id)}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r="8"
                    fill="white"
                    stroke="#6b7280"
                    strokeWidth="2"
                    className="hover:fill-red-50 hover:stroke-red-500 cursor-pointer"
                    style={{ pointerEvents: 'all' }}
                    onClick={() => deleteEdge(edge.id)}
                  />
                  <text
                    x={midX}
                    y={midY + 1}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                    className="pointer-events-none"
                  >
                    ×
                  </text>
                </g>
              );
            })}
            
            {/* Temporary connection line while connecting */}
            {connecting && (
              <line
                x1={getConnectionPoint(connecting.nodeId, connecting.type, connecting.handleId)?.x || 0}
                y1={getConnectionPoint(connecting.nodeId, connecting.type, connecting.handleId)?.y || 0}
                x2={getConnectionPoint(connecting.nodeId, connecting.type, connecting.handleId)?.x || 0}
                y2={getConnectionPoint(connecting.nodeId, connecting.type, connecting.handleId)?.y || 0}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pointer-events-none"
              />
            )}
          </svg>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <LucideIcons.Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Start Building Your Workflow</h3>
                <p className="text-gray-400">Drag nodes from the left panel to get started</p>
              </div>
            </div>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              isSelected={selectedNode === node.id}
              onSelect={handleNodeSelect}
              isConnecting={!!connecting}
              connectionSource={connecting}
              executionStatus={executionStatuses[node.id]}
            />
          ))}

          {/* Connection instructions */}
          {connecting && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 text-sm text-blue-800 z-50">
              Click on another node's {connecting.type === 'output' ? 'input' : 'output'} connection point to create a link
              <button 
                onClick={() => setConnecting(null)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        {showConfigPanel && selectedNodeData && (
          <NodeConfigPanel
            node={selectedNodeData}
            onUpdate={(updates) => updateNode(selectedNodeData.id, updates)}
            onClose={() => {
              setShowConfigPanel(false);
              onNodeSelect(null);
            }}
          />
        )}
      </div>

      <DragOverlay>
        {draggedNode ? (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 min-w-48 shadow-lg opacity-75">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <LucideIcons.Circle className="w-4 h-4 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900">{draggedNode.label}</h4>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default NodeCanvas;