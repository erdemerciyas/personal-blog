import { NextRequest, NextResponse } from 'next/server';
import { PerformanceMonitor, ErrorTracker } from '@/lib/monitoring';
import connectDB, { hasValidMongoUri } from '@/lib/mongoose';

/**
 * @swagger
 * /api/monitoring/performance:
 *   get:
 *     tags:
 *       - Monitoring
 *     summary: Get performance metrics
 *     description: Returns basic performance metrics and system health
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         total:
 *                           type: number
 *                         percentage:
 *                           type: number
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         connectionTime:
 *                           type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags:
 *       - Monitoring
 *     summary: Report client-side performance metrics
 *     description: Allows client to report performance metrics to the server
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metrics:
 *                 type: object
 *                 properties:
 *                   loadTime:
 *                     type: number
 *                     description: Page load time in milliseconds
 *                   renderTime:
 *                     type: number
 *                     description: Render time in milliseconds
 *                   route:
 *                     type: string
 *                     description: Current route
 *                   userAgent:
 *                     type: string
 *                     description: User agent string
 *               url:
 *                 type: string
 *                 description: Current page URL
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Metrics received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "received"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid metrics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(request: NextRequest) {
  const transaction = PerformanceMonitor.startTransaction('GET /api/monitoring/performance', 'http.server');
  
  try {
    // Collect system metrics
    const metrics = {
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      database: {
        status: 'unknown',
        connectionTime: 0
      }
    };

    // Test database connection performance
    if (hasValidMongoUri()) {
      const dbStart = Date.now();
      try {
        await PerformanceMonitor.measureDatabaseQuery(
          'health_check',
          () => connectDB(),
          { operation: 'connection_test' }
        );
        metrics.database.status = 'connected';
        metrics.database.connectionTime = Date.now() - dbStart;
      } catch (error) {
        metrics.database.status = 'error';
        ErrorTracker.captureDatabaseError(
          error as Error,
          'health_check',
          'connection'
        );
      }
    } else {
      metrics.database.status = 'disabled';
    }

    transaction.setTag('status', 'success');
    transaction.finish();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics
    });

  } catch (error) {
    transaction.setTag('status', 'error');
    transaction.finish();
    
    ErrorTracker.captureApiError(
      error as Error,
      request,
      '/api/monitoring/performance'
    );

    return NextResponse.json({
      error: 'Failed to retrieve performance metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const transaction = PerformanceMonitor.startTransaction('POST /api/monitoring/performance', 'http.server');
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.metrics || !body.url) {
      transaction.setTag('status', 'validation_error');
      transaction.finish();
      
      return NextResponse.json({
        error: 'Missing required fields: metrics, url',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Process client metrics
    const clientMetrics = {
      loadTime: body.metrics.loadTime,
      renderTime: body.metrics.renderTime,
      route: body.metrics.route,
      userAgent: body.metrics.userAgent,
      url: body.url,
      timestamp: body.timestamp || new Date().toISOString()
    };

    // Send metrics to monitoring (in a real scenario, you'd store these)
    await PerformanceMonitor.measureFunction(
      'process_client_metrics',
      async () => {
        // Here you could store metrics in database, send to analytics service, etc.
        console.log('Client performance metrics:', clientMetrics);
        
        // Add performance breadcrumb
        if (clientMetrics.loadTime > 3000) {
          ErrorTracker.captureWarning(
            'Slow page load detected',
            {
              loadTime: clientMetrics.loadTime.toString(),
              route: clientMetrics.route,
              url: clientMetrics.url
            }
          );
        }
      },
      { 
        operation: 'client_metrics',
        route: clientMetrics.route 
      }
    );

    transaction.setTag('status', 'success');
    transaction.finish();

    return NextResponse.json({
      status: 'received',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    transaction.setTag('status', 'error');
    transaction.finish();
    
    ErrorTracker.captureApiError(
      error as Error,
      request,
      '/api/monitoring/performance'
    );

    return NextResponse.json({
      error: 'Failed to process performance metrics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';