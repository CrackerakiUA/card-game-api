import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';
import { UsersModule } from '../users/users.module';
import { Card } from './card.entity';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
    imports: [TypeOrmModule.forFeature([Card, Product]), UsersModule],
    controllers: [CardsController],
    providers: [CardsService],
})
export class CardsModule {}
