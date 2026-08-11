import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    player = 'player',
    author = 'author',
    storeManager = 'store_manager',
    support = 'support',
    admin = 'admin',
}

export enum UserStatus {
    active = 'active',
    blocked = 'blocked',
    deleted = 'deleted',
}

@Entity({ name: 'users' })
@Index('users_auth_id_key', ['authId'], { unique: true })
@Index('users_nickname_key', ['nickname'], { unique: true })
@Index('users_slug_key', ['slug'], { unique: true })
@Index('users_status_created_at_idx', ['status', 'createdAt'])
export class User {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ name: 'auth_id', type: 'uuid', unique: true })
    authId: string;

    @Column({ type: 'varchar', length: 320 })
    email: string;

    @Column({ type: 'varchar', length: 32, nullable: true, unique: true })
    nickname: string | null;

    @Column({
        name: 'display_name',
        type: 'varchar',
        length: 80,
        nullable: true,
    })
    displayName: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true, unique: true })
    slug: string | null;

    @Column({
        name: 'avatar_url',
        type: 'varchar',
        length: 2048,
        nullable: true,
    })
    avatarUrl: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    bio: string | null;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.player })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.active })
    status: UserStatus;

    @Column({ type: 'varchar', length: 10, default: 'en' })
    locale: string;

    @Column({ name: 'show_cards_publicly', type: 'boolean', default: true })
    showCardsPublicly: boolean;

    @Column({
        name: 'show_duel_history_publicly',
        type: 'boolean',
        default: true,
    })
    showDuelHistoryPublicly: boolean;

    @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
    lastSeenAt: Date | null;

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
