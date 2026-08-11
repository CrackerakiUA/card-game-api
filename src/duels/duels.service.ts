import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Duel, DuelResultStatus, DuelStatus } from './duel.entity';
import { DeclaredResult, DuelResult, DuelRole } from './duel-result.entity';
import { DuelComment } from './duel-comment.entity';
@Injectable()
export class DuelsService {
    constructor(
        @InjectRepository(Duel) private duels: Repository<Duel>,
        @InjectRepository(DuelResult) private results: Repository<DuelResult>,
        @InjectRepository(DuelComment)
        private comments: Repository<DuelComment>,
    ) {}
    async challenge(userId: string, opponentUserId: string, message?: string) {
        if (userId === opponentUserId)
            throw new ConflictException('Cannot challenge yourself');
        return this.duels.save(
            this.duels.create({
                challengerUserId: userId,
                opponentUserId,
                message: message ?? null,
            }),
        );
    }
    async list(userId: string) {
        return this.duels.find({
            where: [{ challengerUserId: userId }, { opponentUserId: userId }],
            order: { createdAt: 'DESC' },
        });
    }
    async get(id: string, userId: string) {
        const d = await this.duels.findOneBy({ id });
        if (!d) throw new NotFoundException('Duel not found');
        if (d.challengerUserId !== userId && d.opponentUserId !== userId)
            throw new ForbiddenException();
        return d;
    }
    async respond(id: string, userId: string, response: 'accept' | 'decline') {
        const d = await this.get(id, userId);
        if (d.opponentUserId !== userId || d.status !== DuelStatus.pending)
            throw new ConflictException('Duel cannot be responded to');
        d.status =
            response === 'accept' ? DuelStatus.inProgress : DuelStatus.declined;
        d.respondedAt = new Date();
        if (response === 'accept') d.startedAt = new Date();
        return this.duels.save(d);
    }
    async submit(id: string, userId: string, declaredResult: DeclaredResult) {
        const d = await this.get(id, userId);
        if (
            d.status !== DuelStatus.inProgress &&
            d.status !== DuelStatus.waitingPlayerResults
        )
            throw new ConflictException('Duel is not awaiting results');
        const role =
            d.challengerUserId === userId
                ? DuelRole.challenger
                : DuelRole.opponent;
        if (await this.results.exists({ where: { duelId: id, userId } }))
            throw new ConflictException('Result already submitted');
        await this.results.save(
            this.results.create({
                duelId: id,
                userId,
                roleInDuel: role,
                declaredResult,
            }),
        );
        const rs = await this.results.findBy({ duelId: id });
        if (rs.length < 2) {
            d.status = DuelStatus.waitingPlayerResults;
            return this.duels.save(d);
        }
        const a = rs.find((x) => x.roleInDuel === DuelRole.challenger)!;
        const b = rs.find((x) => x.roleInDuel === DuelRole.opponent)!;
        d.completedAt = new Date();
        if (
            (a.declaredResult === DeclaredResult.win &&
                b.declaredResult === DeclaredResult.loss) ||
            (a.declaredResult === DeclaredResult.loss &&
                b.declaredResult === DeclaredResult.win) ||
            (a.declaredResult === DeclaredResult.draw &&
                b.declaredResult === DeclaredResult.draw)
        ) {
            d.status = DuelStatus.completed;
            d.resultStatus = DuelResultStatus.agreed;
            d.winnerUserId =
                a.declaredResult === DeclaredResult.win
                    ? d.challengerUserId
                    : b.declaredResult === DeclaredResult.win
                      ? d.opponentUserId
                      : null;
        } else {
            d.status = DuelStatus.undetermined;
            d.resultStatus = DuelResultStatus.undetermined;
        }
        return this.duels.save(d);
    }
    async comment(id: string, userId: string, comment: string) {
        const d = await this.get(id, userId);
        if (![DuelStatus.completed, DuelStatus.undetermined].includes(d.status))
            throw new ConflictException(
                'Comments are available after completion',
            );
        return this.comments.save(
            this.comments.create({ duelId: id, userId, comment }),
        );
    }
}
