import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
    @ApiProperty({ format: 'uri' })
    checkoutUrl: string;

    @ApiProperty()
    sessionId: string;
}
