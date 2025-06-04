import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

// Import our utilities (ES modules)
const setupGlobalErrorHandlers = async () => {
  try {
    const { setupGlobalErrorHandlers } = await import('./src/lib/errorHandler.js')
    const { logger } = await import('./src/lib/logger.js')
    const { config } = await import('./src/lib/config.js')
    
    // Setup global error handlers
    setupGlobalErrorHandlers()
    
    // Log server startup
    logger.info('Server starting', 'SERVER', {
      nodeEnv: config.nodeEnv,
      port: process.env.PORT || '3000'
    })
    
    return { logger, config }
  } catch (error) {
    console.error('Error setting up server utilities:', error)
    return { logger: console, config: null }
  }
}

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Setup error handlers and get utilities
const { logger, config } = await setupGlobalErrorHandlers()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    } catch (error) {
      logger.error('Request handling error', 'SERVER', { 
        url: req.url,
        method: req.method 
      }, error)
      
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  // Handle server errors
  server.on('error', (error) => {
    logger.error('Server error', 'SERVER', undefined, error)
  })

  // Handle client errors
  server.on('clientError', (error, socket) => {
    logger.warn('Client error', 'SERVER', { 
      error: error.message 
    })
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
  })

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, starting graceful shutdown`, 'SERVER')
    
    server.close((err) => {
      if (err) {
        logger.error('Error during server shutdown', 'SERVER', undefined, err)
        process.exit(1)
      }
      
      logger.info('Server shutdown complete', 'SERVER')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  server.listen(port, (err) => {
    if (err) {
      logger.error('Failed to start server', 'SERVER', { port }, err)
      throw err
    }
    
    const message = `Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`
    
    if (config && config.isDevelopment) {
      console.log(`🚀 ${message}`)
      console.log(`📊 Admin Panel: http://localhost:${port}/admin`)
      console.log(`🔧 Environment: ${config.nodeEnv}`)
      console.log(`💾 Database: ${config.database.uri ? '✅ Connected' : '❌ Not configured'}`)
    } else {
      logger.info(message, 'SERVER')
    }
  })
}).catch((err) => {
  logger.error('Failed to prepare Next.js app', 'SERVER', undefined, err)
  process.exit(1)
})