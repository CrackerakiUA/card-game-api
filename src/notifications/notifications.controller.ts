import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UsersService } from '../users/users.service';
import { NotificationService } from './notifications.service';

@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationService,
        private readonly usersService: UsersService,
    ) {}
    @Get() async list(@Req() request: AuthenticatedRequest) {
        return this.notificationsService.list(
            await this.currentUserId(request),
        );
    }
    @Get('unread-count') async unreadCount(
        @Req() request: AuthenticatedRequest,
    ) {
        return {
            count: await this.notificationsService.unreadCount(
                await this.currentUserId(request),
            ),
        };
    }
    @Patch(':id/read') async markRead(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.notificationsService.read(
            id,
            await this.currentUserId(request),
        );
    }
    @Patch('read-all') async markAllRead(@Req() request: AuthenticatedRequest) {
        await this.notificationsService.readAll(
            await this.currentUserId(request),
        );
        return {};
    }
    private async currentUserId(
        request: AuthenticatedRequest,
    ): Promise<string> {
        return (
            await this.usersService.findOrCreate(
                request.authUser!.authId,
                request.authUser!.email,
            )
        ).id;
    }
}
