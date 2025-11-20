import { Module } from '@nestjs/common';
import { StorageController } from '@/modules/storage/storage.controller';
import { StorageService } from '@/modules/storage/storage.service';
import {
    LocalStorageService,
    R2StorageService,
    CloudinaryStorageService,
} from '@/modules/storage/services';

@Module({
    controllers: [StorageController],
    providers: [
        StorageService,
        LocalStorageService,
        R2StorageService,
        CloudinaryStorageService,
    ],
    exports: [StorageService],
})
export class StorageModule {}
