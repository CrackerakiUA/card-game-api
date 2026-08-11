import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../user.entity';

export class UpdateUserStatusDto {
    @ApiProperty({ enum: UserStatus })
    @IsEnum(UserStatus)
    status: UserStatus;
}
