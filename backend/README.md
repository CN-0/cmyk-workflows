# Workflow Automation Backend

This is the backend infrastructure for the workflow automation platform, built with a microservices architecture using SQLite databases.

## Architecture

The backend consists of several microservices:

- **Auth Service**: Handles user authentication and authorization
- **Gateway Service**: API gateway and request routing
- **Workflow Service**: Manages workflow definitions and templates
- **Execution Service**: Handles workflow execution and monitoring
- **Shared**: Common utilities and types

## Database

The application uses SQLite databases for data persistence:

- **auth.db**: User authentication and authorization data
- **workflow.db**: Workflow definitions, templates, and metadata
- **execution.db**: Workflow execution logs and metrics

## Setup

1. Install dependencies:
   ```bash
   npm run setup
   ```

2. Run database migrations:
   ```bash
   npm run migrate
   ```

3. Seed the database with initial data:
   ```bash
   npm run seed
   ```

4. Start all services in development mode:
   ```bash
   npm run dev
   ```

## Services

### Auth Service (Port 3001)
- User registration and login
- JWT token management
- User profile management
- Database: `data/auth.db`

### Gateway Service (Port 3000)
- API gateway and routing
- Request validation
- Rate limiting

### Workflow Service (Port 3002)
- Workflow CRUD operations
- Template management
- Workflow validation
- Database: `data/workflow.db`

### Execution Service (Port 3003)
- Workflow execution engine
- Queue management
- Execution monitoring
- Database: `data/execution.db`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key configuration options:

- `DATABASE_PATH`: Path to auth SQLite database
- `WORKFLOW_DATABASE_PATH`: Path to workflow SQLite database
- `EXECUTION_DATABASE_PATH`: Path to execution SQLite database
- `REDIS_URL`: Redis connection string for caching
- `JWT_SECRET`: Secret key for JWT token signing

## Database Management

### Migrations
Run database migrations to set up the schema:
```bash
npm run migrate
```

### Seeding
Populate the database with initial data:
```bash
npm run seed
```

This creates:
- Admin user: `admin@flowforge.com` / `admin123`
- Sample workflows for testing

### Database Files
SQLite database files are stored in the `data/` directory:
- `data/auth.db` - Authentication data
- `data/workflow.db` - Workflow definitions
- `data/execution.db` - Execution logs and metrics

## Docker Support

Run with Docker Compose:

```bash
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Workflows
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Executions
- `GET /api/executions` - List executions
- `POST /api/executions` - Trigger workflow execution
- `GET /api/executions/:id` - Get execution details
- `POST /api/executions/:id/cancel` - Cancel execution

## Development

### Adding New Migrations
1. Create a new migration file in `scripts/migrations/`
2. Update the migration runner to include your new migration
3. Run `npm run migrate` to apply changes

### Testing
Each service includes its own test suite. Run tests with:
```bash
npm test
```

### Logging
All services use structured logging with Winston. Log levels can be configured via the `LOG_LEVEL` environment variable.