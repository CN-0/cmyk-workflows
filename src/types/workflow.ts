export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs?: NodeConnection[];
  outputs?: NodeConnection[];
}

export interface NodeConnection {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  executionCount: number;
  successRate: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  createdAt: Date;
}

export interface NodeTemplate {
  id: string;
  type: string;
  category: 'trigger' | 'action' | 'condition' | 'utility';
  name: string;
  description: string;
  icon: string;
  color: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  config: NodeConfig[];
}

export interface NodeInput {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: string;
}

export interface NodeConfig {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}