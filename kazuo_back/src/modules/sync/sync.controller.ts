import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { SyncService } from './sync.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('products/:storeId')
  async getProducts(
    @Param('storeId') storeId: string,
    @Query('last_update') lastUpdate?: string,
  ) {
    const date = lastUpdate ? new Date(lastUpdate) : undefined;
    return this.syncService.getProducts(storeId, date);
  }

  @Post('sales')
  async syncSales(@Body() sales: CreateSaleDto[]) {
    return this.syncService.syncSales(sales);
  }
}
