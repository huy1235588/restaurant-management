import { Controller, Get } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AppService } from '@/app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Public()
    @Get('health')
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.GITHUB_SHA || 'dev',
            environment: process.env.NODE_ENV || 'development',
        };
    }

    @Public()
    @Get('version')
    getVersion() {
        return {
            version: process.env.GITHUB_SHA || 'dev',
            buildTime: process.env.BUILD_TIME || new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
        };
    }
}
