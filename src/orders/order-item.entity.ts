import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_items' })
@Index('order_items_order_id_idx', ['orderId'])
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({ name: 'unit_price_amount', type: 'integer' })
    unitPriceAmount: number;

    @Column({ type: 'varchar', length: 3 })
    currency: string;

    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}
