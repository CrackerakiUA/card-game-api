import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../user.entity';

export class PublicUserResponseDto {
    @ApiPropertyOptional({ example: 'card-master', nullable: true })
    nickname: string | null;

    @ApiPropertyOptional({ example: 'Card Master', nullable: true })
    displayName: string | null;

    @ApiPropertyOptional({ example: 'card-master', nullable: true })
    slug: string | null;

    @ApiPropertyOptional({ format: 'uri', nullable: true })
    avatarUrl: string | null;

    @ApiPropertyOptional({ nullable: true })
    bio: string | null;

    @ApiProperty({ example: 'uk' })
    locale: string;

    @ApiProperty()
    showCardsPublicly: boolean;

    @ApiProperty()
    showDuelHistoryPublicly: boolean;

    @ApiProperty({ format: 'date-time' })
    createdAt: Date;
}

export class CurrentUserResponseDto extends PublicUserResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ format: 'uuid' })
    authId: string;

    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiProperty({ enum: UserStatus })
    status: UserStatus;

    @ApiPropertyOptional({ format: 'date-time', nullable: true })
    lastSeenAt: Date | null;

    @ApiProperty({ format: 'date-time' })
    updatedAt: Date;
}

export class PublicUserListResponseDto {
    @ApiProperty({ type: () => [PublicUserResponseDto] })
    users: PublicUserResponseDto[];

    @ApiProperty({ example: 1 })
    total: number;
}

export class AdminUserListResponseDto {
    @ApiProperty({ type: () => [CurrentUserResponseDto] })
    users: CurrentUserResponseDto[];

    @ApiProperty({ example: 1 })
    total: number;
}
