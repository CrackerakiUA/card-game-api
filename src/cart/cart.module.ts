import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { UsersModule } from '../users/users.module';
import { CartItem } from './cart-item.entity';
import { Cart } from './cart.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
    imports: [TypeOrmModule.forFeature([Cart, CartItem, Product]), UsersModule],
    controllers: [CartController],
    providers: [CartService],
})
export class CartModule {}
