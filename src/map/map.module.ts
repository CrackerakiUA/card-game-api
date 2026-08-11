import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { PlayerMapMarker } from './player-map-marker.entity';
@Module({
    imports: [TypeOrmModule.forFeature([PlayerMapMarker]), UsersModule],
    controllers: [MapController],
    providers: [MapService],
})
export class MapModule {}
