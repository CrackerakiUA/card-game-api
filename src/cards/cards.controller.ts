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
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CardsService } from './cards.service';
import { CreateCardDto, RegisterCardDto, UpdateCardDto } from './dto/card.dto';
import { CardListResponseDto, CardResponseDto } from './dto/card-response.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class CardsController {
    constructor(
        private readonly cardsService: CardsService,
        private readonly usersService: UsersService,
    ) {}
    @Get('me/cards')
    @ApiOperation({ summary: 'List cards registered to the current user' })
    @ApiOkResponse({ type: CardListResponseDto })
    async listMine(@Req() request: AuthenticatedRequest) {
        return this.cardsService.listMine(await this.currentUserId(request));
    }
    @Post('cards/register')
    @ApiOperation({ summary: 'Register an available card to the current user' })
    @ApiCreatedResponse({ type: CardResponseDto })
    async register(
        @Req() request: AuthenticatedRequest,
        @Body() dto: RegisterCardDto,
    ) {
        return this.cardsService.register(
            await this.currentUserId(request),
            dto.cardIdentifier.toUpperCase(),
        );
    }
    @Get('cards/:id')
    @ApiOperation({ summary: 'Get card details' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: CardResponseDto })
    async getCard(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        const card = await this.cardsService.findById(id);
        const userId = await this.currentUserId(request);
        if (card.currentOwnerUserId !== userId)
            throw new ForbiddenException(
                'Card is not registered to the current user',
            );
        return card;
    }
    @Get('admin/cards')
    @ApiOperation({ summary: 'List all cards (admin or store manager)' })
    @ApiOkResponse({ type: CardListResponseDto })
    async listAdmin(@Req() request: AuthenticatedRequest) {
        await this.requireManager(request);
        return this.cardsService.listAll();
    }
    @Get('admin/cards/:id')
    @ApiOperation({ summary: 'Get a card (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: CardResponseDto })
    async getAdmin(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.requireManager(request);
        return this.cardsService.findById(id);
    }
    @Post('admin/cards')
    @ApiOperation({ summary: 'Create a card (admin or store manager)' })
    @ApiCreatedResponse({ type: CardResponseDto })
    async create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateCardDto,
    ) {
        await this.requireManager(request);
        return this.cardsService.create(dto);
    }
    @Patch('admin/cards/:id')
    @ApiOperation({ summary: 'Update a card (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: CardResponseDto })
    async update(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateCardDto,
    ) {
        await this.requireManager(request);
        return this.cardsService.update(id, dto);
    }
    @Delete('admin/cards/:id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Archive a card (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiNoContentResponse({ description: 'Card archived' })
    async archive(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<void> {
        await this.requireManager(request);
        await this.cardsService.archive(id);
    }
    private async currentUserId(
        request: AuthenticatedRequest,
    ): Promise<string> {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        return user.id;
    }
    private async requireManager(request: AuthenticatedRequest): Promise<void> {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        if (user.role !== UserRole.admin && user.role !== UserRole.storeManager)
            throw new ForbiddenException(
                'Admin or store manager role is required',
            );
    }
}
