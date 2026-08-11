import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto, MessageDto } from './support.dto';
import { SupportTicketMessage } from './support-ticket-message.entity';
import { SupportTicket, SupportTicketStatus } from './support-ticket.entity';
@Injectable()
export class SupportService {
    constructor(
        @InjectRepository(SupportTicket) private t: Repository<SupportTicket>,
        @InjectRepository(SupportTicketMessage)
        private m: Repository<SupportTicketMessage>,
    ) {}
    async create(u: string, d: CreateTicketDto) {
        const x = await this.t.save(
            this.t.create({ userId: u, subject: d.subject }),
        );
        await this.m.save(
            this.m.create({
                ticketId: x.id,
                authorUserId: u,
                message: d.message,
            }),
        );
        return this.get(x.id, u);
    }
    async mine(u: string) {
        return this.t.find({
            where: { userId: u },
            order: { updatedAt: 'DESC' },
        });
    }
    async all() {
        return this.t.find({ order: { updatedAt: 'DESC' } });
    }
    async get(id: string, u?: string) {
        const x = await this.t.findOneBy({ id });
        if (!x) throw new NotFoundException('Ticket not found');
        if (u && x.userId !== u) throw new ForbiddenException();
        return {
            ...x,
            messages: await this.m.find({
                where: { ticketId: id },
                order: { createdAt: 'ASC' },
            }),
        };
    }
    async reply(id: string, u: string, d: MessageDto, support: boolean) {
        const x = await this.get(id, support ? undefined : u);
        await this.m.save(
            this.m.create({
                ticketId: id,
                authorUserId: u,
                message: d.message,
            }),
        );
        x.status = support
            ? SupportTicketStatus.answered
            : SupportTicketStatus.inProgress;
        x.closedAt = null;
        x.updatedAt = new Date();
        return this.t.save(x);
    }
    async status(id: string, status: SupportTicketStatus) {
        const x = await this.get(id);
        x.status = status;
        x.closedAt = status === SupportTicketStatus.closed ? new Date() : null;
        x.updatedAt = new Date();
        return this.t.save(x);
    }
}
