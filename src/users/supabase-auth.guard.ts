import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
    authUser?: { authId: string; email: string; claims: JWTPayload };
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const authorization = request.headers.authorization;
        const token = authorization?.startsWith('Bearer ')
            ? authorization.slice('Bearer '.length)
            : undefined;
        if (!token) throw new UnauthorizedException('Bearer token is required');

        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        if (!supabaseUrl) {
            throw new ServiceUnavailableException(
                'Supabase authentication is not configured',
            );
        }

        try {
            const issuer = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
            const jwks = createRemoteJWKSet(
                new URL(`${issuer}/.well-known/jwks.json`),
            );
            const { payload } = await jwtVerify(token, jwks, {
                issuer,
                audience: this.configService.getOrThrow<string>(
                    'SUPABASE_JWT_AUDIENCE',
                ),
            });
            if (
                typeof payload.sub !== 'string' ||
                typeof payload.email !== 'string'
            ) {
                throw new UnauthorizedException(
                    'Token is missing user identity claims',
                );
            }
            request.authUser = {
                authId: payload.sub,
                email: payload.email,
                claims: payload,
            };
            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('Invalid or expired bearer token');
        }
    }
}
