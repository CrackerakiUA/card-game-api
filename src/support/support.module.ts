import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportTicketMessage } from './support-ticket-message.entity';
import { SupportTicket } from './support-ticket.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([SupportTicket, SupportTicketMessage]),
        UsersModule,
    ],
    controllers: [SupportController],
    providers: [SupportService],
})
export class SupportModule {}
