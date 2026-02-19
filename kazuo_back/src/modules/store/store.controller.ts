import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
  UseGuards,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Request } from 'express';
import { Role } from '../../decorators/roles.enum';
import { Roles } from '../../decorators/roles.decorators';
import { AuthGuard } from '../auth/guards/auth-guard.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Users } from '../../Entities/users.entity';
import { Store } from '../../Entities/store.entity';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('bodega')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Crear una nueva tienda (bodega)' })
  @ApiCreatedResponse({
    description: 'La tienda (bodega) fue creada exitosamente.',
    type: Store,
  })
  @ApiConflictResponse({
    description: 'La tienda ya existe.',
  })
  @ApiBadRequestResponse({
    description: 'La solicitud tiene datos inválidos.',
  })
  async create(@Body() createStore: CreateStoreDto, @Req() request: Request) {
    return this.storeService.create(createStore, request);
  }

  @Get('user/:userId')
  async getStoresByUserId(@Param('userId') userId: string) {
    return this.storeService.findByUserId(userId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  findAll() {
    return this.storeService.findAll();
  }

  @Get('AllStoresUser/:userId')
  async findAllStores(@Param('userId') userId: string) {
    return this.storeService.findAllStores(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.findOne(id);
  }

  @Get('infoStore/:id')
  async getInfoBodega(@Param('id', ParseUUIDPipe) id: string) {
    const storeData = await this.storeService.getInfoBodega(id);

    const pdfBuffer = await this.storeService.generarPdf(storeData);

    await this.storeService.enviarCorreoElectronico(pdfBuffer);

    return { message: 'Informe generado y enviado por correo electrónico.' };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStore: UpdateStoreDto,
    @Req() request: any,
  ) {
    if (
      !request.user ||
      !request.user.roles ||
      !request.user.roles.includes(Role.Admin)
    ) {
      throw new ForbiddenException('No tienes permisos para modificar bodegas');
    }
    return this.storeService.update(id, updateStore);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: any) {
    if (
      !request.user ||
      !request.user.roles ||
      !request.user.roles.includes(Role.Admin)
    ) {
      throw new ForbiddenException('No tienes permisos para eliminar bodegas');
    }
    return this.storeService.remove(id);
  }
}
