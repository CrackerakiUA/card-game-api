import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../products/product.entity';
import { CartItem } from './cart-item.entity';
import { Cart, CartStatus } from './cart.entity';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cartsRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private readonly cartItemsRepository: Repository<CartItem>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async getActiveCart(userId: string): Promise<Cart> {
        const existing = await this.findActiveCart(userId);
        if (existing) return existing;
        const cart = await this.cartsRepository.save(
            this.cartsRepository.create({ userId, status: CartStatus.active }),
        );
        return this.loadCart(cart.id);
    }

    async addItem(userId: string, dto: AddCartItemDto): Promise<Cart> {
        const cart = await this.getActiveCart(userId);
        const product = await this.productsRepository.findOneBy({
            id: dto.productId,
            status: ProductStatus.published,
        });
        if (!product)
            throw new NotFoundException('Published product not found');

        const existing = await this.cartItemsRepository.findOneBy({
            cartId: cart.id,
            productId: product.id,
        });
        if (existing) {
            existing.quantity += dto.quantity;
            await this.cartItemsRepository.save(existing);
        } else {
            await this.cartItemsRepository.save(
                this.cartItemsRepository.create({
                    cartId: cart.id,
                    productId: product.id,
                    quantity: dto.quantity,
                    unitPriceAmount: product.priceAmount,
                    currency: product.currency,
                }),
            );
        }
        return this.touchAndLoad(cart);
    }

    async updateItem(
        userId: string,
        itemId: string,
        dto: UpdateCartItemDto,
    ): Promise<Cart> {
        const cart = await this.getActiveCart(userId);
        const item = await this.cartItemsRepository.findOneBy({
            id: itemId,
            cartId: cart.id,
        });
        if (!item) throw new NotFoundException('Cart item not found');
        item.quantity = dto.quantity;
        await this.cartItemsRepository.save(item);
        return this.touchAndLoad(cart);
    }

    async removeItem(userId: string, itemId: string): Promise<Cart> {
        const cart = await this.getActiveCart(userId);
        const item = await this.cartItemsRepository.findOneBy({
            id: itemId,
            cartId: cart.id,
        });
        if (!item) throw new NotFoundException('Cart item not found');
        await this.cartItemsRepository.remove(item);
        return this.touchAndLoad(cart);
    }

    async clear(userId: string): Promise<void> {
        const cart = await this.getActiveCart(userId);
        await this.cartItemsRepository.delete({ cartId: cart.id });
        cart.updatedAt = new Date();
        await this.cartsRepository.save(cart);
    }

    private async findActiveCart(userId: string): Promise<Cart | null> {
        return this.cartsRepository.findOne({
            where: { userId, status: CartStatus.active },
            relations: { items: true },
            order: { items: { createdAt: 'ASC' } },
        });
    }

    private async loadCart(id: string): Promise<Cart> {
        const cart = await this.cartsRepository.findOne({
            where: { id },
            relations: { items: true },
            order: { items: { createdAt: 'ASC' } },
        });
        if (!cart) throw new NotFoundException('Cart not found');
        return cart;
    }

    private async touchAndLoad(cart: Cart): Promise<Cart> {
        cart.updatedAt = new Date();
        await this.cartsRepository.save(cart);
        return this.loadCart(cart.id);
    }
}
