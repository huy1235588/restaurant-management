import { Module } from '@nestjs/common';
import { CategoryController } from '@/modules/category/category.controller';
import { CategoryService } from '@/modules/category/category.service';
import { CategoryRepository } from '@/modules/category/category.repository';

@Module({
    controllers: [CategoryController],
    providers: [CategoryService, CategoryRepository],
    exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
