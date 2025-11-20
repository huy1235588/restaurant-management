import config from '@/config';
import { PrismaClient } from '@prisma/client';

class DatabaseClient {
    private static instance: PrismaClient;

    private constructor() { }

    public static getInstance(): PrismaClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new PrismaClient({
                log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });
        }
        return DatabaseClient.instance;
    }

    public static async connect(): Promise<void> {
        try {
            await DatabaseClient.getInstance().$connect();
            console.log('✅ Database connected successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }

    public static async disconnect(): Promise<void> {
        await DatabaseClient.getInstance().$disconnect();
        console.log('🔌 Database disconnected');
    }
}

export const prisma = DatabaseClient.getInstance();
export default DatabaseClient;
