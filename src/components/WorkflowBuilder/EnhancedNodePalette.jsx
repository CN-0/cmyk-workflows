import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { enhancedNodeTemplates } from '../../data/enhancedNodeTemplates';
import { useDraggable } from '@dnd-kit/core';
import { Search, Filter, ChevronDown, ChevronRight } from 'lucide-react';

const DraggableNodeTemplate = ({ template, onNodeSelect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${template.id}`,
    data: { 
      type: 'template',
      template: JSON.stringify(template)
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    borderLeftColor: template.color, 
    borderLeftWidth: '3px',
  };

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
      onClick={() => onNodeSelect && onNodeSelect(template)}
      tabIndex={0}
      role="button"
      aria-label={`Add ${template.name} node`}
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
          
          {/* Node complexity indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              template.complexity === 'beginner' ? 'bg-green-100 text-green-700' :
              template.complexity === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {template.complexity || 'basic'}
            </span>
            
            {template.inputs && template.inputs.length > 0 && (
              <span className="text-xs text-gray-500">
                {template.inputs.length} inputs
              </span>
            )}
            
            {template.outputs && template.outputs.length > 0 && (
              <span className="text-xs text-gray-500">
                {template.outputs.length} outputs
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection = ({ category, templates, onNodeSelect, isExpanded, onToggle }) => {
  const categoryInfo = {
    trigger: { name: 'Triggers', color: 'text-green-600', icon: 'Play' },
    action: { name: 'Actions', color: 'text-blue-600', icon: 'Zap' },
    condition: { name: 'Conditions', color: 'text-red-600', icon: 'GitBranch' },
    utility: { name: 'Utilities', color: 'text-purple-600', icon: 'Settings' },
  };

  const info = categoryInfo[category] || { name: category, color: 'text-gray-600', icon: 'Circle' };
  const IconComponent = LucideIcons[info.icon] || LucideIcons.Circle;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${info.color}`} />
          <h4 className={`text-sm font-medium ${info.color}`}>
            {info.name} ({templates.length})
          </h4>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {templates.map((template) => (
            <DraggableNodeTemplate
              key={template.id}
              template={template}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EnhancedNodePalette = ({ onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({
    trigger: true,
    action: true,
    condition: true,
    utility: true,
  });

  const filteredTemplates = enhancedNodeTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAll = () => {
    const allExpanded = Object.keys(groupedTemplates).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = Object.keys(groupedTemplates).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setExpandedCategories(allCollapsed);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Node Library</h3>
        <p className="text-sm text-gray-600 mb-4">Drag and drop nodes to build your workflow</p>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="trigger">Triggers</option>
            <option value="action">Actions</option>
            <option value="condition">Conditions</option>
            <option value="utility">Utilities</option>
          </select>
          
          <select
            value={complexityFilter}
            onChange={(e) => setComplexityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Expand All
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="p-4">
        {Object.keys(groupedTemplates).length > 0 ? (
          Object.entries(groupedTemplates).map(([categoryKey, templates]) => (
            <CategorySection
              key={categoryKey}
              category={categoryKey}
              templates={templates}
              onNodeSelect={onNodeSelect}
              isExpanded={expandedCategories[categoryKey]}
              onToggle={() => toggleCategory(categoryKey)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No nodes found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Total Nodes:</span>
            <span className="font-medium">{enhancedNodeTemplates.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Filtered:</span>
            <span className="font-medium">{filteredTemplates.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Categories:</span>
            <span className="font-medium">{Object.keys(groupedTemplates).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedNodePalette;