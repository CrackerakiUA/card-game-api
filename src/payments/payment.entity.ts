import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentProvider {
    stripe = 'stripe',
}

export enum PaymentRecordStatus {
    pending = 'pending',
    paid = 'paid',
    failed = 'failed',
    refunded = 'refunded',
}

@Entity({ name: 'payments' })
@Index('payments_order_provider_key', ['orderId', 'provider'], { unique: true })
@Index('payments_provider_session_id_key', ['providerSessionId'], {
    unique: true,
})
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @Column({ type: 'enum', enum: PaymentProvider })
    provider: PaymentProvider;

    @Column({
        type: 'enum',
        enum: PaymentRecordStatus,
        default: PaymentRecordStatus.pending,
    })
    status: PaymentRecordStatus;

    @Column({ type: 'integer' })
    amount: number;

    @Column({ type: 'varchar', length: 3 })
    currency: string;

    @Column({
        name: 'provider_session_id',
        type: 'varchar',
        length: 255,
        nullable: true,
        unique: true,
    })
    providerSessionId: string | null;

    @Column({
        name: 'provider_payment_id',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    providerPaymentId: string | null;

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
