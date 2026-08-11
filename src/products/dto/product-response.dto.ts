import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, ProductType } from '../product.entity';

export class PublicProductResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty() title: string;
    @ApiProperty() slug: string;
    @ApiProperty() shortDescription: string;
    @ApiPropertyOptional({ nullable: true }) description: string | null;
    @ApiProperty({ enum: ProductType }) type: ProductType;
    @ApiProperty() category: string;
    @ApiProperty() priceAmount: number;
    @ApiProperty() currency: string;
    @ApiPropertyOptional({ format: 'uri', nullable: true }) coverImage:
        string | null;
    @ApiProperty({ type: [String] }) gallery: string[];
    @ApiProperty() showOnHome: boolean;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}

export class AdminProductResponseDto extends PublicProductResponseDto {
    @ApiPropertyOptional({ nullable: true }) stripePriceId: string | null;
    @ApiProperty({ enum: ProductStatus }) status: ProductStatus;
}

export class PublicProductListResponseDto {
    @ApiProperty({ type: () => [PublicProductResponseDto] })
    products: PublicProductResponseDto[];
    @ApiProperty({ example: 1 }) total: number;
}

export class AdminProductListResponseDto {
    @ApiProperty({ type: () => [AdminProductResponseDto] })
    products: AdminProductResponseDto[];
    @ApiProperty({ example: 1 }) total: number;
}
