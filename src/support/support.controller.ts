import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateTicketDto, MessageDto, StatusDto } from './support.dto';
import { SupportService } from './support.service';
@UseGuards(SupabaseAuthGuard)
@Controller()
export class SupportController {
    constructor(
        private s: SupportService,
        private u: UsersService,
    ) {}
    private async user(r: AuthenticatedRequest) {
        return this.u.findOrCreate(r.authUser!.authId, r.authUser!.email);
    }
    private async staff(r: AuthenticatedRequest) {
        const u = await this.user(r);
        if (![UserRole.admin, UserRole.support].includes(u.role))
            throw new ForbiddenException();
        return u;
    }
    @Post('support/tickets') async create(
        @Req() r: AuthenticatedRequest,
        @Body() d: CreateTicketDto,
    ) {
        return this.s.create((await this.user(r)).id, d);
    }
    @Get('support/tickets/my') async mine(@Req() r: AuthenticatedRequest) {
        return this.s.mine((await this.user(r)).id);
    }
    @Get('support/tickets/:id') async get(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.s.get(id, (await this.user(r)).id);
    }
    @Post('support/tickets/:id/messages') async reply(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: MessageDto,
    ) {
        return this.s.reply(id, (await this.user(r)).id, d, false);
    }
    @Get('admin/support/tickets') async all(@Req() r: AuthenticatedRequest) {
        await this.staff(r);
        return this.s.all();
    }
    @Get('admin/support/tickets/:id') async adminGet(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.staff(r);
        return this.s.get(id);
    }
    @Post('admin/support/tickets/:id/messages') async adminReply(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: MessageDto,
    ) {
        return this.s.reply(id, (await this.staff(r)).id, d, true);
    }
    @Patch('admin/support/tickets/:id/status') async status(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: StatusDto,
    ) {
        await this.staff(r);
        return this.s.status(id, d.status);
    }
}
