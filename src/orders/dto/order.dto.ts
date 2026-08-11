import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { OrderStatus } from '../order.entity';

export class CreateOrderDto {
    @ApiPropertyOptional({ example: 'nova_poshta' })
    @IsOptional()
    @IsString()
    @Length(1, 64)
    deliveryMethod?: string;

    @ApiPropertyOptional({ example: { city: 'Kyiv', warehouse: '1' } })
    @IsOptional()
    @IsObject()
    deliveryAddress?: Record<string, unknown>;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
