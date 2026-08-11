import { IsEnum, IsString, Length } from 'class-validator';
import { SupportTicketStatus } from './support-ticket.entity';
export class CreateTicketDto {
    @IsString() @Length(1, 200) subject: string;
    @IsString() @Length(1, 4000) message: string;
}
export class MessageDto {
    @IsString() @Length(1, 4000) message: string;
}
export class StatusDto {
    @IsEnum(SupportTicketStatus) status: SupportTicketStatus;
}
