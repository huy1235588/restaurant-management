import {
    Controller,
    Post,
    Delete,
    Param,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    Body,
    BadRequestException,
    HttpCode,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { StorageService } from '@/modules/storage/storage.service';
import { ChangeStorageProviderDto } from '@/modules/storage/dtos/change-storage-provider.dto';
import { StorageProvider } from '@/modules/storage/enums';

@ApiTags('storage')
@Controller('storage')
@ApiBearerAuth()
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Get('provider')
    getProvider() {
        const provider = this.storageService.getProvider();

        return {
            message: 'Current storage provider',
            data: provider,
        };
    }

    @Post('provider')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change current storage provider' })
    @ApiResponse({ status: 200, description: 'Provider changed successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    changeProvider(@Body() body: ChangeStorageProviderDto) {
        const { provider } = body;

        if (!provider || !Object.values(StorageProvider).includes(provider)) {
            throw new BadRequestException('Invalid storage provider');
        }

        this.storageService.setProvider(provider);

        return {
            message: 'Storage provider changed successfully',
            data: provider,
        };
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a single file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder name',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'File uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const result = await this.storageService.uploadFile(file, folder);

        return {
            message: 'File uploaded successfully',
            data: result,
        };
    }

    @Post('upload-multiple')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiOperation({ summary: 'Upload multiple files (max 10)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                folder: {
                    type: 'string',
                    description: 'Optional folder name',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Files uploaded successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async uploadFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body('folder') folder?: string,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const results = await this.storageService.uploadFiles(files, folder);

        return {
            message: 'Files uploaded successfully',
            data: results,
        };
    }

    @Delete(':identifier')
    @ApiOperation({ summary: 'Delete a file' })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    async deleteFile(@Param('identifier') identifier: string) {
        // URL decode the identifier
        const decodedIdentifier = decodeURIComponent(identifier);

        await this.storageService.deleteFile(decodedIdentifier);

        return {
            message: 'File deleted successfully',
        };
    }
}
