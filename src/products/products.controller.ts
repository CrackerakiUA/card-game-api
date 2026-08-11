import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import {
    CreateProductDto,
    ListProductsQueryDto,
    UpdateProductDto,
} from './dto/product.dto';
import {
    AdminProductListResponseDto,
    AdminProductResponseDto,
    PublicProductListResponseDto,
    PublicProductResponseDto,
} from './dto/product-response.dto';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller()
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
    ) {}

    @Get('products')
    @ApiOperation({ summary: 'List published products' })
    @ApiOkResponse({ type: PublicProductListResponseDto })
    async listPublic(@Query() query: ListProductsQueryDto) {
        const result = await this.productsService.listPublic(query);
        return {
            products: result.products.map((product) =>
                this.publicProduct(product),
            ),
            total: result.total,
        };
    }

    @Get('products/:slug')
    @ApiOperation({ summary: 'Get a published product' })
    @ApiParam({ name: 'slug', example: 'starter-deck' })
    @ApiOkResponse({ type: PublicProductResponseDto })
    async getPublic(@Param('slug') slug: string) {
        return this.publicProduct(
            await this.productsService.findPublicBySlug(slug),
        );
    }

    @Get('admin/products')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all products (admin or store manager)' })
    @ApiOkResponse({ type: AdminProductListResponseDto })
    async listAdmin(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListProductsQueryDto,
    ) {
        await this.requireCatalogManager(request);
        return this.productsService.listAdmin(query);
    }

    @Get('admin/products/:id')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a product (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: AdminProductResponseDto })
    async getAdmin(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.requireCatalogManager(request);
        return this.productsService.findById(id);
    }

    @Post('admin/products')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a product (admin or store manager)' })
    @ApiCreatedResponse({ type: AdminProductResponseDto })
    async create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateProductDto,
    ) {
        await this.requireCatalogManager(request);
        return this.productsService.create(dto);
    }

    @Patch('admin/products/:id')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a product (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: AdminProductResponseDto })
    async update(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateProductDto,
    ) {
        await this.requireCatalogManager(request);
        return this.productsService.update(id, dto);
    }

    @Delete('admin/products/:id')
    @HttpCode(204)
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Archive a product (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiNoContentResponse({ description: 'Product archived' })
    async archive(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<void> {
        await this.requireCatalogManager(request);
        await this.productsService.archive(id);
    }

    private async requireCatalogManager(
        request: AuthenticatedRequest,
    ): Promise<void> {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        if (user.role !== UserRole.admin && user.role !== UserRole.storeManager)
            throw new ForbiddenException(
                'Admin or store manager role is required',
            );
    }

    private publicProduct(product: Product) {
        return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            shortDescription: product.shortDescription,
            description: product.description,
            type: product.type,
            category: product.category,
            priceAmount: product.priceAmount,
            currency: product.currency,
            coverImage: product.coverImage,
            gallery: product.gallery,
            showOnHome: product.showOnHome,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
