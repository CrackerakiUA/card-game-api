import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
    ApiTags,
} from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(private readonly dataSource: DataSource) {}

    @Get()
    @ApiOperation({ summary: 'Check API and database availability' })
    @ApiOkResponse({ description: 'API and database are available' })
    @ApiServiceUnavailableResponse({ description: 'Database is unavailable' })
    async check() {
        try {
            await this.dataSource.query('SELECT 1');
            return { status: 'ok' };
        } catch {
            throw new ServiceUnavailableException({
                status: 'database unavailable',
            });
        }
    }
}
