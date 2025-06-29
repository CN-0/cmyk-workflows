import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workflow, WorkflowExecution, NodeTemplate } from '../types/workflow';
import { nodeTemplates } from '../data/nodeTemplates';

interface WorkflowContextType {
  workflows: Workflow[];
  executions: WorkflowExecution[];
  nodeTemplates: NodeTemplate[];
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successRate'>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  executeWorkflow: (id: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  useEffect(() => {
    // Load mock data
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Email Marketing Automation',
        description: 'Automatically send welcome emails to new subscribers',
        status: 'active',
        nodes: [],
        edges: [],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        createdBy: '1',
        tags: ['email', 'marketing'],
        executionCount: 145,
        successRate: 96.5,
      },
      {
        id: '2',
        name: 'Lead Processing Pipeline',
        description: 'Process and qualify incoming leads from multiple sources',
        status: 'active',
        nodes: [],
        edges: [],
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 3600000),
        createdBy: '1',
        tags: ['leads', 'crm'],
        executionCount: 89,
        successRate: 94.2,
      },
      {
        id: '3',
        name: 'Customer Support Ticket Routing',
        description: 'Automatically route support tickets based on priority and category',
        status: 'draft',
        nodes: [],
        edges: [],
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(Date.now() - 1800000),
        createdBy: '1',
        tags: ['support', 'automation'],
        executionCount: 0,
        successRate: 0,
      },
    ];

    setWorkflows(mockWorkflows);
  }, []);

  const createWorkflow = (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successRate'>) => {
    const newWorkflow: Workflow = {
      ...workflowData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0,
    };
    setWorkflows(prev => [...prev, newWorkflow]);
  };

  const updateWorkflow = (id: string, updates: Partial<Workflow>) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, ...updates, updatedAt: new Date() }
        : workflow
    ));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
  };

  const executeWorkflow = (id: string) => {
    const execution: WorkflowExecution = {
      id: Date.now().toString(),
      workflowId: id,
      status: 'running',
      startedAt: new Date(),
      logs: [
        {
          id: '1',
          nodeId: 'trigger',
          timestamp: new Date(),
          level: 'info',
          message: 'Workflow execution started',
        },
      ],
    };
    setExecutions(prev => [...prev, execution]);

    // Simulate workflow execution
    setTimeout(() => {
      setExecutions(prev => prev.map(exec => 
        exec.id === execution.id 
          ? { 
              ...exec, 
              status: Math.random() > 0.1 ? 'completed' : 'failed',
              completedAt: new Date(),
              error: Math.random() > 0.1 ? undefined : 'Connection timeout',
            }
          : exec
      ));
    }, 3000);
  };

  return (
    <WorkflowContext.Provider value={{
      workflows,
      executions,
      nodeTemplates,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      executeWorkflow,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};