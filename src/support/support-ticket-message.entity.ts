import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'support_ticket_messages' })
@Index('support_messages_ticket_idx', ['ticketId'])
export class SupportTicketMessage {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ name: 'ticket_id', type: 'uuid' }) ticketId: string;
    @Column({ name: 'author_user_id', type: 'uuid' }) authorUserId: string;
    @Column({ type: 'varchar', length: 4000 }) message: string;
    @Column({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}
