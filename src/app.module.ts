import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from './cart/cart.module';
import { CardsModule } from './cards/cards.module';
import { validateEnvironment } from './config/environment.validation';
import { HealthController } from './health.controller';
import { OrdersModule } from './orders/orders.module';
import { MapModule } from './map/map.module';
import { DuelsModule } from './duels/duels.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            validate: validateEnvironment,
        }),
        UsersModule,
        ProductsModule,
        CartModule,
        CardsModule,
        OrdersModule,
        MapModule,
        DuelsModule,
        PaymentsModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const databaseUrl = configService.get<string>('DATABASE_URL');

                return {
                    type: 'postgres' as const,
                    ...(databaseUrl
                        ? { url: databaseUrl }
                        : {
                              host: configService.getOrThrow<string>(
                                  'DATABASE_HOST',
                              ),
                              port: configService.getOrThrow<number>(
                                  'DATABASE_PORT',
                              ),
                              username:
                                  configService.getOrThrow<string>(
                                      'DATABASE_USER',
                                  ),
                              password:
                                  configService.getOrThrow<string>(
                                      'DATABASE_PASSWORD',
                                  ),
                              database:
                                  configService.getOrThrow<string>(
                                      'DATABASE_NAME',
                                  ),
                          }),
                    autoLoadEntities: true,
                    synchronize: false,
                    migrations: [__dirname + '/database/migrations/*{.js,.ts}'],
                    migrationsRun: false,
                    retryAttempts: 5,
                    retryDelay: 3_000,
                    ssl: configService.getOrThrow<boolean>('DATABASE_SSL')
                        ? {
                              rejectUnauthorized:
                                  configService.getOrThrow<boolean>(
                                      'DATABASE_SSL_REJECT_UNAUTHORIZED',
                                  ),
                          }
                        : false,
                };
            },
        }),
    ],
    controllers: [HealthController],
})
export class AppModule {}
