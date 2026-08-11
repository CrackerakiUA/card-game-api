import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CardStatus {
    available = 'available',
    registered = 'registered',
    blocked = 'blocked',
    archived = 'archived',
}

@Entity({ name: 'cards' })
@Index('cards_card_identifier_key', ['cardIdentifier'], { unique: true })
@Index('cards_owner_status_idx', ['currentOwnerUserId', 'status'])
@Index('cards_product_id_idx', ['productId'])
export class Card {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({
        name: 'card_identifier',
        type: 'varchar',
        length: 128,
        unique: true,
    })
    cardIdentifier: string;

    @Column({ type: 'varchar', length: 160 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({
        name: 'image_url',
        type: 'varchar',
        length: 2048,
        nullable: true,
    })
    imageUrl: string | null;

    @Column({ type: 'varchar', length: 64 })
    category: string;

    @Column({ type: 'enum', enum: CardStatus, default: CardStatus.available })
    status: CardStatus;

    @Column({ name: 'current_owner_user_id', type: 'uuid', nullable: true })
    currentOwnerUserId: string | null;

    @Column({ name: 'registered_at', type: 'timestamptz', nullable: true })
    registeredAt: Date | null;

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
