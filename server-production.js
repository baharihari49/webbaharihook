const { createServer: createHttpsServer } = require('https')
const { parse } = require('url')
const fs = require('fs')
const path = require('path')
const next = require('next')

const dev = false
const hostname = process.env.HOST || '172.28.1.12'
const port = parseInt(process.env.PORT || '3001', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// SSL certificate paths
const keyPath = path.join(process.cwd(), 'certs', 'localhost-key.pem')
const certPath = path.join(process.cwd(), 'certs', 'localhost.pem')

app.prepare().then(() => {
  // Check if SSL certificates exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    // HTTPS server
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }

    createHttpsServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err
      console.log(`> Production HTTPS server running on https://${hostname}:${port}`)
    })
  } else {
    console.log('⚠️  SSL certificates not found, falling back to HTTP')
    const { createServer: createHttpServer } = require('http')
    
    createHttpServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err
      console.log(`> Production HTTP server running on http://${hostname}:${port}`)
    })
  }
})