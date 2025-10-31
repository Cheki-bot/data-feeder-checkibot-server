import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Data Feeder API',
      version: '0.1.0',
      description: 'Documentación de la API del Data Feeder',
    },
    servers: [
      {
        url: '/api',
        description: 'API base',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),
    path.join(__dirname, '../modules/**/*.routes.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
