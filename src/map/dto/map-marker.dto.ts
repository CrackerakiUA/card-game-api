import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Max,
    Min,
} from 'class-validator';
import { PlayerMapMarkerStatus } from '../player-map-marker.entity';
export class CreateMapMarkerDto {
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(1, 280)
    message?: string;
    @ApiPropertyOptional({ format: 'date-time' })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;
}
export class UpdateMapMarkerDto extends PartialType(CreateMapMarkerDto) {
    @ApiPropertyOptional({ enum: PlayerMapMarkerStatus })
    @IsOptional()
    @IsEnum(PlayerMapMarkerStatus)
    status?: PlayerMapMarkerStatus;
}
export class MapMarkersQueryDto {
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
    @ApiPropertyOptional({
        default: 2,
        maximum: 25,
        description: 'Radius in kilometres',
    })
    @IsOptional()
    @Type(() => Number)
    @Min(0.1)
    @Max(25)
    radius = 2;
}
