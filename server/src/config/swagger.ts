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
            { name: 'Authentication', description: 'Authentication endpoints' },
            { name: 'Menu', description: 'Menu management endpoints' },
            { name: 'Orders', description: 'Order management endpoints' },
            { name: 'Bills', description: 'Bill management endpoints' },
            { name: 'Reservations', description: 'Reservation management endpoints' },
            { name: 'Tables', description: 'Table management endpoints' },
            { name: 'Categories', description: 'Category management endpoints' },
            { name: 'Kitchen', description: 'Kitchen management endpoints' },
            { name: 'Payments', description: 'Payment management endpoints' },
            { name: 'Staff', description: 'Staff management endpoints' },
            { name: 'Ingredients', description: 'Ingredient management endpoints' },
            { name: 'Purchase', description: 'Purchase order management endpoints' },
            { name: 'Stock', description: 'Stock management endpoints' },
        ],
    },
    apis: [
        './src/features/**/*.routes.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
