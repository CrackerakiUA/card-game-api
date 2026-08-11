import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsISO4217CurrencyCode,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
    Max,
    Min,
} from 'class-validator';
import { ProductStatus, ProductType } from '../product.entity';

export class CreateProductDto {
    @ApiProperty({ example: 'Starter deck' })
    @IsString()
    @Length(1, 160)
    title: string;
    @ApiProperty({ example: 'starter-deck' })
    @IsString()
    @Length(3, 180)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;
    @ApiProperty() @IsString() @Length(1, 500) shortDescription: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiProperty({ enum: ProductType }) @IsEnum(ProductType) type: ProductType;
    @ApiProperty({ example: 'decks' })
    @IsString()
    @Length(1, 64)
    category: string;
    @ApiProperty({
        example: 49900,
        description: 'Price in the smallest currency unit',
    })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(2147483647)
    priceAmount: number;
    @ApiProperty({ example: 'UAH' }) @IsISO4217CurrencyCode() currency: string;
    @ApiPropertyOptional({ format: 'uri' })
    @IsOptional()
    // class-validator uses this snake_case option name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    @IsUrl({ require_tld: false })
    coverImage?: string;
    @ApiPropertyOptional({ type: [String], format: 'uri' })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    // class-validator uses this snake_case option name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    @IsUrl({ require_tld: false }, { each: true })
    gallery?: string[];
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(1, 255)
    stripePriceId?: string;
    @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.draft })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    showOnHome?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ListProductsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(1, 64)
    category?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() @Length(1, 160) q?: string;
    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 20;
    @ApiPropertyOptional({ default: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset = 0;
}
