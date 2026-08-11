import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { Card, CardStatus } from './card.entity';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';

@Injectable()
export class CardsService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(Card)
        private readonly cardsRepository: Repository<Card>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {}

    async listMine(userId: string): Promise<{ cards: Card[]; total: number }> {
        const [cards, total] = await this.cardsRepository.findAndCount({
            where: {
                currentOwnerUserId: userId,
                status: CardStatus.registered,
            },
            order: { registeredAt: 'DESC' },
        });
        return { cards, total };
    }

    async listAll(): Promise<{ cards: Card[]; total: number }> {
        const [cards, total] = await this.cardsRepository.findAndCount({
            order: { createdAt: 'DESC' },
        });
        return { cards, total };
    }

    async findById(id: string): Promise<Card> {
        const card = await this.cardsRepository.findOneBy({ id });
        if (!card) throw new NotFoundException('Card not found');
        return card;
    }

    async register(userId: string, cardIdentifier: string): Promise<Card> {
        return this.dataSource.transaction(async (manager) => {
            const card = await manager
                .getRepository(Card)
                .createQueryBuilder('card')
                .setLock('pessimistic_write')
                .where('card.card_identifier = :cardIdentifier', {
                    cardIdentifier,
                })
                .getOne();
            if (!card) throw new NotFoundException('Card not found');
            if (card.status !== CardStatus.available)
                throw new ConflictException(
                    'Card is not available for registration',
                );
            card.status = CardStatus.registered;
            card.currentOwnerUserId = userId;
            card.registeredAt = new Date();
            card.updatedAt = new Date();
            return manager.getRepository(Card).save(card);
        });
    }

    async create(dto: CreateCardDto): Promise<Card> {
        await this.ensureProduct(dto.productId);
        await this.ensureIdentifierAvailable(dto.cardIdentifier);
        return this.cardsRepository.save(
            this.cardsRepository.create({
                ...dto,
                cardIdentifier: dto.cardIdentifier.toUpperCase(),
            }),
        );
    }

    async update(id: string, dto: UpdateCardDto): Promise<Card> {
        const card = await this.findById(id);
        if (dto.productId && dto.productId !== card.productId)
            await this.ensureProduct(dto.productId);
        if (
            dto.cardIdentifier &&
            dto.cardIdentifier.toUpperCase() !== card.cardIdentifier
        )
            await this.ensureIdentifierAvailable(dto.cardIdentifier, id);
        Object.assign(card, dto, {
            cardIdentifier:
                dto.cardIdentifier?.toUpperCase() ?? card.cardIdentifier,
            updatedAt: new Date(),
        });
        return this.cardsRepository.save(card);
    }

    async archive(id: string): Promise<void> {
        const card = await this.findById(id);
        card.status = CardStatus.archived;
        card.updatedAt = new Date();
        await this.cardsRepository.save(card);
    }

    private async ensureProduct(productId: string): Promise<void> {
        if (
            !(await this.productsRepository.exists({
                where: { id: productId },
            }))
        )
            throw new NotFoundException('Product not found');
    }

    private async ensureIdentifierAvailable(
        cardIdentifier: string,
        id?: string,
    ): Promise<void> {
        const existing = await this.cardsRepository.findOneBy({
            cardIdentifier: cardIdentifier.toUpperCase(),
        });
        if (existing && existing.id !== id)
            throw new ConflictException('Card identifier is already in use');
    }
}
