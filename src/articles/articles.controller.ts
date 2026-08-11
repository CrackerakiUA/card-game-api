import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
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
import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { ArticlesService } from './articles.service';
@Controller()
export class ArticlesController {
    constructor(
        private s: ArticlesService,
        private u: UsersService,
    ) {}
    @Get('articles') list() {
        return this.s.list();
    }
    @Get('articles/:slug') public(@Param('slug') slug: string) {
        return this.s.public(slug);
    }
    @UseGuards(SupabaseAuthGuard) @Get('admin/articles') async all(
        @Req() r: AuthenticatedRequest,
    ) {
        await this.access(r);
        return this.s.all();
    }
    @UseGuards(SupabaseAuthGuard) @Get('admin/articles/:id') async get(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.access(r);
        return this.s.get(id);
    }
    @UseGuards(SupabaseAuthGuard) @Post('admin/articles') async create(
        @Req() r: AuthenticatedRequest,
        @Body() d: CreateArticleDto,
    ) {
        const u = await this.access(r);
        return this.s.create(u.id, d);
    }
    @UseGuards(SupabaseAuthGuard) @Patch('admin/articles/:id') async update(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() d: UpdateArticleDto,
    ) {
        const u = await this.access(r);
        return this.s.update(id, u.id, u.role === UserRole.admin, d);
    }
    @UseGuards(SupabaseAuthGuard)
    @Delete('admin/articles/:id')
    @HttpCode(204)
    async archive(
        @Req() r: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const u = await this.access(r);
        await this.s.archive(id, u.id, u.role === UserRole.admin);
    }
    private async access(r: AuthenticatedRequest) {
        const u = await this.u.findOrCreate(
            r.authUser!.authId,
            r.authUser!.email,
        );
        if (![UserRole.admin, UserRole.author].includes(u.role))
            throw new ForbiddenException();
        return u;
    }
}
