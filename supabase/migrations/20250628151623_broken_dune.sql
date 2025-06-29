-- Create databases for different services
CREATE DATABASE flowforge_auth;
CREATE DATABASE flowforge_workflow;
CREATE DATABASE flowforge_execution;

-- Create users with appropriate permissions
CREATE USER auth_service WITH PASSWORD 'auth_password';
CREATE USER workflow_service WITH PASSWORD 'workflow_password';
CREATE USER execution_service WITH PASSWORD 'execution_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE flowforge_auth TO auth_service;
GRANT ALL PRIVILEGES ON DATABASE flowforge_workflow TO workflow_service;
GRANT ALL PRIVILEGES ON DATABASE flowforge_execution TO execution_service;

-- Enable UUID extension
\c flowforge_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c flowforge_workflow;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c flowforge_execution;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";