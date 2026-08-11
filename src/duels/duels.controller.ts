import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UsersService } from '../users/users.service';
import {
    ChallengeDto,
    CommentDto,
    RespondDto,
    SubmitResultDto,
} from './duels.dto';
import { DuelsService } from './duels.service';
@ApiTags('Duels')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('duels')
export class DuelsController {
    constructor(
        private s: DuelsService,
        private u: UsersService,
    ) {}
    private async id(r: AuthenticatedRequest) {
        return (
            await this.u.findOrCreate(r.authUser!.authId, r.authUser!.email)
        ).id;
    }
    @Post('challenges')
    @ApiOperation({ summary: 'Challenge another player' })
    async challenge(@Req() r: AuthenticatedRequest, @Body() d: ChallengeDto) {
        return this.s.challenge(await this.id(r), d.opponentUserId, d.message);
    }
    @Get() @ApiOperation({ summary: 'List my duels' }) async list(
        @Req() r: AuthenticatedRequest,
    ) {
        return this.s.list(await this.id(r));
    }
    @Get(':id') async get(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.s.get(id, await this.id(r));
    }
    @Post(':id/respond') async respond(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: RespondDto,
    ) {
        return this.s.respond(id, await this.id(r), d.response);
    }
    @Post(':id/result') async result(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: SubmitResultDto,
    ) {
        return this.s.submit(id, await this.id(r), d.declaredResult);
    }
    @Post(':id/comments') async comment(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: CommentDto,
    ) {
        return this.s.comment(id, await this.id(r), d.comment);
    }
}
