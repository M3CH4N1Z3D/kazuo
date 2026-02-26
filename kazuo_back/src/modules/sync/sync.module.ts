import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { Product } from '../../Entities/product.entity';
import { Sale } from '../../Entities/sale.entity';
import { SaleItem } from '../../Entities/sale-item.entity';
import { Store } from '../../Entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Sale, SaleItem, Store]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
