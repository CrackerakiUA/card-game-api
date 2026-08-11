import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { Article, ArticleStatus } from './article.entity';
@Injectable()
export class ArticlesService {
    constructor(@InjectRepository(Article) private r: Repository<Article>) {}
    list() {
        return this.r.find({
            where: { status: ArticleStatus.published },
            order: { publishedAt: 'DESC' },
        });
    }
    async public(slug: string) {
        const a = await this.r.findOneBy({
            slug,
            status: ArticleStatus.published,
        });
        if (!a) throw new NotFoundException('Article not found');
        return a;
    }
    all() {
        return this.r.find({ order: { updatedAt: 'DESC' } });
    }
    async get(id: string) {
        const a = await this.r.findOneBy({ id });
        if (!a) throw new NotFoundException('Article not found');
        return a;
    }
    async create(userId: string, d: CreateArticleDto) {
        if (await this.r.exists({ where: { slug: d.slug } }))
            throw new ConflictException('Slug exists');
        return this.r.save(
            this.r.create({
                ...d,
                authorUserId: userId,
                publishedAt:
                    d.status === ArticleStatus.published ? new Date() : null,
            }),
        );
    }
    async update(
        id: string,
        userId: string,
        admin: boolean,
        d: UpdateArticleDto,
    ) {
        const a = await this.get(id);
        if (!admin && a.authorUserId !== userId) throw new ForbiddenException();
        if (
            d.slug &&
            d.slug !== a.slug &&
            (await this.r.exists({ where: { slug: d.slug } }))
        )
            throw new ConflictException('Slug exists');
        Object.assign(a, d, {
            updatedAt: new Date(),
            publishedAt:
                d.status === ArticleStatus.published && !a.publishedAt
                    ? new Date()
                    : a.publishedAt,
        });
        return this.r.save(a);
    }
    async archive(id: string, userId: string, admin: boolean) {
        return this.update(id, userId, admin, {
            status: ArticleStatus.archived,
        });
    }
}
