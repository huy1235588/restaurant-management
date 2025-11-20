export default () => ({
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['PORT'] || '8000', 10),
    apiVersion: process.env['API_VERSION'] || 'v1',

    // App
    app: {
        url: process.env['APP_URL'] || 'http://localhost:8000',
    },

    // Database
    databaseUrl: process.env['DATABASE_URL'],

    // JWT
    jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '15m',
    jwtRefreshSecret:
        process.env['JWT_REFRESH_SECRET'] || 'your-refresh-secret-key',
    jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',

    // CORS
    corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',

    // Rate Limiting
    rateLimitWindowMs: parseInt(
        process.env['RATE_LIMIT_WINDOW_MS'] || '900000',
        10,
    ), // 15 minutes
    rateLimitMaxRequests: parseInt(
        process.env['RATE_LIMIT_MAX_REQUESTS'] || '100',
        10,
    ),

    // Storage
    storage: {
        provider: process.env['STORAGE_PROVIDER'] || 'local', // 'local', 'r2', 'cloudinary'
        uploadDir: process.env['UPLOAD_DIR'] || './uploads',
        maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB
        allowedMimetypes: process.env['ALLOWED_MIMETYPES']
            ? process.env['ALLOWED_MIMETYPES'].split(',')
            : [
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'image/webp',
                  'application/pdf',
              ],
        r2: {
            accountId: process.env['R2_ACCOUNT_ID'],
            accessKeyId: process.env['R2_ACCESS_KEY_ID'],
            secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
            bucketName: process.env['R2_BUCKET_NAME'],
            publicUrl: process.env['R2_PUBLIC_URL'],
        },
        cloudinary: {
            cloudName: process.env['CLOUDINARY_CLOUD_NAME'],
            apiKey: process.env['CLOUDINARY_API_KEY'],
            apiSecret: process.env['CLOUDINARY_API_SECRET'],
        },
    },

    // Email
    emailHost: process.env['EMAIL_HOST'],
    emailPort: parseInt(process.env['EMAIL_PORT'] || '587', 10),
    emailUser: process.env['EMAIL_USER'],
    emailPassword: process.env['EMAIL_PASSWORD'],
    emailFrom: process.env['EMAIL_FROM'],
});
