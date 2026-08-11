import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export enum DuelType {
    standard = 'standard',
}
export enum DuelStatus {
    pending = 'pending',
    inProgress = 'in_progress',
    waitingPlayerResults = 'waiting_player_results',
    completed = 'completed',
    undetermined = 'undetermined',
    declined = 'declined',
    cancelled = 'cancelled',
    expired = 'expired',
}
export enum DuelResultStatus {
    pending = 'pending',
    agreed = 'agreed',
    disputed = 'disputed',
    undetermined = 'undetermined',
}
@Entity({ name: 'duel_challenges' })
@Index('duels_challenger_idx', ['challengerUserId'])
@Index('duels_opponent_idx', ['opponentUserId'])
export class Duel {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'challenger_user_id', type: 'uuid' })
    challengerUserId: string;
    @Column({ name: 'opponent_user_id', type: 'uuid' }) opponentUserId: string;
    @Column({ name: 'referee_user_id', type: 'uuid', nullable: true })
    refereeUserId: string | null;
    @Column({ type: 'enum', enum: DuelType, default: DuelType.standard })
    type: DuelType;
    @Column({ type: 'enum', enum: DuelStatus, default: DuelStatus.pending })
    status: DuelStatus;
    @Column({ type: 'varchar', length: 500, nullable: true }) message:
        string | null;
    @Column({ name: 'winner_user_id', type: 'uuid', nullable: true })
    winnerUserId: string | null;
    @Column({
        name: 'result_status',
        type: 'enum',
        enum: DuelResultStatus,
        default: DuelResultStatus.pending,
    })
    resultStatus: DuelResultStatus;
    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt: Date | null;
    @Column({ name: 'responded_at', type: 'timestamptz', nullable: true })
    respondedAt: Date | null;
    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt: Date | null;
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
