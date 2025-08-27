// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'webbaharihook-main',
      script: 'server-production.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3018,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],
};
