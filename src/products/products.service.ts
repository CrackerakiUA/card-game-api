import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import {
    CreateProductDto,
    ListProductsQueryDto,
    UpdateProductDto,
} from './dto/product.dto';
import { Product, ProductStatus } from './product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async listPublic(
        query: ListProductsQueryDto,
    ): Promise<{ products: Product[]; total: number }> {
        const filters: FindOptionsWhere<Product> = {
            status: ProductStatus.published,
        };
        if (query.category) filters.category = query.category;
        const where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] =
            query.q
                ? [
                      { ...filters, title: ILike(`%${query.q}%`) },
                      { ...filters, shortDescription: ILike(`%${query.q}%`) },
                  ]
                : filters;
        const [products, total] = await this.productsRepository.findAndCount({
            where,
            order: { showOnHome: 'DESC', createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return { products, total };
    }

    async listAdmin(
        query: ListProductsQueryDto,
    ): Promise<{ products: Product[]; total: number }> {
        const where: FindOptionsWhere<Product> | FindOptionsWhere<Product>[] =
            query.q
                ? [
                      { title: ILike(`%${query.q}%`) },
                      { shortDescription: ILike(`%${query.q}%`) },
                  ]
                : {};
        const [products, total] = await this.productsRepository.findAndCount({
            where: query.category
                ? Array.isArray(where)
                    ? where.map((filter) => ({
                          ...filter,
                          category: query.category!,
                      }))
                    : { ...where, category: query.category }
                : where,
            order: { createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return { products, total };
    }

    async findPublicBySlug(slug: string): Promise<Product> {
        const product = await this.productsRepository.findOneBy({
            slug,
            status: ProductStatus.published,
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async findById(id: string): Promise<Product> {
        const product = await this.productsRepository.findOneBy({ id });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async create(dto: CreateProductDto): Promise<Product> {
        await this.ensureSlugAvailable(dto.slug);
        return this.productsRepository.save(
            this.productsRepository.create({
                ...dto,
                slug: dto.slug.toLowerCase(),
                currency: dto.currency.toUpperCase(),
            }),
        );
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        const product = await this.findById(id);
        if (dto.slug && dto.slug !== product.slug)
            await this.ensureSlugAvailable(dto.slug, id);
        Object.assign(product, dto, {
            slug: dto.slug?.toLowerCase() ?? product.slug,
            currency: dto.currency?.toUpperCase() ?? product.currency,
            updatedAt: new Date(),
        });
        return this.productsRepository.save(product);
    }

    async archive(id: string): Promise<void> {
        const product = await this.findById(id);
        product.status = ProductStatus.archived;
        product.showOnHome = false;
        product.updatedAt = new Date();
        await this.productsRepository.save(product);
    }

    private async ensureSlugAvailable(
        slug: string,
        id?: string,
    ): Promise<void> {
        const existing = await this.productsRepository.findOneBy({
            slug: slug.toLowerCase(),
        });
        if (existing && existing.id !== id)
            throw new ConflictException('Product slug is already in use');
    }
}
