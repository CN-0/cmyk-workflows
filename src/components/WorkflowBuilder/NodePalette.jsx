import React from 'react';
import * as LucideIcons from 'lucide-react';
import { NodeTemplate } from '../../types/workflow';
import { nodeTemplates } from '../../data/nodeTemplates';
import { useDraggable } from '@dnd-kit/core';

const DraggableNodeTemplate = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: { 
      type: 'template',
      template: JSON.stringify(template)
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = LucideIcons[template.icon] || LucideIcons.Circle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ 
        borderLeftColor: template.color, 
        borderLeftWidth: '3px',
        ...style
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg group-hover:scale-110 transition-transform"
          style={{ backgroundColor: template.color + '20' }}
        >
          <IconComponent 
            className="w-4 h-4" 
            style={{ color: template.color }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-medium text-gray-900 mb-1">
            {template.name}
          </h5>
          <p className="text-xs text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const NodePalette = ({ onNodeSelect }) => {
  const categories = {
    trigger: { name: 'Triggers', color: 'text-green-600' },
    action: { name: 'Actions', color: 'text-blue-600' },
    condition: { name: 'Conditions', color: 'text-red-600' },
    utility: { name: 'Utilities', color: 'text-purple-600' },
  };

  const groupedTemplates = nodeTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Node Library</h3>
        <p className="text-sm text-gray-600 mt-1">Drag and drop nodes to build your workflow</p>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(categories).map(([categoryKey, category]) => {
          const templates = groupedTemplates[categoryKey] || [];
          
          return (
            <div key={categoryKey}>
              <h4 className={`text-sm font-medium mb-3 ${category.color}`}>
                {category.name}
              </h4>
              
              <div className="space-y-2">
                {templates.map((template) => (
                  <DraggableNodeTemplate
                    key={template.id}
                    template={template}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodePalette;