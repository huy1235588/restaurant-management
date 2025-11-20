import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    // Schema location
    schema: 'prisma/schema.prisma',

    // Migrations configuration
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },

    // Database connection
    datasource: {
        url: env('DATABASE_URL'),
    },
});
