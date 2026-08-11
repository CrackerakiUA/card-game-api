import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
/* eslint-disable @typescript-eslint/naming-convention -- Stripe SDK uses snake_case request fields. */
import Stripe from 'stripe';
import { DataSource, In, Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import {
    Payment,
    PaymentProvider,
    PaymentRecordStatus,
} from './payment.entity';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly configService: ConfigService,
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Payment)
        private readonly paymentsRepository: Repository<Payment>,
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async createCheckoutSession(
        userId: string,
        orderId: string,
    ): Promise<{ checkoutUrl: string; sessionId: string }> {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId, userId },
            relations: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        if (
            ![
                OrderStatus.pending,
                OrderStatus.waitingPayment,
                OrderStatus.paymentFailed,
            ].includes(order.status)
        ) {
            throw new BadRequestException(
                'Order cannot be paid in its current status',
            );
        }
        const products = await this.productsRepository.findBy({
            id: In(order.items.map((item) => item.productId)),
        });
        const productTitles = new Map(
            products.map((product) => [product.id, product.title]),
        );
        const stripe = this.stripeClient();
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: this.checkoutSuccessUrl(),
            cancel_url: this.checkoutCancelUrl(),
            client_reference_id: order.id,
            metadata: { orderId: order.id },
            line_items: order.items.map((item) => ({
                quantity: item.quantity,
                price_data: {
                    currency: item.currency.toLowerCase(),
                    unit_amount: item.unitPriceAmount,
                    product_data: {
                        name: productTitles.get(item.productId) ?? 'Product',
                    },
                },
            })),
        });
        if (!session.url)
            throw new ServiceUnavailableException(
                'Stripe did not return a checkout URL',
            );

        await this.dataSource.transaction(async (manager) => {
            const payments = manager.getRepository(Payment);
            const existing = await payments.findOneBy({
                orderId: order.id,
                provider: PaymentProvider.stripe,
            });
            const payment =
                existing ??
                payments.create({
                    orderId: order.id,
                    provider: PaymentProvider.stripe,
                    amount: order.totalAmount,
                    currency: order.currency,
                });
            payment.status = PaymentRecordStatus.pending;
            payment.providerSessionId = session.id;
            payment.providerPaymentId = null;
            payment.updatedAt = new Date();
            await payments.save(payment);
            order.status = OrderStatus.waitingPayment;
            order.paymentStatus = PaymentStatus.pending;
            order.stripeCheckoutSessionId = session.id;
            order.updatedAt = new Date();
            await manager.getRepository(Order).save(order);
        });
        return { checkoutUrl: session.url, sessionId: session.id };
    }

    async processStripeWebhook(
        rawBody: Buffer | undefined,
        signature: string | undefined,
    ): Promise<void> {
        if (!rawBody || !signature)
            throw new BadRequestException(
                'Stripe signature and raw request body are required',
            );
        const event = this.stripeClient().webhooks.constructEvent(
            rawBody,
            signature,
            this.requiredConfig('STRIPE_WEBHOOK_SECRET'),
        );
        if (
            event.type === 'checkout.session.completed' ||
            event.type === 'checkout.session.async_payment_succeeded'
        ) {
            const session = event.data.object;
            if (session.payment_status === 'paid')
                await this.markSessionPaid(
                    session.id,
                    typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : (session.payment_intent?.id ?? null),
                );
        }
        if (
            event.type === 'checkout.session.async_payment_failed' ||
            event.type === 'checkout.session.expired'
        ) {
            await this.markSessionFailed(event.data.object.id);
        }
    }

    private async markSessionPaid(
        sessionId: string,
        providerPaymentId: string | null,
    ): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager
                .getRepository(Payment)
                .findOneBy({ providerSessionId: sessionId });
            if (!payment || payment.status === PaymentRecordStatus.paid) return;
            payment.status = PaymentRecordStatus.paid;
            payment.providerPaymentId = providerPaymentId;
            payment.paidAt = new Date();
            payment.updatedAt = new Date();
            await manager.getRepository(Payment).save(payment);
            const order = await manager
                .getRepository(Order)
                .findOneBy({ id: payment.orderId });
            if (!order)
                throw new NotFoundException('Order not found for payment');
            order.status = OrderStatus.paid;
            order.paymentStatus = PaymentStatus.paid;
            order.paidAt = payment.paidAt;
            order.updatedAt = new Date();
            await manager.getRepository(Order).save(order);
        });
    }

    private async markSessionFailed(sessionId: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager
                .getRepository(Payment)
                .findOneBy({ providerSessionId: sessionId });
            if (!payment || payment.status === PaymentRecordStatus.paid) return;
            payment.status = PaymentRecordStatus.failed;
            payment.updatedAt = new Date();
            await manager.getRepository(Payment).save(payment);
            const order = await manager
                .getRepository(Order)
                .findOneBy({ id: payment.orderId });
            if (!order)
                throw new NotFoundException('Order not found for payment');
            order.status = OrderStatus.paymentFailed;
            order.paymentStatus = PaymentStatus.failed;
            order.updatedAt = new Date();
            await manager.getRepository(Order).save(order);
        });
    }

    private stripeClient(): Stripe {
        return new Stripe(this.requiredConfig('STRIPE_SECRET_KEY'));
    }

    private requiredConfig(name: string): string {
        const value = this.configService.get<string>(name);
        if (!value)
            throw new ServiceUnavailableException(`${name} is not configured`);
        return value;
    }

    private checkoutSuccessUrl(): string {
        return (
            this.configService.get<string>('STRIPE_CHECKOUT_SUCCESS_URL') ??
            `${this.browserOrigin()}/payment/success?session_id={CHECKOUT_SESSION_ID}`
        );
    }

    private checkoutCancelUrl(): string {
        return (
            this.configService.get<string>('STRIPE_CHECKOUT_CANCEL_URL') ??
            `${this.browserOrigin()}/cart`
        );
    }

    private browserOrigin(): string {
        const origin = this.configService
            .getOrThrow<string>('CORS_ORIGINS')
            .split(',')[0]
            .trim()
            .replace(/\/$/, '');
        if (!origin) {
            throw new ServiceUnavailableException(
                'CORS_ORIGINS must contain a browser origin',
            );
        }
        return origin;
    }
}
