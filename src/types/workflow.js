// Type definitions as JSDoc comments for better IDE support

/**
 * @typedef {Object} WorkflowNode
 * @property {string} id
 * @property {string} type
 * @property {string} label
 * @property {{x: number, y: number}} position
 * @property {Object} data
 * @property {NodeConnection[]} [inputs]
 * @property {NodeConnection[]} [outputs]
 */

/**
 * @typedef {Object} NodeConnection
 * @property {string} id
 * @property {'trigger'|'action'|'condition'} type
 * @property {string} label
 */

/**
 * @typedef {Object} WorkflowEdge
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {string} [sourceHandle]
 * @property {string} [targetHandle]
 */

/**
 * @typedef {Object} Workflow
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {'active'|'inactive'|'draft'} status
 * @property {WorkflowNode[]} nodes
 * @property {WorkflowEdge[]} edges
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} createdBy
 * @property {string[]} tags
 * @property {number} executionCount
 * @property {number} successRate
 */

/**
 * @typedef {Object} WorkflowExecution
 * @property {string} id
 * @property {string} workflowId
 * @property {'running'|'completed'|'failed'|'cancelled'} status
 * @property {Date} startedAt
 * @property {Date} [completedAt]
 * @property {string} [error]
 * @property {ExecutionLog[]} logs
 */

/**
 * @typedef {Object} ExecutionLog
 * @property {string} id
 * @property {string} nodeId
 * @property {Date} timestamp
 * @property {'info'|'warning'|'error'} level
 * @property {string} message
 * @property {*} [data]
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'admin'|'editor'|'viewer'} role
 * @property {string} [avatar]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} NodeTemplate
 * @property {string} id
 * @property {string} type
 * @property {'trigger'|'action'|'condition'|'utility'} category
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {string} color
 * @property {NodeInput[]} inputs
 * @property {NodeOutput[]} outputs
 * @property {NodeConfig[]} config
 */

/**
 * @typedef {Object} NodeInput
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {boolean} required
 */

/**
 * @typedef {Object} NodeOutput
 * @property {string} id
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} NodeConfig
 * @property {string} id
 * @property {string} name
 * @property {'string'|'number'|'boolean'|'select'|'multiselect'} type
 * @property {string} label
 * @property {boolean} required
 * @property {{value: string, label: string}[]} [options]
 * @property {*} [defaultValue]
 */

export {};