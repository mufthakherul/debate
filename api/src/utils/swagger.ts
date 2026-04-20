import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Virtual Debating Club API',
      version: '1.0.0',
      description: 'API documentation for the Virtual Debating Club platform',
    },
    servers: [
      {
        url: '/api',
        description: 'API base path',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
