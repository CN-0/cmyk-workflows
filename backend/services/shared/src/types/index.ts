export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  definition: WorkflowDefinition;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  version: number;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  settings?: WorkflowSettings;
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: string;
}

export interface WorkflowSettings {
  timeout?: number;
  retryPolicy?: RetryPolicy;
  errorHandling?: ErrorHandling;
  concurrency?: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
  retryOn?: string[];
}

export interface ErrorHandling {
  strategy: 'fail' | 'continue' | 'retry';
  fallbackNode?: string;
  notifyOnError?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
  triggerData?: any;
  context: Record<string, any>;
  currentNode?: string;
  error?: string;
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  data?: any;
  duration?: number;
}

export interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  totalDuration?: number;
  memoryUsage?: number;
  cpuUsage?: number;
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
  handler: string;
}

export interface NodeInput {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export interface NodeConfig {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  validation?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}