import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';

export enum CartStatus {
    active = 'active',
    converted = 'converted',
    abandoned = 'abandoned',
}

@Entity({ name: 'carts' })
@Index('carts_active_user_id_key', ['userId'], {
    unique: true,
    where: `status = 'active'`,
})
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'enum', enum: CartStatus, default: CartStatus.active })
    status: CartStatus;

    @OneToMany(() => CartItem, (item) => item.cart)
    items: CartItem[];

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
