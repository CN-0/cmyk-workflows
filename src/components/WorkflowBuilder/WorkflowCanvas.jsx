import React, { useState, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import * as LucideIcons from 'lucide-react';

const NodeComponent = ({ node, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: node.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Find the template to get the icon and color
  const template = {
    icon: 'Circle',
    color: '#6b7280',
    name: node.label,
  };

  const IconComponent = LucideIcons[template.icon] || LucideIcons.Circle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute bg-white border-2 border-gray-200 rounded-lg p-4 min-w-48 shadow-sm hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: template.color + '20' }}
        >
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: template.color }}
          />
        </div>
        <h4 className="font-medium text-gray-900">{node.label}</h4>
        <button
          onClick={() => onDelete(node.id)}
          className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LucideIcons.X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Input/Output handles would go here */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500">
          Type: {node.type}
        </div>
      </div>
    </div>
  );
};

const WorkflowCanvas = ({ nodes, onNodesChange }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const { setNodeRef } = useDroppable({
    id: 'workflow-canvas',
  });

  const handleDragEnd = useCallback((event) => {
    const { active, over, delta } = event;

    if (over?.id === 'workflow-canvas' && active.data.current) {
      // Check if it's a new node from the palette
      if (typeof active.data.current === 'string') {
        try {
          const template = JSON.parse(active.data.current);
          const newNode = {
            id: `node-${Date.now()}`,
            type: template.type,
            label: template.name,
            position: { 
              x: Math.max(0, event.activatorEvent ? event.activatorEvent.clientX - 400 : 100), 
              y: Math.max(0, event.activatorEvent ? event.activatorEvent.clientY - 100 : 100) 
            },
            data: {},
          };
          onNodesChange([...nodes, newNode]);
        } catch (error) {
          console.error('Error parsing node template:', error);
        }
      } else {
        // Moving existing node
        const nodeIndex = nodes.findIndex(n => n.id === active.id);
        if (nodeIndex !== -1) {
          const updatedNodes = [...nodes];
          updatedNodes[nodeIndex] = {
            ...updatedNodes[nodeIndex],
            position: {
              x: updatedNodes[nodeIndex].position.x + delta.x,
              y: updatedNodes[nodeIndex].position.y + delta.y,
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
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div 
        ref={setNodeRef}
        className="flex-1 bg-gray-50 relative overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <LucideIcons.Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Start Building Your Workflow</h3>
              <p className="text-gray-400">Drag nodes from the left panel to get started</p>
            </div>
          </div>
        )}

        {nodes.map((node) => (
          <NodeComponent
            key={node.id}
            node={{
              ...node,
              position: { x: node.position.x, y: node.position.y }
            }}
            onUpdate={updateNode}
            onDelete={deleteNode}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default WorkflowCanvas;