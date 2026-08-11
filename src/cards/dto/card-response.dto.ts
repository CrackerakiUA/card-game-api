import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardStatus } from '../card.entity';

export class CardResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty({ format: 'uuid' }) productId: string;
    @ApiProperty() cardIdentifier: string;
    @ApiProperty() title: string;
    @ApiPropertyOptional({ nullable: true }) description: string | null;
    @ApiPropertyOptional({ format: 'uri', nullable: true }) imageUrl:
        string | null;
    @ApiProperty() category: string;
    @ApiProperty({ enum: CardStatus }) status: CardStatus;
    @ApiPropertyOptional({ format: 'uuid', nullable: true })
    currentOwnerUserId: string | null;
    @ApiPropertyOptional({ format: 'date-time', nullable: true })
    registeredAt: Date | null;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}

export class CardListResponseDto {
    @ApiProperty({ type: () => [CardResponseDto] }) cards: CardResponseDto[];
    @ApiProperty({ example: 1 }) total: number;
}
