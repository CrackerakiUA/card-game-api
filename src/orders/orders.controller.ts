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
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import {
    OrderListResponseDto,
    OrderResponseDto,
} from './dto/order-response.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly usersService: UsersService,
    ) {}

    @Post('orders')
    @ApiOperation({ summary: 'Create an order from the active cart' })
    @ApiCreatedResponse({ type: OrderResponseDto })
    async create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateOrderDto,
    ) {
        return this.ordersService.createFromCart(
            await this.currentUserId(request),
            dto,
        );
    }

    @Get('orders')
    @ApiOperation({ summary: 'List current user order history' })
    @ApiOkResponse({ type: OrderListResponseDto })
    async listMine(@Req() request: AuthenticatedRequest) {
        return this.ordersService.listForUser(
            await this.currentUserId(request),
        );
    }

    @Get('orders/:id')
    @ApiOperation({ summary: 'Get current user order details' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: OrderResponseDto })
    async getMine(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.ordersService.findForUser(
            id,
            await this.currentUserId(request),
        );
    }

    @Get('admin/orders')
    @ApiOperation({ summary: 'List all orders (admin or store manager)' })
    @ApiOkResponse({ type: OrderListResponseDto })
    async listAdmin(@Req() request: AuthenticatedRequest) {
        await this.requireOrderManager(request);
        return this.ordersService.listAll();
    }

    @Get('admin/orders/:id')
    @ApiOperation({ summary: 'Get an order (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: OrderResponseDto })
    async getAdmin(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        await this.requireOrderManager(request);
        return this.ordersService.findById(id);
    }

    @Patch('admin/orders/:id/status')
    @ApiOperation({ summary: 'Update order status (admin or store manager)' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: OrderResponseDto })
    async updateStatus(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        await this.requireOrderManager(request);
        return this.ordersService.updateStatus(id, dto.status);
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

    private async requireOrderManager(
        request: AuthenticatedRequest,
    ): Promise<void> {
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
