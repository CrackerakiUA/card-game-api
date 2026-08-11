import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { User, UserStatus } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async findOrCreate(authId: string, email: string): Promise<User> {
        const existing = await this.usersRepository.findOneBy({ authId });
        if (existing) {
            if (existing.status !== UserStatus.active) {
                throw new ForbiddenException('User profile is not active');
            }
            return existing;
        }
        return this.usersRepository.save(
            this.usersRepository.create({ authId, email }),
        );
    }

    async updateMyProfile(user: User, dto: UpdateMyProfileDto): Promise<User> {
        if (dto.nickname && dto.nickname !== user.nickname) {
            const nickname = dto.nickname.toLowerCase();
            const taken = await this.usersRepository.exists({
                where: [{ nickname }, { slug: nickname }],
            });
            if (taken)
                throw new ConflictException('Nickname is already in use');
            user.nickname = nickname;
            user.slug = nickname;
        }
        Object.assign(user, dto);
        user.updatedAt = new Date();
        return this.usersRepository.save(user);
    }

    async listPublic(
        query: ListUsersQueryDto,
    ): Promise<{ users: User[]; total: number }> {
        const where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = query.q
            ? [
                  {
                      nickname: ILike(`%${query.q}%`),
                      status: UserStatus.active,
                  },
                  {
                      displayName: ILike(`%${query.q}%`),
                      status: UserStatus.active,
                  },
              ]
            : { status: UserStatus.active };
        const [users, total] = await this.usersRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return { users, total };
    }

    async findPublicBySlug(slug: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({
            slug,
            status: UserStatus.active,
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async listAdmin(
        query: ListUsersQueryDto,
    ): Promise<{ users: User[]; total: number }> {
        const [users, total] = await this.usersRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return { users, total };
    }

    async findById(id: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async setRole(id: string, role: User['role']): Promise<User> {
        const user = await this.findById(id);
        user.role = role;
        user.updatedAt = new Date();
        return this.usersRepository.save(user);
    }

    async setStatus(id: string, status: UserStatus): Promise<User> {
        const user = await this.findById(id);
        user.status = status;
        user.updatedAt = new Date();
        return this.usersRepository.save(user);
    }
}
