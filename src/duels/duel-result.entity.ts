import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export enum DuelRole {
    challenger = 'challenger',
    opponent = 'opponent',
}
export enum DeclaredResult {
    win = 'win',
    loss = 'loss',
    draw = 'draw',
}
@Entity({ name: 'duel_results' })
@Index('duel_results_duel_user_key', ['duelId', 'userId'], { unique: true })
export class DuelResult {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'duel_id', type: 'uuid' }) duelId: string;
    @Column({ name: 'user_id', type: 'uuid' }) userId: string;
    @Column({ name: 'role_in_duel', type: 'enum', enum: DuelRole })
    roleInDuel: DuelRole;
    @Column({ name: 'declared_result', type: 'enum', enum: DeclaredResult })
    declaredResult: DeclaredResult;
    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}
