import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { DeclaredResult } from './duel-result.entity';
export class ChallengeDto {
    @IsUUID() opponentUserId: string;
    @IsOptional() @IsString() @Length(1, 500) message?: string;
}
export class RespondDto {
    @IsEnum(['accept', 'decline']) response: 'accept' | 'decline';
}
export class SubmitResultDto {
    @IsEnum(DeclaredResult) declaredResult: DeclaredResult;
}
export class CommentDto {
    @IsString() @Length(1, 1000) comment: string;
}
