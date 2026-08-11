import {
    Body,
    Controller,
    Headers,
    HttpCode,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UsersService } from '../users/users.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentsService } from './payments.service';

interface StripeWebhookRequest extends Request {
    rawBody?: Buffer;
}

@ApiTags('Payments')
@Controller()
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly usersService: UsersService,
    ) {}

    @Post('payments/stripe/checkout-session')
    @UseGuards(SupabaseAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a Stripe Checkout Session for an order' })
    @ApiCreatedResponse({ type: CheckoutSessionResponseDto })
    async createCheckoutSession(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateCheckoutSessionDto,
    ) {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        return this.paymentsService.createCheckoutSession(user.id, dto.orderId);
    }

    @Post('webhooks/stripe')
    @HttpCode(204)
    @ApiOperation({ summary: 'Receive verified Stripe webhook events' })
    @ApiHeader({ name: 'stripe-signature', required: true })
    @ApiNoContentResponse({ description: 'Webhook accepted' })
    async stripeWebhook(
        @Req() request: StripeWebhookRequest,
        @Headers('stripe-signature') signature: string | undefined,
    ): Promise<void> {
        await this.paymentsService.processStripeWebhook(
            request.rawBody,
            signature,
        );
    }
}
