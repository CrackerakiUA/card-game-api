import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsLocale,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
} from 'class-validator';

export class UpdateMyProfileDto {
    @ApiPropertyOptional({ example: 'card-master' })
    @IsOptional()
    @IsString()
    @Length(3, 32)
    @Matches(/^[a-z0-9_]+$/)
    nickname?: string;

    @ApiPropertyOptional({ example: 'Card Master' })
    @IsOptional()
    @IsString()
    @Length(1, 80)
    displayName?: string;

    @ApiPropertyOptional({ format: 'uri' })
    @IsOptional()
    // class-validator uses this snake_case option name.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    @IsUrl({ require_tld: false })
    @Length(1, 2048)
    avatarUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Length(1, 500)
    bio?: string;

    @ApiPropertyOptional({ example: 'uk' })
    @IsOptional()
    @IsLocale()
    @Length(2, 10)
    locale?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    showCardsPublicly?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    showDuelHistoryPublicly?: boolean;
}
