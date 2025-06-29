import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import Header from '../components/Layout/Header';
import { Plus, Search, Filter, Download, Star, Eye, Copy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  downloads: number;
  rating: number;
  thumbnail: string;
  nodes: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Email Marketing Automation',
    description: 'Complete email marketing workflow with lead nurturing, segmentation, and analytics',
    category: 'Marketing',
    tags: ['email', 'marketing', 'automation', 'leads'],
    author: 'FlowForge Team',
    downloads: 1250,
    rating: 4.8,
    thumbnail: 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    nodes: 12,
    complexity: 'intermediate',
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: '2',
    name: 'Customer Support Ticket Routing',
    description: 'Automatically route and prioritize customer support tickets based on urgency and category',
    category: 'Support',
    tags: ['support', 'tickets', 'routing', 'automation'],
    author: 'Support Pro',
    downloads: 890,
    rating: 4.6,
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    nodes: 8,
    complexity: 'beginner',
    createdAt: new Date(Date.now() - 86400000 * 14),
  },
  {
    id: '3',
    name: 'E-commerce Order Processing',
    description: 'Complete order processing workflow with inventory management, payment processing, and shipping',
    category: 'E-commerce',
    tags: ['orders', 'inventory', 'payment', 'shipping'],
    author: 'Commerce Expert',
    downloads: 2100,
    rating: 4.9,
    thumbnail: 'https://images.pexels.com/photos/3769747/pexels-photo-3769747.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    nodes: 18,
    complexity: 'advanced',
    createdAt: new Date(Date.now() - 86400000 * 21),
  },
  {
    id: '4',
    name: 'Social Media Content Scheduler',
    description: 'Schedule and publish content across multiple social media platforms with analytics',
    category: 'Social Media',
    tags: ['social', 'content', 'scheduling', 'analytics'],
    author: 'Social Guru',
    downloads: 750,
    rating: 4.4,
    thumbnail: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    nodes: 10,
    complexity: 'intermediate',
    createdAt: new Date(Date.now() - 86400000 * 30),
  },
];

const ComplexityBadge: React.FC<{ complexity: Template['complexity'] }> = ({ complexity }) => {
  const styles = {
    beginner: 'bg-green-50 text-green-700 border-green-200',
    intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[complexity]}`}>
      {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
    </span>
  );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}</span>
    </div>
  );
};

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [complexityFilter, setComplexityFilter] = useState<string>('all');

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleUseTemplate = (templateId: string) => {
    // TODO: Implement template usage
    console.log('Using template:', templateId);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // TODO: Implement template preview
    console.log('Previewing template:', templateId);
  };

  return (
    <Layout>
      <Header 
        title="Templates" 
        subtitle={`${templates.length} workflow templates • Browse and customize`}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        }
      />
      
      <div className="flex-1 overflow-auto">
        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <ComplexityBadge complexity={template.complexity} />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {template.name}
                      </h3>
                      <StarRating rating={template.rating} />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{template.tags.length - 3} more</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{template.nodes} nodes</span>
                      <span>{template.downloads.toLocaleString()} downloads</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Templates;