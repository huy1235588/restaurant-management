import { IsEnum } from 'class-validator';
import { StorageProvider } from '@/modules/storage/enums';

export class ChangeStorageProviderDto {
    @IsEnum(StorageProvider)
    provider: StorageProvider;
}
