/**
 * Swagger/OpenAPI configuration for API documentation
 */

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fixral API',
      description: 'Personal Blog & Portfolio Platform API Documentation',
      version: '2.5.4',
      contact: {
        name: 'Erdem Erciyas',
        url: 'https://www.fixral.com',
        email: 'info@fixral.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://www.fixral.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
        },
      },
      schemas: {
        Portfolio: {
          type: 'object',
          required: ['title', 'slug', 'description', 'client', 'completionDate', 'coverImage'],
          properties: {
            _id: {
              type: 'string',
              description: 'Portfolio item ID',
            },
            title: {
              type: 'string',
              description: 'Project title',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly slug',
            },
            description: {
              type: 'string',
              description: 'Project description',
            },
            client: {
              type: 'string',
              description: 'Client name',
            },
            completionDate: {
              type: 'string',
              format: 'date-time',
              description: 'Project completion date',
            },
            technologies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Technologies used',
            },
            coverImage: {
              type: 'string',
              description: 'Cover image URL',
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Additional images',
            },
            featured: {
              type: 'boolean',
              description: 'Featured project',
            },
            categoryIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Category IDs',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name', 'slug', 'description', 'price', 'image'],
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly slug',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            image: {
              type: 'string',
              description: 'Product image URL',
            },
            category: {
              type: 'string',
              description: 'Product category',
            },
            stock: {
              type: 'number',
              description: 'Available stock',
            },
          },
        },
        Service: {
          type: 'object',
          required: ['name', 'description', 'icon'],
          properties: {
            _id: {
              type: 'string',
              description: 'Service ID',
            },
            name: {
              type: 'string',
              description: 'Service name',
            },
            description: {
              type: 'string',
              description: 'Service description',
            },
            icon: {
              type: 'string',
              description: 'Service icon URL',
            },
            order: {
              type: 'number',
              description: 'Display order',
            },
          },
        },
        Video: {
          type: 'object',
          required: ['title', 'youtubeId'],
          properties: {
            _id: {
              type: 'string',
              description: 'Video ID',
            },
            title: {
              type: 'string',
              description: 'Video title',
            },
            youtubeId: {
              type: 'string',
              description: 'YouTube video ID',
            },
            description: {
              type: 'string',
              description: 'Video description',
            },
            thumbnail: {
              type: 'string',
              description: 'Thumbnail URL',
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Publication date',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                },
                code: {
                  type: 'string',
                  description: 'Error code',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details',
                },
              },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'System health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Check timestamp',
            },
            platform: {
              type: 'string',
              description: 'Deployment platform',
            },
            region: {
              type: 'string',
              description: 'Deployment region',
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
              description: 'Database connection status',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    './src/app/api/**/*.ts',
  ],
};

/**
 * API endpoint documentation
 */
export const apiEndpoints = {
  portfolio: {
    list: {
      method: 'GET',
      path: '/api/portfolio',
      description: 'Get all portfolio items',
      tags: ['Portfolio'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: { type: 'integer', default: 10 },
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Portfolio items retrieved successfully',
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Portfolio' },
          },
        },
      },
    },
    get: {
      method: 'GET',
      path: '/api/portfolio/{id}',
      description: 'Get portfolio item by ID',
      tags: ['Portfolio'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Portfolio item ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Portfolio item retrieved successfully',
          schema: { $ref: '#/components/schemas/Portfolio' },
        },
        404: {
          description: 'Portfolio item not found',
        },
      },
    },
  },
  products: {
    list: {
      method: 'GET',
      path: '/api/products',
      description: 'Get all products',
      tags: ['Products'],
      responses: {
        200: {
          description: 'Products retrieved successfully',
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
        },
      },
    },
  },
  services: {
    list: {
      method: 'GET',
      path: '/api/services',
      description: 'Get all services',
      tags: ['Services'],
      responses: {
        200: {
          description: 'Services retrieved successfully',
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Service' },
          },
        },
      },
    },
  },
  videos: {
    list: {
      method: 'GET',
      path: '/api/videos',
      description: 'Get all videos',
      tags: ['Videos'],
      responses: {
        200: {
          description: 'Videos retrieved successfully',
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Video' },
          },
        },
      },
    },
  },
  health: {
    check: {
      method: 'GET',
      path: '/api/health',
      description: 'System health check',
      tags: ['System'],
      responses: {
        200: {
          description: 'System is healthy',
          schema: { $ref: '#/components/schemas/HealthCheck' },
        },
        500: {
          description: 'System is unhealthy',
          schema: { $ref: '#/components/schemas/HealthCheck' },
        },
      },
    },
  },
  contact: {
    send: {
      method: 'POST',
      path: '/api/contact',
      description: 'Send contact form message',
      tags: ['Contact'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'message'],
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                subject: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Message sent successfully',
        },
        400: {
          description: 'Invalid input',
        },
        429: {
          description: 'Too many requests',
        },
      },
    },
  },
};
