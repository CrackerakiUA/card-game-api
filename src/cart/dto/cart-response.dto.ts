import { ApiProperty } from '@nestjs/swagger';
import { CartStatus } from '../cart.entity';

export class CartItemResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty({ format: 'uuid' }) productId: string;
    @ApiProperty() quantity: number;
    @ApiProperty() unitPriceAmount: number;
    @ApiProperty({ example: 'UAH' }) currency: string;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
}

export class CartResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty({ enum: CartStatus }) status: CartStatus;
    @ApiProperty({ type: () => [CartItemResponseDto] })
    items: CartItemResponseDto[];
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}
