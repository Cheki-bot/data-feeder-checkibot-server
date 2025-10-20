import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
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
  apis: [path.join(__dirname, '../routes/**/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
