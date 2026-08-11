import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'duel_comments' })
@Index('duel_comments_duel_id_idx', ['duelId'])
export class DuelComment {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'duel_id', type: 'uuid' }) duelId: string;
    @Column({ name: 'user_id', type: 'uuid' }) userId: string;
    @Column({ type: 'varchar', length: 1000 }) comment: string;
    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}
