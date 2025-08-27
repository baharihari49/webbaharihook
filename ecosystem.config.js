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
        HOST: 'localhost',
        NEXTAUTH_URL: 'https://webbaharihook.bahari.com',
        NEXTAUTH_SECRET: 'your-super-secret-key-here',
        DATABASE_URL: 'mysql://bahari:Seniati12345@172.28.1.12:3306/webhook',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3018,
        HOST: 'localhost',
        NEXTAUTH_URL: 'https://webbaharihook.bahari.com',
        NEXTAUTH_SECRET: 'your-super-secret-key-here',
        DATABASE_URL: 'mysql://bahari:Seniati12345@172.28.1.12:3306/webhook',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],
};