module.exports = {
  apps: [
    {
      name: 'buildingscience-millionaire',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/buildingscience-millionaire',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5050,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5050,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 5000,
      
      // Startup behavior
      min_uptime: '10s',
      max_restarts: 10,
      
      // Monitoring
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'YOUR_SERVER_IP',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/buildingscience-millionaire.git',
      path: '/var/www/buildingscience-millionaire',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },
  },
};