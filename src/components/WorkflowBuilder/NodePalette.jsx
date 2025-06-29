import React from 'react';
import * as LucideIcons from 'lucide-react';
import { nodeTemplates } from '../../data/nodeTemplates';

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
                {templates.map((template) => {
                  const IconComponent = LucideIcons[template.icon];
                  
                  return (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(template));
                      }}
                      onClick={() => onNodeSelect(template)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all group"
                      style={{ borderLeftColor: template.color, borderLeftWidth: '3px' }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                          {IconComponent && (
                            <IconComponent 
                              className="w-4 h-4" 
                              style={{ color: template.color }}
                            />
                          )}
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodePalette;