# VPS Deployment Guide - Webbaharihook

This guide will help you deploy Webbaharihook to your VPS using PM2 and nginx.

## Prerequisites

- VPS with Ubuntu/Debian
- Node.js 18+ installed
- PM2 installed globally
- nginx installed
- MySQL database server
- Domain name with DNS pointing to your VPS

## 1. Server Setup

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install pm2@latest -g

# Install nginx
sudo apt install nginx -y

# Install MySQL (if not already installed)
sudo apt install mysql-server -y
```

### Setup MySQL Database
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE webhook;
CREATE USER 'bahari'@'%' IDENTIFIED BY 'Seniati12345';
GRANT ALL PRIVILEGES ON webhook.* TO 'bahari'@'%';
FLUSH PRIVILEGES;
EXIT;
```

## 2. Project Deployment

### Clone and Setup Project
```bash
# Create directory
sudo mkdir -p /var/www/webbaharihook
sudo chown $USER:$USER /var/www/webbaharihook

# Clone repository (replace with your git repo)
cd /var/www/webbaharihook
git clone https://github.com/your-username/webbaharihook.git .

# Install dependencies
npm install

# Setup environment
cp .env.production .env
```

### Configure Environment Variables
Edit `.env` file and update the following:
```bash
# Update domain
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Update database (if different)
DATABASE_URL=mysql://bahari:Seniati12345@localhost:3306/webhook

# Generate secure secret
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
```

### Build and Setup Database
```bash
# Run deployment setup
npm run deploy:setup

# This runs:
# - mkdir -p logs
# - npm run prisma:generate
# - npm run build:prod
```

## 3. SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option 2: Custom SSL Certificate
If using custom certificates, place them in:
- `/etc/ssl/certs/your-domain.crt`
- `/etc/ssl/private/your-domain.key`

## 4. nginx Configuration

### Copy nginx configuration
```bash
sudo cp nginx.conf /etc/nginx/sites-available/webbaharihook
sudo ln -s /etc/nginx/sites-available/webbaharihook /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default
```

### Update nginx configuration
Edit `/etc/nginx/sites-available/webbaharihook` and replace:
- `your-domain.com` with your actual domain
- Certificate paths (if using custom SSL)

### Test and restart nginx
```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 5. PM2 Deployment

### Start applications
```bash
# Start with PM2
npm run pm2:start

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# Follow the instructions provided by the command above
```

### PM2 Management Commands
```bash
# Monitor applications
npm run pm2:monit
# or
pm2 monit

# View logs
npm run pm2:logs
# or
pm2 logs

# Restart applications
npm run pm2:restart

# Stop applications
npm run pm2:stop

# Delete applications
npm run pm2:delete
```

## 6. Verification

### Check Services
```bash
# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# Check if ports are listening
netstat -tlnp | grep :3001
netstat -tlnp | grep :3002
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### Test Application
1. Visit `https://your-domain.com` - should show landing page
2. Try creating an account and webhook
3. Test webhook endpoint functionality

## 7. Monitoring and Logs

### Application Logs
```bash
# PM2 logs
pm2 logs

# Individual app logs
pm2 logs webbaharihook-https
pm2 logs webbaharihook-http

# Log files location
tail -f logs/combined.log
tail -f logs/err.log
tail -f logs/out.log
```

### nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/webbaharihook-access.log

# Error logs
sudo tail -f /var/log/nginx/webbaharihook-error.log

# Webhook specific logs
sudo tail -f /var/log/nginx/webhook-access.log
sudo tail -f /var/log/nginx/webhook-error.log
```

## 8. Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build:prod

# Restart PM2
npm run pm2:restart
```

### Backup Database
```bash
# Create backup
mysqldump -u bahari -p webhook > webhook_backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u bahari -p webhook < webhook_backup_YYYYMMDD.sql
```

## 9. Troubleshooting

### Common Issues

**PM2 apps not starting:**
```bash
# Check PM2 logs
pm2 logs

# Restart PM2
pm2 restart ecosystem.config.js
```

**nginx 502 Bad Gateway:**
```bash
# Check if PM2 apps are running
pm2 status

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Database connection issues:**
```bash
# Test database connection
mysql -u bahari -p -h localhost webhook

# Check database URL in .env file
cat .env | grep DATABASE_URL
```

**SSL certificate issues:**
```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

## 10. Security Recommendations

1. **Firewall Setup:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **Regular Updates:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix
```

3. **Monitor Logs:**
   - Set up log rotation for application logs
   - Monitor for suspicious webhook requests
   - Use fail2ban for additional security

4. **Backup Strategy:**
   - Regular database backups
   - Application code backups
   - SSL certificate backups

## Support

For issues or questions:
- Check application logs first
- Review nginx error logs
- Verify PM2 process status
- Test database connectivity

Your Webbaharihook application should now be running at `https://your-domain.com`!