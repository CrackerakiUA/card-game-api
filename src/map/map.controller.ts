import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../users/supabase-auth.guard';
import { SupabaseAuthGuard } from '../users/supabase-auth.guard';
import { UsersService } from '../users/users.service';
import {
    CreateMapMarkerDto,
    MapMarkersQueryDto,
    UpdateMapMarkerDto,
} from './dto/map-marker.dto';
import { MapMarkerResponseDto } from './dto/map-marker-response.dto';
import { MapService } from './map.service';
@ApiTags('Map')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('map/markers')
export class MapController {
    constructor(
        private readonly mapService: MapService,
        private readonly usersService: UsersService,
    ) {}
    @Get()
    @ApiOperation({ summary: 'Get active nearby player markers' })
    @ApiOkResponse({ type: [MapMarkerResponseDto] })
    async list(@Query() query: MapMarkersQueryDto) {
        return this.mapService.listActive(query);
    }
    @Post()
    @ApiOperation({ summary: 'Create a player marker' })
    @ApiCreatedResponse({ type: MapMarkerResponseDto })
    async create(
        @Req() request: AuthenticatedRequest,
        @Body() dto: CreateMapMarkerDto,
    ) {
        return this.mapService.create(await this.currentUserId(request), dto);
    }
    @Patch(':id')
    @ApiOperation({ summary: 'Update or hide an owned marker' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiOkResponse({ type: MapMarkerResponseDto })
    async update(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: UpdateMapMarkerDto,
    ) {
        return this.mapService.update(
            await this.currentUserId(request),
            id,
            dto,
        );
    }
    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Remove an owned marker' })
    @ApiParam({ name: 'id', format: 'uuid' })
    @ApiNoContentResponse()
    async remove(
        @Req() request: AuthenticatedRequest,
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<void> {
        await this.mapService.remove(await this.currentUserId(request), id);
    }
    private async currentUserId(
        request: AuthenticatedRequest,
    ): Promise<string> {
        const user = await this.usersService.findOrCreate(
            request.authUser!.authId,
            request.authUser!.email,
        );
        return user.id;
    }
}
