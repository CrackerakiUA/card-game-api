import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../cart/cart.entity';
import { UsersModule } from '../users/users.module';
import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [TypeOrmModule.forFeature([Cart, Order, OrderItem]), UsersModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}
