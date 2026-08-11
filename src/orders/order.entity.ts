import {
    Column,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
    pending = 'pending',
    waitingPayment = 'waiting_payment',
    paid = 'paid',
    paymentFailed = 'payment_failed',
    processing = 'processing',
    shipped = 'shipped',
    completed = 'completed',
}

export enum PaymentStatus {
    pending = 'pending',
    paid = 'paid',
    failed = 'failed',
}

@Entity({ name: 'orders' })
@Index('orders_user_id_created_at_idx', ['userId', 'createdAt'])
@Index('orders_status_created_at_idx', ['status', 'createdAt'])
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.pending })
    status: OrderStatus;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.pending,
    })
    paymentStatus: PaymentStatus;

    @Column({
        name: 'delivery_method',
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    deliveryMethod: string | null;

    @Column({ name: 'delivery_address', type: 'jsonb', nullable: true })
    deliveryAddress: Record<string, unknown> | null;

    @Column({ name: 'total_amount', type: 'integer' })
    totalAmount: number;

    @Column({ type: 'varchar', length: 3 })
    currency: string;

    @Column({
        name: 'stripe_checkout_session_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    stripeCheckoutSessionId: string | null;

    @OneToMany(() => OrderItem, (item) => item.order)
    items: OrderItem[];

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

    @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
    paidAt: Date | null;
}
