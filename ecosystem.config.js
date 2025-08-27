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
        HOST: '127.0.0.1', // <— PAKAI IPv4 agar cocok dgn Nginx
        NEXTAUTH_URL: 'https://webbaharihook.baharihari.com', // <— perbaiki domain
        NEXTAUTH_SECRET: 'your-super-secret-key-here',
        DATABASE_URL: 'mysql://bahari:Seniati12345@172.28.1.12:3306/webhook',
        // (opsional) jika NextAuth minta
        NEXTAUTH_TRUST_HOST: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3018,
        HOST: '127.0.0.1',
        NEXTAUTH_URL: 'https://webbaharihook.baharihari.com',
        NEXTAUTH_SECRET: 'your-super-secret-key-here',
        DATABASE_URL: 'mysql://bahari:Seniati12345@172.28.1.12:3306/webhook',
        NEXTAUTH_TRUST_HOST: 'true'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],
};
