import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import * as LucideIcons from 'lucide-react';

const NodeComponent = ({ node, onUpdate, onDelete, onConnect, isSelected, onSelect }) => {
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
    zIndex: isDragging || dndIsDragging ? 1000 : 1,
  };

  // Find the template to get the icon and color
  const template = {
    icon: 'Circle',
    color: '#6b7280',
    name: node.label,
  };

  const IconComponent = LucideIcons[template.icon] || LucideIcons.Circle;

  const handleConnectionStart = (e, type) => {
    e.stopPropagation();
    onConnect && onConnect(node.id, type);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-lg p-4 min-w-48 shadow-sm hover:shadow-md transition-all cursor-move select-none ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      } ${isDragging || dndIsDragging ? 'opacity-75' : ''}`}
      onClick={() => onSelect && onSelect(node.id)}
      {...listeners}
      {...attributes}
    >
      {/* Input connection point */}
      <div 
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors"
        onClick={(e) => handleConnectionStart(e, 'input')}
        title="Input connection"
      />
      
      {/* Output connection point */}
      <div 
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600 transition-colors"
        onClick={(e) => handleConnectionStart(e, 'output')}
        title="Output connection"
      />

      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-2 rounded-lg group-hover:scale-110 transition-transform"
          style={{ backgroundColor: template.color + '20' }}
        >
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: template.color }}
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
      </div>
    </div>
  );
};

const ConnectionLine = ({ start, end, onDelete }) => {
  if (!start || !end) return null;

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <g>
      <path
        d={`M ${start.x} ${start.y} Q ${midX} ${start.y} ${midX} ${midY} Q ${midX} ${end.y} ${end.x} ${end.y}`}
        stroke="#6b7280"
        strokeWidth="2"
        fill="none"
        className="hover:stroke-blue-500 cursor-pointer"
        onClick={onDelete}
      />
      {/* Connection delete button */}
      <circle
        cx={midX}
        cy={midY}
        r="8"
        fill="white"
        stroke="#6b7280"
        strokeWidth="2"
        className="hover:fill-red-50 hover:stroke-red-500 cursor-pointer"
        onClick={onDelete}
      />
      <LucideIcons.X 
        x={midX - 4} 
        y={midY - 4} 
        width="8" 
        height="8" 
        className="pointer-events-none text-gray-600"
      />
    </g>
  );
};

const WorkflowCanvas = ({ nodes, edges = [], onNodesChange, onEdgesChange }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
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
      setSelectedNode(null);
    }
  }, [nodes, edges, onNodesChange, onEdgesChange, selectedNode]);

  const handleConnect = useCallback((nodeId, type) => {
    if (connecting) {
      if (connecting.nodeId !== nodeId) {
        // Create connection
        const newEdge = {
          id: `edge-${Date.now()}`,
          source: connecting.type === 'output' ? connecting.nodeId : nodeId,
          target: connecting.type === 'output' ? nodeId : connecting.nodeId,
        };
        onEdgesChange && onEdgesChange([...edges, newEdge]);
      }
      setConnecting(null);
    } else {
      setConnecting({ nodeId, type });
    }
  }, [connecting, edges, onEdgesChange]);

  const deleteEdge = useCallback((edgeId) => {
    const updatedEdges = edges.filter(edge => edge.id !== edgeId);
    onEdgesChange && onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  const getConnectionPoint = (nodeId, type) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    return {
      x: node.position.x + (type === 'output' ? 192 : 0), // 192px is approximate node width
      y: node.position.y + 50, // Approximate center height
    };
  };

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedNode(null);
      setConnecting(null);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            const start = getConnectionPoint(edge.source, 'output');
            const end = getConnectionPoint(edge.target, 'input');
            return (
              <ConnectionLine
                key={edge.id}
                start={start}
                end={end}
                onDelete={() => deleteEdge(edge.id)}
              />
            );
          })}
          
          {/* Temporary connection line while connecting */}
          {connecting && (
            <line
              x1={getConnectionPoint(connecting.nodeId, connecting.type)?.x || 0}
              y1={getConnectionPoint(connecting.nodeId, connecting.type)?.y || 0}
              x2={getConnectionPoint(connecting.nodeId, connecting.type)?.x || 0}
              y2={getConnectionPoint(connecting.nodeId, connecting.type)?.y || 0}
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
            onConnect={handleConnect}
            isSelected={selectedNode === node.id}
            onSelect={setSelectedNode}
          />
        ))}

        {/* Connection instructions */}
        {connecting && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 text-sm text-blue-800">
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

export default WorkflowCanvas;