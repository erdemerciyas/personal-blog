import { NextRequest, NextResponse } from 'next/server';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Blog API',
      version: '2.3.3',
      description: 'Modern kişisel blog ve portfolio platformu API dokümantasyonu',
      contact: {
        name: 'Erdem Erciyas',
        email: 'erdem.erciyas@gmail.com',
        url: 'https://www.fixral.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://www.fixral.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          },
          required: ['error']
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Health status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Check timestamp'
            },
            platform: {
              type: 'string',
              description: 'Platform information'
            },
            region: {
              type: 'string',
              description: 'Server region'
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
              description: 'Database connection status'
            }
          },
          required: ['status', 'timestamp', 'platform', 'database']
        },
        Portfolio: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier'
            },
            title: {
              type: 'string',
              description: 'Project title'
            },
            slug: {
              type: 'string',
              description: 'URL-friendly slug'
            },
            description: {
              type: 'string',
              description: 'Project description'
            },
            content: {
              type: 'string',
              description: 'Project content'
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  alt: { type: 'string' },
                  caption: { type: 'string' }
                }
              },
              description: 'Project images'
            },
            technologies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Technologies used'
            },
            category: {
              type: 'string',
              description: 'Project category'
            },
            featured: {
              type: 'boolean',
              description: 'Featured project flag'
            },
            isActive: {
              type: 'boolean',
              description: 'Active status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['title', 'slug', 'description']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        sessionAuth: []
      }
    ]
  },
  apis: ['./src/app/api/**/route.ts'], // API dosyalarının yolu
};

const specs = swaggerJSDoc(options);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    if (format === 'json') {
      return NextResponse.json(specs);
    }

    // Swagger UI HTML döndür
    const swaggerUIHTML = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Blog API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #0f172a; }
        .swagger-ui .scheme-container { background: #fff; border-radius: 4px; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/api/docs?format=json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // API isteklerine CSRF token ekle
                    const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                    if (csrfMeta) {
                        request.headers['X-CSRF-Token'] = csrfMeta.getAttribute('content');
                    }
                    return request;
                }
            });
        }
    </script>
</body>
</html>`;

    return new NextResponse(swaggerUIHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Swagger docs error:', error);
    return NextResponse.json(
      { 
        error: 'API documentation generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';