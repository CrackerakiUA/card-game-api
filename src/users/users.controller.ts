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
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from './supabase-auth.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User, UserRole, UserStatus } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('users')
    @ApiOperation({ summary: 'List public player profiles' })
    async listUsers(@Query() query: ListUsersQueryDto) {
        const result = await this.usersService.listPublic(query);
        return {
            ...result,
            users: result.users.map((user) => this.publicUser(user)),
        };
    }

    @Get('users/:slug')
    @ApiOperation({ summary: 'Get a public player profile' })
    async getUser(@Param('slug') slug: string) {
        return this.publicUser(await this.usersService.findPublicBySlug(slug));
    }

    @Get('me')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get or provision the current user profile' })
    @ApiOkResponse({ description: 'Current user profile' })
    async getMe(@Req() request: AuthenticatedRequest) {
        const auth = request.authUser!;
        return this.privateUser(
            await this.usersService.findOrCreate(auth.authId, auth.email),
        );
    }

    @Patch('me')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update the current user profile' })
    async updateMe(
        @Req() request: AuthenticatedRequest,
        @Body() dto: UpdateMyProfileDto,
    ) {
        const auth = request.authUser!;
        const user = await this.usersService.findOrCreate(
            auth.authId,
            auth.email,
        );
        return this.privateUser(
            await this.usersService.updateMyProfile(user, dto),
        );
    }

    @Delete('me')
    @HttpCode(204)
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deactivate the current application profile' })
    async deleteMe(@Req() request: AuthenticatedRequest): Promise<void> {
        const auth = request.authUser!;
        const user = await this.usersService.findOrCreate(
            auth.authId,
            auth.email,
        );
        await this.usersService.setStatus(user.id, UserStatus.deleted);
    }

    @Get('admin/users')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all users (admin)' })
    async listAdminUsers(
        @Req() request: AuthenticatedRequest,
        @Query() query: ListUsersQueryDto,
    ) {
        await this.requireAdmin(request);
        return this.usersService.listAdmin(query);
    }

    @Get('admin/users/:id')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user (admin)' })
    async getAdminUser(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.requireAdmin(request);
        return this.privateUser(await this.usersService.findById(id));
    }

    @Patch('admin/users/:id/role')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change a user role (admin)' })
    async updateRole(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateUserRoleDto,
    ) {
        await this.requireAdmin(request);
        return this.privateUser(await this.usersService.setRole(id, dto.role));
    }

    @Patch('admin/users/:id/status')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change a user status (admin)' })
    async updateStatus(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateUserStatusDto,
    ) {
        await this.requireAdmin(request);
        return this.privateUser(
            await this.usersService.setStatus(id, dto.status),
        );
    }

    private async requireAdmin(request: AuthenticatedRequest): Promise<void> {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        if (user.role !== UserRole.admin) {
            throw new ForbiddenException('Admin role is required');
        }
    }

    private publicUser(user: User) {
        return {
            nickname: user.nickname,
            displayName: user.displayName,
            slug: user.slug,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            locale: user.locale,
            showCardsPublicly: user.showCardsPublicly,
            showDuelHistoryPublicly: user.showDuelHistoryPublicly,
            createdAt: user.createdAt,
        };
    }

    private privateUser(user: User) {
        return {
            id: user.id,
            authId: user.authId,
            email: user.email,
            ...this.publicUser(user),
            role: user.role,
            status: user.status,
            lastSeenAt: user.lastSeenAt,
            updatedAt: user.updatedAt,
        };
    }
}
