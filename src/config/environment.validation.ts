const environments = ['development', 'test', 'production'] as const;

function required(value: string | undefined, name: string): string {
    if (!value) throw new Error(`${name} is required`);
    return value;
}

function integer(
    value: string | undefined,
    name: string,
    defaultValue: number,
): number {
    const parsed = Number(value ?? defaultValue);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
        throw new Error(`${name} must be a valid port number`);
    }
    return parsed;
}

function boolean(
    value: string | undefined,
    name: string,
    defaultValue: boolean,
): boolean {
    if (value === undefined) return defaultValue;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new Error(`${name} must be true or false`);
}

export function validateEnvironment(
    environment: Record<string, string | undefined>,
) {
    const nodeEnv = environment.NODE_ENV ?? 'development';
    if (!environments.includes(nodeEnv as (typeof environments)[number])) {
        throw new Error(`NODE_ENV must be one of: ${environments.join(', ')}`);
    }

    const databaseUrl = environment.DATABASE_URL;
    if (!databaseUrl) {
        required(environment.DATABASE_HOST, 'DATABASE_HOST');
        required(environment.DATABASE_USER, 'DATABASE_USER');
        required(environment.DATABASE_PASSWORD, 'DATABASE_PASSWORD');
        required(environment.DATABASE_NAME, 'DATABASE_NAME');
    }

    return {
        ...environment,
        NODE_ENV: nodeEnv,
        PORT: integer(environment.PORT, 'PORT', 3000),
        API_PREFIX: environment.API_PREFIX ?? 'api',
        SWAGGER_ENABLED: boolean(
            environment.SWAGGER_ENABLED,
            'SWAGGER_ENABLED',
            nodeEnv !== 'production',
        ),
        CORS_ORIGINS: required(environment.CORS_ORIGINS, 'CORS_ORIGINS'),
        DATABASE_URL: databaseUrl,
        DATABASE_HOST: environment.DATABASE_HOST,
        DATABASE_PORT: integer(
            environment.DATABASE_PORT,
            'DATABASE_PORT',
            5432,
        ),
        DATABASE_USER: environment.DATABASE_USER,
        DATABASE_PASSWORD: environment.DATABASE_PASSWORD,
        DATABASE_NAME: environment.DATABASE_NAME,
        DATABASE_SSL: boolean(
            environment.DATABASE_SSL,
            'DATABASE_SSL',
            nodeEnv === 'production',
        ),
        DATABASE_SSL_REJECT_UNAUTHORIZED: boolean(
            environment.DATABASE_SSL_REJECT_UNAUTHORIZED,
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            true,
        ),
    };
}
