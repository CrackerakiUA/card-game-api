import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AddCartItemDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    productId: string;

    @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 99 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(99)
    quantity = 1;
}

export class UpdateCartItemDto {
    @ApiProperty({ minimum: 1, maximum: 99 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(99)
    quantity: number;
}
