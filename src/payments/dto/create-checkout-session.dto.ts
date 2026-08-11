import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    orderId: string;
}
