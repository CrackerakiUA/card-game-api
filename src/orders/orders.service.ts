import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cart, CartStatus } from '../cart/cart.entity';
import { CreateOrderDto } from './dto/order.dto';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { OrderItem } from './order-item.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
    ) {}

    async createFromCart(userId: string, dto: CreateOrderDto): Promise<Order> {
        return this.dataSource.transaction(async (manager) => {
            const cart = await manager.getRepository(Cart).findOne({
                where: { userId, status: CartStatus.active },
                relations: { items: true },
            });
            if (!cart || cart.items.length === 0)
                throw new BadRequestException('Active cart is empty');

            const currency = cart.items[0].currency;
            if (cart.items.some((item) => item.currency !== currency)) {
                throw new ConflictException(
                    'Cart items must use a single currency',
                );
            }
            const totalAmount = cart.items.reduce(
                (total, item) => total + item.quantity * item.unitPriceAmount,
                0,
            );
            if (
                !Number.isSafeInteger(totalAmount) ||
                totalAmount > 2_147_483_647
            )
                throw new BadRequestException('Order total is too large');

            const order = await manager.getRepository(Order).save(
                manager.getRepository(Order).create({
                    userId,
                    deliveryMethod: dto.deliveryMethod ?? null,
                    deliveryAddress: dto.deliveryAddress ?? null,
                    totalAmount,
                    currency,
                }),
            );
            await manager.getRepository(OrderItem).save(
                cart.items.map((item) =>
                    manager.getRepository(OrderItem).create({
                        orderId: order.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPriceAmount: item.unitPriceAmount,
                        currency: item.currency,
                    }),
                ),
            );
            cart.status = CartStatus.converted;
            cart.updatedAt = new Date();
            await manager.getRepository(Cart).save(cart);
            return this.loadById(order.id, manager.getRepository(Order));
        });
    }

    async listForUser(
        userId: string,
    ): Promise<{ orders: Order[]; total: number }> {
        return this.list({ userId });
    }

    async listAll(): Promise<{ orders: Order[]; total: number }> {
        return this.list({});
    }

    async findForUser(id: string, userId: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({
            where: { id, userId },
            relations: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    async findById(id: string): Promise<Order> {
        return this.loadById(id, this.ordersRepository);
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findById(id);
        const permittedTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.pending]: [
                OrderStatus.waitingPayment,
                OrderStatus.paymentFailed,
            ],
            [OrderStatus.waitingPayment]: [
                OrderStatus.paid,
                OrderStatus.paymentFailed,
            ],
            [OrderStatus.paid]: [OrderStatus.processing],
            [OrderStatus.paymentFailed]: [OrderStatus.waitingPayment],
            [OrderStatus.processing]: [
                OrderStatus.shipped,
                OrderStatus.completed,
            ],
            [OrderStatus.shipped]: [OrderStatus.completed],
            [OrderStatus.completed]: [],
        };
        if (!permittedTransitions[order.status].includes(status)) {
            throw new ConflictException(
                `Cannot change order status from ${order.status} to ${status}`,
            );
        }
        order.status = status;
        if (status === OrderStatus.paid) {
            order.paymentStatus = PaymentStatus.paid;
            order.paidAt = new Date();
        } else if (status === OrderStatus.paymentFailed) {
            order.paymentStatus = PaymentStatus.failed;
        }
        order.updatedAt = new Date();
        return this.ordersRepository.save(order);
    }

    private async list(where: {
        userId?: string;
    }): Promise<{ orders: Order[]; total: number }> {
        const [orders, total] = await this.ordersRepository.findAndCount({
            where,
            relations: { items: true },
            order: { createdAt: 'DESC' },
        });
        return { orders, total };
    }

    private async loadById(
        id: string,
        repository: Repository<Order>,
    ): Promise<Order> {
        const order = await repository.findOne({
            where: { id },
            relations: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
}
