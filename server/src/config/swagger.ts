import swaggerJsdoc from 'swagger-jsdoc';
import config from './index';

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Restaurant Management System API',
            version: '1.0.0',
            description: 'API documentation for Restaurant Management System',
            contact: {
                name: 'API Support',
                email: 'support@restaurant.com',
            },
        },
        servers: [
            {
                url: `${config.apiBaseUrl}/api/${config.apiVersion}`,
                description: 'Development server',
            },
            {
                url: `https://api.restaurant.com/api/${config.apiVersion}`,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Menu', description: 'Menu management endpoints' },
            { name: 'Order', description: 'Order management endpoints' },
            { name: 'Bill', description: 'Bill management endpoints' },
            { name: 'Reservation', description: 'Reservation management endpoints' },
            { name: 'Table', description: 'Table management endpoints' },
            { name: 'Category', description: 'Category management endpoints' },
            { name: 'Kitchen', description: 'Kitchen management endpoints' },
            { name: 'Payment', description: 'Payment management endpoints' },
            { name: 'Staff', description: 'Staff management endpoints' },
        ],
    },
    apis: [
        './src/features/*/**.routes.ts',
        './src/features/**/*.routes.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
