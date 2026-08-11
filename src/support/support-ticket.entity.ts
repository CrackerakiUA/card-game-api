import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
export enum SupportTicketStatus {
    open = 'open',
    inProgress = 'in_progress',
    answered = 'answered',
    closed = 'closed',
}
@Entity({ name: 'support_tickets' })
@Index('support_tickets_user_created_idx', ['userId', 'createdAt'])
export class SupportTicket {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'user_id', type: 'uuid' }) userId: string;
    @Column({ type: 'varchar', length: 200 }) subject: string;
    @Column({
        type: 'enum',
        enum: SupportTicketStatus,
        default: SupportTicketStatus.open,
    })
    status: SupportTicketStatus;
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
    @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
    closedAt: Date | null;
}
