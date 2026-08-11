import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DuelComment } from './duel-comment.entity';
import { Duel } from './duel.entity';
import { DuelResult } from './duel-result.entity';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';
@Module({
    imports: [
        TypeOrmModule.forFeature([Duel, DuelResult, DuelComment]),
        UsersModule,
    ],
    controllers: [DuelsController],
    providers: [DuelsService],
})
export class DuelsModule {}
