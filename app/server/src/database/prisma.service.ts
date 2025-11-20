import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor() {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: ['error', 'warn'],
        });

        this.pool = pool;
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        } catch (error) {
            this.logger.error('❌ Database connection failed', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            await this.pool.end();
            this.logger.log('✅ Database disconnected successfully');
        } catch (error) {
            this.logger.error('❌ Database disconnection failed', error);
        }
    }
}
