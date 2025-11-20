import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from '@/modules/category/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/category/dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('count')
    @ApiOperation({ summary: 'Count categories' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Categories count retrieved' })
    async count(@Query('isActive') isActive?: string) {
        const count = await this.categoryService.countCategories({
            isActive:
                isActive === 'true'
                    ? true
                    : isActive === 'false'
                      ? false
                      : undefined,
        });
        return {
            message: 'Categories count retrieved successfully',
            data: { count },
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean })
    @ApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
    })
    async getAll(@Query('isActive') isActive?: string) {
        const categories = await this.categoryService.getAllCategories({
            isActive:
                isActive === 'true'
                    ? true
                    : isActive === 'false'
                      ? false
                      : undefined,
        });
        return {
            message: 'Categories retrieved successfully',
            data: categories,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({
        status: 200,
        description: 'Category retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async getById(@Param('id', ParseIntPipe) id: number) {
        const category = await this.categoryService.getCategoryById(id);
        return {
            message: 'Category retrieved successfully',
            data: category,
        };
    }

    @Get(':id/items')
    @ApiOperation({ summary: 'Get category with menu items' })
    @ApiResponse({
        status: 200,
        description: 'Category with items retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async getWithItems(@Param('id', ParseIntPipe) id: number) {
        const category = await this.categoryService.getCategoryWithItems(id);
        return {
            message: 'Category with items retrieved successfully',
            data: category,
        };
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category' })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        const category =
            await this.categoryService.createCategory(createCategoryDto);
        return {
            message: 'Category created successfully',
            data: category,
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a category' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        const category = await this.categoryService.updateCategory(
            id,
            updateCategoryDto,
        );
        return {
            message: 'Category updated successfully',
            data: category,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.categoryService.deleteCategory(id);
        return {
            message: 'Category deleted successfully',
        };
    }
}
