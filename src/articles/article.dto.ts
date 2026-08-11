import { PartialType } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    IsUrl,
    Length,
    Matches,
} from 'class-validator';
import { ArticleStatus } from './article.entity';
export class CreateArticleDto {
    @IsString() @Length(1, 200) title: string;
    @IsString()
    @Length(3, 220)
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    slug: string;
    @IsString() @Length(1, 500) excerpt: string;
    @IsString() content: string;
    @IsOptional() @IsUrl({ require_tld: false }) coverImage?: string;
    @IsOptional() @IsEnum(ArticleStatus) status?: ArticleStatus;
    @IsOptional() @IsBoolean() isFeatured?: boolean;
}
export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
