export default () => ({
    nodeEnv: process.env['NODE_ENV'] || 'development',
    port: parseInt(process.env['PORT'] || '8000', 10),
    apiVersion: process.env['API_VERSION'] || 'v1',

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

    // File Storage
    uploadDir: process.env['UPLOAD_DIR'] || './uploads',
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760', 10), // 10MB

    // Cloudflare R2
    r2AccountId: process.env['R2_ACCOUNT_ID'],
    r2AccessKeyId: process.env['R2_ACCESS_KEY_ID'],
    r2SecretAccessKey: process.env['R2_SECRET_ACCESS_KEY'],
    r2BucketName: process.env['R2_BUCKET_NAME'],
    r2PublicUrl: process.env['R2_PUBLIC_URL'],

    // Cloudinary (Legacy)
    cloudinaryCloudName: process.env['CLOUDINARY_CLOUD_NAME'],
    cloudinaryApiKey: process.env['CLOUDINARY_API_KEY'],
    cloudinaryApiSecret: process.env['CLOUDINARY_API_SECRET'],

    // Email
    emailHost: process.env['EMAIL_HOST'],
    emailPort: parseInt(process.env['EMAIL_PORT'] || '587', 10),
    emailUser: process.env['EMAIL_USER'],
    emailPassword: process.env['EMAIL_PASSWORD'],
    emailFrom: process.env['EMAIL_FROM'],
});
