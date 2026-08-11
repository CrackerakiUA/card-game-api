import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Length,
    Matches,
} from 'class-validator';
import { CardStatus } from '../card.entity';

export class CreateCardDto {
    @ApiProperty({ format: 'uuid' }) @IsUUID() productId: string;
    @ApiProperty({ example: 'CARD-ABC-123' })
    @IsString()
    @Length(3, 128)
    @Matches(/^[A-Za-z0-9_-]+$/)
    cardIdentifier: string;
    @ApiProperty() @IsString() @Length(1, 160) title: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
    @ApiPropertyOptional({ format: 'uri' })
    @IsOptional()
    // class-validator uses this snake_case option name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    @IsUrl({ require_tld: false })
    imageUrl?: string;
    @ApiProperty() @IsString() @Length(1, 64) category: string;
    @ApiPropertyOptional({ enum: CardStatus, default: CardStatus.available })
    @IsOptional()
    @IsEnum(CardStatus)
    status?: CardStatus;
}

export class UpdateCardDto extends PartialType(CreateCardDto) {}

export class RegisterCardDto {
    @ApiProperty({ example: 'CARD-ABC-123' })
    @IsString()
    @Length(3, 128)
    @Matches(/^[A-Za-z0-9_-]+$/)
    cardIdentifier: string;
}
