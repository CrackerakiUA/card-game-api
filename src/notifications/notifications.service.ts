import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification) private r: Repository<Notification>,
    ) {}
    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        linkUrl?: string;
    }) {
        return this.r.save(
            this.r.create({ ...data, linkUrl: data.linkUrl ?? null }),
        );
    }
    list(userId: string) {
        return this.r.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }
    unreadCount(userId: string) {
        return this.r.countBy({ userId, isRead: false });
    }
    async read(id: string, userId: string) {
        const n = await this.r.findOneBy({ id, userId });
        if (!n) throw new NotFoundException('Notification not found');
        n.isRead = true;
        return this.r.save(n);
    }
    async readAll(userId: string) {
        await this.r.update({ userId, isRead: false }, { isRead: true });
    }
}
