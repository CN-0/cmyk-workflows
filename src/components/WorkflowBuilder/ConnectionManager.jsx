import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const ConnectionManager = ({ 
  nodes, 
  edges, 
  onEdgesChange, 
  selectedConnection, 
  onConnectionSelect 
}) => {
  const [validationErrors, setValidationErrors] = useState([]);

  const validateConnections = useCallback(() => {
    const errors = [];
    
    // Check for orphaned nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const orphanedNodes = nodes.filter(node => 
      !connectedNodes.has(node.id) && node.type !== 'webhook' && node.type !== 'schedule'
    );
    
    orphanedNodes.forEach(node => {
      errors.push({
        type: 'warning',
        message: `Node "${node.label}" is not connected to any other nodes`,
        nodeId: node.id
      });
    });

    // Check for circular dependencies
    const visited = new Set();
    const recursionStack = new Set();
    
    const hasCycle = (nodeId) => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (hasCycle(edge.target)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    nodes.forEach(node => {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        errors.push({
          type: 'error',
          message: 'Circular dependency detected in workflow',
          nodeId: node.id
        });
      }
    });

    // Check for invalid data type connections
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceOutput = sourceNode.outputs?.find(o => o.id === edge.sourceHandle);
        const targetInput = targetNode.inputs?.find(i => i.id === edge.targetHandle);
        
        if (sourceOutput && targetInput && sourceOutput.type !== targetInput.type && 
            sourceOutput.type !== 'any' && targetInput.type !== 'any') {
          errors.push({
            type: 'warning',
            message: `Type mismatch: ${sourceOutput.type} → ${targetInput.type}`,
            edgeId: edge.id
          });
        }
      }
    });

    setValidationErrors(errors);
    return errors;
  }, [nodes, edges]);

  const getConnectionPath = (edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const start = {
      x: sourceNode.position.x + 192, // Node width
      y: sourceNode.position.y + 50   // Node center
    };
    
    const end = {
      x: targetNode.position.x,
      y: targetNode.position.y + 50
    };
    
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    return {
      start,
      end,
      midX,
      midY,
      path: `M ${start.x} ${start.y} Q ${midX} ${start.y} ${midX} ${midY} Q ${midX} ${end.y} ${end.x} ${end.y}`
    };
  };

  const deleteConnection = (edgeId) => {
    const updatedEdges = edges.filter(edge => edge.id !== edgeId);
    onEdgesChange(updatedEdges);
  };

  const getConnectionInfo = (edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const sourceOutput = sourceNode.outputs?.find(o => o.id === edge.sourceHandle);
    const targetInput = targetNode.inputs?.find(i => i.id === edge.targetHandle);
    
    return {
      source: {
        node: sourceNode,
        output: sourceOutput || { name: 'Output', type: 'any' }
      },
      target: {
        node: targetNode,
        input: targetInput || { name: 'Input', type: 'any' }
      }
    };
  };

  React.useEffect(() => {
    validateConnections();
  }, [validateConnections]);

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Connection Manager</h3>
        <p className="text-sm text-gray-600">Manage workflow connections and data flow</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Issues</h4>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded-lg ${
                    error.type === 'error' ? 'bg-red-50 text-red-700' :
                    error.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}
                >
                  {error.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {error.type === 'warning' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  {error.type === 'info' && <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span className="text-xs">{error.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Connection List */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Connections ({edges.length})
          </h4>
          
          {edges.length > 0 ? (
            <div className="space-y-2">
              {edges.map((edge) => {
                const info = getConnectionInfo(edge);
                if (!info) return null;
                
                return (
                  <div
                    key={edge.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedConnection === edge.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onConnectionSelect(edge.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {info.source.node.label} → {info.target.node.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {info.source.output.name} ({info.source.output.type}) → {info.target.input.name} ({info.target.input.type})
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConnection(edge.id);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Data type compatibility indicator */}
                    <div className="flex items-center gap-1 mt-2">
                      {info.source.output.type === info.target.input.type || 
                       info.source.output.type === 'any' || 
                       info.target.input.type === 'any' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {info.source.output.type === info.target.input.type || 
                         info.source.output.type === 'any' || 
                         info.target.input.type === 'any' 
                          ? 'Compatible types' 
                          : 'Type conversion needed'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">No connections yet</div>
              <div className="text-xs text-gray-500">
                Click and drag between node connection points to create connections
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection Statistics */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-gray-500">Total Nodes</div>
            <div className="font-medium text-gray-900">{nodes.length}</div>
          </div>
          <div>
            <div className="text-gray-500">Connections</div>
            <div className="font-medium text-gray-900">{edges.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionManager;