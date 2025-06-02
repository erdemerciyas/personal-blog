// Set NODE_ENV before requiring Next.js to avoid warning
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Memory optimization - reduce allocation
const nodeOptions = process.env.NODE_OPTIONS || '--max-old-space-size=256 --optimize-for-size'
if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = nodeOptions
}

// WebAssembly memory issue fix - disable certain features that cause memory issues
process.env.NEXT_DISABLE_SWC = '1' // Disable SWC to reduce memory usage
process.env.NEXT_TELEMETRY_DISABLED = '1' // Disable telemetry

// Port configuration with better conflict resolution
const port = parseInt(
  process.env.PORT || 
  process.env.CPANEL_PORT || 
  '3002',
  10
)
const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || '0.0.0.0'

console.log(`🚀 Starting server...`)
console.log(`Environment: ${process.env.NODE_ENV}`)
console.log(`Port: ${port}`)
console.log(`Development mode: ${dev}`)
console.log(`Memory limit: ${nodeOptions}`)

// Next.js configuration with enhanced memory optimization
const app = next({ 
  dev,
  conf: {
    // Disable features that consume memory
    poweredByHeader: false,
    compress: true,
    experimental: {
      // Disable memory-intensive features
      workerThreads: false,
      optimizePackageImports: ['@heroicons/react'],
      // Reduce build cache
      isrMemoryCacheSize: 0,
    },
    // Additional webpack optimizations for memory
    webpack: (config, { dev, isServer }) => {
      if (!dev) {
        // Production optimizations to reduce memory
        config.optimization.minimize = true
        config.optimization.concatenateModules = true
      }
      return config
    }
  }
})
const handle = app.getRequestHandler()

console.log(`Preparing Next.js app with memory optimizations...`)

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      
      // Add memory-efficient headers
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Request error:', err.message)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })
  
  server.listen(port, hostname, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use!`)
        console.error(`🔧 cPanel Solutions:`)
        console.error(`   1. Stop app in NodeJS Selector`)
        console.error(`   2. Use 'pkill -f node' command`)
        console.error(`   3. Try different port: PORT=${port + 1} node app.js`)
        process.exit(1)
      }
      throw err
    }
    
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log(`📊 Initial memory usage: ${memUsage} MB`)
    
    if (!dev) {
      console.log(`🌐 Production server active`)
      console.log(`🔗 Access via: https://yourdomain:${port}`)
    }
  })
  
  // Cleanup listeners
  server.on('close', () => {
    console.log('Server closed')
  })
  
}).catch(err => {
  console.error('Failed to start:', err.message)
  process.exit(1)
})

// Memory monitoring with cleanup
let memoryInterval
if (!dev) {
  memoryInterval = setInterval(() => {
    const mem = process.memoryUsage()
    const heapMB = Math.round(mem.heapUsed / 1024 / 1024)
    
    // Warning if memory usage is high
    if (heapMB > 200) {
      console.warn(`⚠️  High memory usage: ${heapMB} MB`)
    } else {
      console.log(`📊 Memory: ${heapMB} MB`)
    }
    
    // Force garbage collection if available
    if (global.gc && heapMB > 150) {
      global.gc()
    }
  }, 30000) // Every 30 seconds
}

// Enhanced error handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down gracefully')
  if (memoryInterval) clearInterval(memoryInterval)
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received - shutting down gracefully')
  if (memoryInterval) clearInterval(memoryInterval)
  process.exit(0)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  if (memoryInterval) clearInterval(memoryInterval)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason)
  if (memoryInterval) clearInterval(memoryInterval)
  process.exit(1)
}) 