import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export enum PlayerMapMarkerStatus {
    active = 'active',
    hidden = 'hidden',
    completed = 'completed',
}
@Entity({ name: 'player_map_markers' })
@Index('player_map_markers_active_location_idx', [
    'status',
    'latitude',
    'longitude',
])
@Index('player_map_markers_user_id_idx', ['userId'])
export class PlayerMapMarker {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'user_id', type: 'uuid' }) userId: string;
    @Column({ type: 'double precision' }) latitude: number;
    @Column({ type: 'double precision' }) longitude: number;
    @Column({ type: 'varchar', length: 280, nullable: true }) message:
        string | null;
    @Column({
        type: 'enum',
        enum: PlayerMapMarkerStatus,
        default: PlayerMapMarkerStatus.active,
    })
    status: PlayerMapMarkerStatus;
    @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt: Date;
    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
    @Column({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
