import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../order.entity';

export class OrderItemResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty({ format: 'uuid' }) productId: string;
    @ApiProperty() quantity: number;
    @ApiProperty() unitPriceAmount: number;
    @ApiProperty({ example: 'UAH' }) currency: string;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
}

export class OrderResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
    @ApiProperty({ enum: PaymentStatus }) paymentStatus: PaymentStatus;
    @ApiPropertyOptional({ nullable: true }) deliveryMethod: string | null;
    @ApiPropertyOptional({
        nullable: true,
        type: 'object',
        additionalProperties: true,
    })
    deliveryAddress: Record<string, unknown> | null;
    @ApiProperty() totalAmount: number;
    @ApiProperty({ example: 'UAH' }) currency: string;
    @ApiPropertyOptional({ nullable: true }) stripeCheckoutSessionId:
        string | null;
    @ApiProperty({ type: () => [OrderItemResponseDto] })
    items: OrderItemResponseDto[];
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
    @ApiPropertyOptional({ format: 'date-time', nullable: true })
    paidAt: Date | null;
}

export class OrderListResponseDto {
    @ApiProperty({ type: () => [OrderResponseDto] }) orders: OrderResponseDto[];
    @ApiProperty({ example: 1 }) total: number;
}
