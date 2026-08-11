import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Cart } from './cart.entity';

@Entity({ name: 'cart_items' })
@Index('cart_items_cart_product_key', ['cartId', 'productId'], { unique: true })
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'cart_id', type: 'uuid' })
    cartId: string;

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;

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
