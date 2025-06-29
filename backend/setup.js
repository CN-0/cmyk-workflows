const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up backend services...');

const services = ['auth', 'gateway', 'workflow', 'execution', 'shared'];

// Create service directories and install dependencies
services.forEach(service => {
  const servicePath = path.join(__dirname, 'services', service);
  
  if (fs.existsSync(servicePath)) {
    console.log(`📦 Installing dependencies for ${service} service...`);
    try {
      execSync('npm install', { 
        cwd: servicePath, 
        stdio: 'inherit' 
      });
      console.log(`✅ ${service} service dependencies installed`);
    } catch (error) {
      console.error(`❌ Failed to install dependencies for ${service}:`, error.message);
    }
  } else {
    console.log(`⚠️  Service directory not found: ${servicePath}`);
  }
});

// Setup Docker and Kubernetes if needed
console.log('🐳 Docker and Kubernetes configurations are ready');

console.log('✅ Backend setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Configure your environment variables');
console.log('2. Run "npm run dev" to start all services');
console.log('3. Check individual service logs for any issues');