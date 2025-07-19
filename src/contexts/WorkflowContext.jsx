import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { nodeTemplates } from '../data/nodeTemplates';
import { useAuth } from './AuthContext';

const WorkflowContext = createContext(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider = ({ children }) => {
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await apiService.getWorkflows();
      if (response.success) {
        setWorkflows(response.data);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkflow = async (id) => {
    try {
      const response = await apiService.getWorkflow(id);
      if (response.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get workflow:', error);
      throw error;
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await apiService.getExecutions();
      if (response.success) {
        setExecutions(response.data);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  useEffect(() => {
    // Only load data when user is authenticated and auth loading is complete
    if (user && !authLoading) {
      loadWorkflows();
      loadExecutions();
    }
  }, [user, authLoading]);

  const createWorkflow = async (workflowData) => {
    try {
      const response = await apiService.createWorkflow(workflowData);
      if (response.success) {
        setWorkflows(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (id, updates) => {
    try {
      const response = await apiService.updateWorkflow(id, updates);
      if (response.success) {
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === id ? response.data : workflow
        ));
        return response.data;
      }
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (id) => {
    try {
      const response = await apiService.deleteWorkflow(id);
      if (response.success) {
        setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  };

  const executeWorkflow = async (id) => {
    try {
      const response = await apiService.triggerWorkflow(id);
      if (response.success) {
        // Reload executions to show the new one
        loadExecutions();
        return response.data;
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    }
  };

  const duplicateWorkflow = async (id) => {
    try {
      const response = await apiService.duplicateWorkflow(id);
      if (response.success) {
        setWorkflows(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to duplicate workflow:', error);
      throw error;
    }
  };

  return (
    <WorkflowContext.Provider value={{
      workflows,
      executions,
      nodeTemplates,
      loading,
      getWorkflow,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
      executeWorkflow,
      duplicateWorkflow,
      loadWorkflows,
      loadExecutions,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};