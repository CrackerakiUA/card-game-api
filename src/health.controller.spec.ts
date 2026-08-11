import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
    let healthController: HealthController;
    const dataSource = { query: jest.fn() };

    beforeEach(async () => {
        dataSource.query.mockResolvedValue(undefined);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [{ provide: DataSource, useValue: dataSource }],
        }).compile();

        healthController = module.get<HealthController>(HealthController);
    });

    it('returns an OK status when PostgreSQL is available', async () => {
        await expect(healthController.check()).resolves.toEqual({
            status: 'ok',
        });
        expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });
});
