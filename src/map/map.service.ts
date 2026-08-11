import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateMapMarkerDto,
    MapMarkersQueryDto,
    UpdateMapMarkerDto,
} from './dto/map-marker.dto';
import {
    PlayerMapMarker,
    PlayerMapMarkerStatus,
} from './player-map-marker.entity';
@Injectable()
export class MapService {
    constructor(
        @InjectRepository(PlayerMapMarker)
        private readonly markersRepository: Repository<PlayerMapMarker>,
    ) {}
    async listActive(query: MapMarkersQueryDto): Promise<PlayerMapMarker[]> {
        return this.markersRepository
            .createQueryBuilder('marker')
            .where('marker.status = :status', {
                status: PlayerMapMarkerStatus.active,
            })
            .andWhere('marker.expires_at > CURRENT_TIMESTAMP')
            .andWhere(
                '(6371 * acos(least(1, greatest(-1, cos(radians(:latitude)) * cos(radians(marker.latitude)) * cos(radians(marker.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(marker.latitude)))))) <= :radius',
                query,
            )
            .orderBy('marker.created_at', 'DESC')
            .getMany();
    }
    async create(
        userId: string,
        dto: CreateMapMarkerDto,
    ): Promise<PlayerMapMarker> {
        const expiresAt = dto.expiresAt
            ? new Date(dto.expiresAt)
            : new Date(Date.now() + 60 * 60 * 1000);
        if (
            expiresAt <= new Date() ||
            expiresAt > new Date(Date.now() + 24 * 60 * 60 * 1000)
        )
            throw new ForbiddenException(
                'Marker expiration must be within the next 24 hours',
            );
        return this.markersRepository.save(
            this.markersRepository.create({
                userId,
                latitude: dto.latitude,
                longitude: dto.longitude,
                message: dto.message ?? null,
                expiresAt,
            }),
        );
    }
    async update(
        userId: string,
        id: string,
        dto: UpdateMapMarkerDto,
    ): Promise<PlayerMapMarker> {
        const marker = await this.findOwned(userId, id);
        if (dto.expiresAt && new Date(dto.expiresAt) <= new Date())
            throw new ForbiddenException(
                'Marker expiration must be in the future',
            );
        Object.assign(marker, dto, {
            expiresAt: dto.expiresAt
                ? new Date(dto.expiresAt)
                : marker.expiresAt,
            updatedAt: new Date(),
        });
        return this.markersRepository.save(marker);
    }
    async remove(userId: string, id: string): Promise<void> {
        await this.markersRepository.remove(await this.findOwned(userId, id));
    }
    private async findOwned(
        userId: string,
        id: string,
    ): Promise<PlayerMapMarker> {
        const marker = await this.markersRepository.findOneBy({ id });
        if (!marker) throw new NotFoundException('Marker not found');
        if (marker.userId !== userId)
            throw new ForbiddenException(
                'Marker is not owned by the current user',
            );
        return marker;
    }
}
