# Production Setup Guide - Webbaharihook

Setup untuk production di VPS tanpa ngrok dan SSL localhost.

## 1. Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install pm2@latest -g

# Install nginx
sudo apt install nginx -y

# Install MySQL (jika belum ada)
sudo apt install mysql-server -y
```

## 2. Database Setup

```bash
# Login ke MySQL
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE webhook;
CREATE USER 'bahari'@'%' IDENTIFIED BY 'Seniati12345';
GRANT ALL PRIVILEGES ON webhook.* TO 'bahari'@'%';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Clone Project ke Server

```bash
# Buat directory
sudo mkdir -p /var/www/webbaharihook
sudo chown $USER:$USER /var/www/webbaharihook

# Clone project (ganti dengan repo URL kamu)
cd /var/www/webbaharihook
git clone https://github.com/your-username/webbaharihook.git .

# Install dependencies
npm install
```

## 4. Environment Configuration

```bash
# Copy environment file
cp .env.production .env
# Or use example template
cp .env.example .env

# Generate secure secret
openssl rand -base64 32

# Edit environment variables
nano .env
```

Update `.env` dengan domain kamu:
```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3018

# Domain Configuration (GANTI DENGAN DOMAIN KAMU)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Security (USE GENERATED SECRET)
NEXTAUTH_SECRET=[paste_generated_secret_here]
NEXTAUTH_TRUST_HOST=true

# Database
DATABASE_URL=mysql://bahari:Seniati12345@172.28.1.12:3306/webhook

LOG_LEVEL=info
LOG_FORMAT=combined
```

## 5. Build Project

```bash
# Setup database dan build
npm run deploy:setup

# Test production server
npm run start:prod
# Tekan Ctrl+C untuk stop
```

## 6. SSL Certificate dengan Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate (GANTI dengan domain kamu)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 7. nginx Configuration

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/webbaharihook

# Edit config dengan domain kamu
sudo nano /etc/nginx/sites-available/webbaharihook
```

**Update di nginx config:**
- Ganti `your-domain.com` dengan domain kamu
- Path SSL certificate akan otomatis diset oleh certbot

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/webbaharihook /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test dan restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 8. Start dengan PM2

```bash
# Start aplikasi
npm run pm2:start

# Save PM2 process list
pm2 save

# Setup auto-start PM2
pm2 startup
# Jalankan perintah yang ditampilkan
```

## 9. Firewall Setup

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 10. Verification

1. **Check services:**
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

2. **Check ports:**
```bash
netstat -tlnp | grep :3001
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

3. **Test application:**
- Buka `https://yourdomain.com`
- Register user baru
- Buat webhook dan test

## 11. Management Commands

```bash
# PM2 Management
npm run pm2:logs      # Lihat logs
npm run pm2:restart   # Restart app
npm run pm2:stop      # Stop app
npm run pm2:monit     # Monitor real-time

# nginx logs
sudo tail -f /var/log/nginx/webbaharihook-access.log
sudo tail -f /var/log/nginx/webbaharihook-error.log

# Application logs
tail -f logs/combined.log
```

## 12. Updates

```bash
cd /var/www/webbaharihook

# Pull updates
git pull origin main

# Install new dependencies (jika ada)
npm install

# Rebuild
npm run build:prod

# Restart PM2
npm run pm2:restart
```

## Key Differences dari Development:

1. **No ngrok** - Direct nginx reverse proxy
2. **No localhost SSL** - Certbot handles SSL
3. **Single PM2 process** - Hanya server production
4. **Production optimized** - Environment variables untuk production

**URL Structure:**
- **Production**: `https://yourdomain.com/api/w/[endpoint]`  
- **Development**: `https://172.28.1.12:3001/api/w/[endpoint]`

Server siap untuk production! 🚀