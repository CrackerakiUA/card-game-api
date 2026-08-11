import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ProductType {
    baseGame = 'base_game',
    premiumMaterial = 'premium_material',
    premiumCard = 'premium_card',
}

export enum ProductStatus {
    draft = 'draft',
    published = 'published',
    hidden = 'hidden',
    archived = 'archived',
}

@Entity({ name: 'products' })
@Index('products_slug_key', ['slug'], { unique: true })
@Index('products_status_created_at_idx', ['status', 'createdAt'])
@Index('products_category_status_idx', ['category', 'status'])
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 160 })
    title: string;

    @Column({ type: 'varchar', length: 180, unique: true })
    slug: string;

    @Column({ name: 'short_description', type: 'varchar', length: 500 })
    shortDescription: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'enum', enum: ProductType })
    type: ProductType;

    @Column({ type: 'varchar', length: 64 })
    category: string;

    @Column({ name: 'price_amount', type: 'integer' })
    priceAmount: number;

    @Column({ type: 'varchar', length: 3 })
    currency: string;

    @Column({
        name: 'cover_image',
        type: 'varchar',
        length: 2048,
        nullable: true,
    })
    coverImage: string | null;

    @Column({ type: 'jsonb', default: () => "'[]'" })
    gallery: string[];

    @Column({
        name: 'stripe_price_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    stripePriceId: string | null;

    @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.draft })
    status: ProductStatus;

    @Column({ name: 'show_on_home', type: 'boolean', default: false })
    showOnHome: boolean;

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
