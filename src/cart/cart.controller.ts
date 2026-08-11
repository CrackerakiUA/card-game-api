import {
    Body,
    Controller,
    Delete,
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
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UsersService } from '../users/users.service';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('cart')
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly usersService: UsersService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get the current active cart' })
    @ApiOkResponse({ type: CartResponseDto })
    async getCart(@Req() request: AuthenticatedRequest) {
        return this.cartService.getActiveCart(
            await this.currentUserId(request),
        );
    }

    @Post('items')
    @ApiOperation({ summary: 'Add a published product to the cart' })
    @ApiOkResponse({ type: CartResponseDto })
    async addItem(
        @Req() request: AuthenticatedRequest,
        @Body() dto: AddCartItemDto,
    ) {
        return this.cartService.addItem(await this.currentUserId(request), dto);
    }

    @Patch('items/:id')
    @ApiOperation({ summary: 'Change a cart item quantity' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: CartResponseDto })
    async updateItem(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(
            await this.currentUserId(request),
            id,
            dto,
        );
    }

    @Delete('items/:id')
    @ApiOperation({ summary: 'Remove an item from the cart' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: CartResponseDto })
    async removeItem(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.cartService.removeItem(
            await this.currentUserId(request),
            id,
        );
    }

    @Delete()
    @HttpCode(204)
    @ApiOperation({ summary: 'Clear all items from the active cart' })
    @ApiNoContentResponse({ description: 'Cart cleared' })
    async clear(@Req() request: AuthenticatedRequest): Promise<void> {
        await this.cartService.clear(await this.currentUserId(request));
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
}
