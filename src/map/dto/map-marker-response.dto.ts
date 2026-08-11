import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerMapMarkerStatus } from '../player-map-marker.entity';
export class MapMarkerResponseDto {
    @ApiProperty({ format: 'uuid' }) id: string;
    @ApiProperty() latitude: number;
    @ApiProperty() longitude: number;
    @ApiPropertyOptional({ nullable: true }) message: string | null;
    @ApiProperty({ enum: PlayerMapMarkerStatus }) status: PlayerMapMarkerStatus;
    @ApiProperty({ format: 'date-time' }) expiresAt: Date;
    @ApiProperty({ format: 'date-time' }) createdAt: Date;
    @ApiProperty({ format: 'date-time' }) updatedAt: Date;
}
