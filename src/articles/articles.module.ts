import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Article } from './article.entity';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
@Module({
    imports: [TypeOrmModule.forFeature([Article]), UsersModule],
    controllers: [ArticlesController],
    providers: [ArticlesService],
})
export class ArticlesModule {}
