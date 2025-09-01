# 🚀 Production Mode Locally

Guide untuk menjalankan aplikasi dalam production mode di local dengan ngrok tunnel.

## 🎯 Quick Start

```bash
# Satu command untuk semua setup
pnpm run prod:local
```

Script ini akan otomatis:
- ✅ Stop semua process yang berjalan
- 🔐 Setup SSL certificates (jika diperlukan) 
- 📦 Build production version
- 🌐 Start ngrok tunnel
- 🚀 Start production servers (HTTPS + HTTP)

## 🔧 Manual Commands

Jika ingin menjalankan step-by-step:

```bash
# 1. Setup SSL certificates
pnpm run ssl:setup

# 2. Build for production
pnpm run build

# 3. Start tunnel dan servers
pnpm run start:prod-tunnel
```

## 🌍 Endpoints Setelah Running

Setelah script berjalan, Anda akan mendapat:

- **🌐 Public URL**: `https://xxxxx.ngrok-free.app` (untuk testing dari luar)
- **🔒 Local HTTPS**: `https://172.28.1.12:3001` (production app)
- **📡 Local HTTP**: `http://172.28.1.12:3002` (webhook receiver)

## 📋 Features Yang Available

### ✅ Production Mode Benefits:
- **Optimized Build**: Minified, optimized untuk performance
- **SSL/HTTPS**: Self-signed certificates untuk testing
- **External Access**: Ngrok tunnel untuk testing dari device lain
- **Production Environment**: Environment variables untuk production

### 🎯 Perfect For:
- Testing webhook integrations
- Demo ke client dengan public URL
- Performance testing dengan production build
- SSL/HTTPS testing
- Testing dari mobile devices

## 🛑 Stop Services

Press `Ctrl+C` di terminal atau:

```bash
# Stop semua processes
pkill -f "node server"
pkill -f "ngrok"
```

## 🔍 Monitoring

Monitor logs dari kedua servers:
- HTTPS server logs akan tampil di terminal
- HTTP server logs akan tampil di terminal
- Ngrok logs tersimpan di `ngrok.log`

## 🐛 Troubleshooting

### SSL Certificate Issues
```bash
# Re-generate SSL certificates
rm -rf certs/
pnpm run ssl:setup
```

### Port Issues
```bash
# Check ports yang digunakan
lsof -i :3001
lsof -i :3002
lsof -i :4040

# Kill specific processes
kill -9 $(lsof -ti:3001)
```

### Ngrok Issues
```bash
# Check ngrok status
curl http://localhost:4040/api/tunnels

# Restart ngrok
pnpm run tunnel:stop
pnpm run tunnel:start
```

## ⚡ Performance Notes

Production mode memberikan:
- **Faster Loading**: Optimized bundles
- **Better Caching**: Production caching headers  
- **Minified Assets**: Smaller file sizes
- **Production Optimizations**: React production mode

Perfect untuk final testing sebelum deploy ke production server! 🎉