const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Database } = require('../services/shared/src/utils/database');
const path = require('path');

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');

  const authDb = new Database(path.join(__dirname, '../data/auth.db'));
  const workflowDb = new Database(path.join(__dirname, '../data/workflow.db'));

  try {
    await authDb.connect();
    await workflowDb.connect();

    // Check if admin user already exists
    const existingAdmin = await authDb.query('SELECT id FROM users WHERE email = ?', ['admin@flowforge.com']);
    
    if (existingAdmin.rows.length === 0) {
      // Create admin user
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await authDb.query(
        `INSERT INTO users (id, email, password, name, role, email_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [adminId, 'admin@flowforge.com', hashedPassword, 'Admin User', 'admin', 1]
      );

      console.log('👤 Created admin user: admin@flowforge.com / admin123');

      // Create sample workflows
      const sampleWorkflows = [
        {
          id: uuidv4(),
          name: 'Email Marketing Automation',
          description: 'Automatically send welcome emails to new subscribers',
          status: 'active',
          definition: JSON.stringify({
            nodes: [
              {
                id: 'trigger-1',
                type: 'webhook',
                label: 'New Subscriber',
                position: { x: 100, y: 100 },
                data: {}
              },
              {
                id: 'action-1',
                type: 'send-email',
                label: 'Send Welcome Email',
                position: { x: 300, y: 100 },
                data: {
                  to: '{{trigger.email}}',
                  subject: 'Welcome to FlowForge!',
                  body: 'Thank you for subscribing to our newsletter.'
                }
              }
            ],
            edges: [
              {
                id: 'edge-1',
                source: 'trigger-1',
                target: 'action-1'
              }
            ]
          }),
          tags: JSON.stringify(['email', 'marketing']),
          created_by: adminId
        },
        {
          id: uuidv4(),
          name: 'Lead Processing Pipeline',
          description: 'Process and qualify incoming leads from multiple sources',
          status: 'draft',
          definition: JSON.stringify({
            nodes: [
              {
                id: 'trigger-1',
                type: 'webhook',
                label: 'New Lead',
                position: { x: 100, y: 100 },
                data: {}
              },
              {
                id: 'condition-1',
                type: 'condition',
                label: 'Check Lead Score',
                position: { x: 300, y: 100 },
                data: {
                  value: '{{trigger.score}}',
                  operator: 'greater_than',
                  compare_value: '50'
                }
              }
            ],
            edges: [
              {
                id: 'edge-1',
                source: 'trigger-1',
                target: 'condition-1'
              }
            ]
          }),
          tags: JSON.stringify(['leads', 'crm']),
          created_by: adminId
        }
      ];

      for (const workflow of sampleWorkflows) {
        await workflowDb.query(
          `INSERT INTO workflows (id, name, description, status, definition, tags, created_by, created_at, updated_at, version)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)`,
          [workflow.id, workflow.name, workflow.description, workflow.status, workflow.definition, workflow.tags, workflow.created_by]
        );
      }

      console.log('⚡ Created sample workflows');
    } else {
      console.log('👤 Admin user already exists, skipping seed');
    }

    console.log('✅ Database seeding completed');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await authDb.close();
    await workflowDb.close();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };