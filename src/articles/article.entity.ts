import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export enum ArticleStatus {
    draft = 'draft',
    published = 'published',
    hidden = 'hidden',
    archived = 'archived',
}
@Entity({ name: 'articles' })
@Index('articles_slug_key', ['slug'], { unique: true })
@Index('articles_status_published_idx', ['status', 'publishedAt'])
export class Article {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'varchar', length: 200 }) title: string;
    @Column({ type: 'varchar', length: 220, unique: true }) slug: string;
    @Column({ type: 'varchar', length: 500 }) excerpt: string;
    @Column({ type: 'text' }) content: string;
    @Column({
        name: 'cover_image',
        type: 'varchar',
        length: 2048,
        nullable: true,
    })
    coverImage: string | null;
    @Column({ name: 'author_user_id', type: 'uuid' }) authorUserId: string;
    @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.draft })
    status: ArticleStatus;
    @Column({ name: 'is_featured', type: 'boolean', default: false })
    isFeatured: boolean;
    @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
    publishedAt: Date | null;
    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    @Column({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
