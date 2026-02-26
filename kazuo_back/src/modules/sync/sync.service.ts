import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In, DataSource } from 'typeorm';
import { Product } from '../../Entities/product.entity';
import { Sale } from '../../Entities/sale.entity';
import { SaleItem } from '../../Entities/sale-item.entity';
import { Store } from '../../Entities/store.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private dataSource: DataSource,
  ) {}

  async getProducts(storeId: string, lastUpdate?: Date) {
    const where: any = { store: { id: storeId } };
    if (lastUpdate) {
      where.updatedAt = MoreThan(lastUpdate);
    }
    const products = await this.productRepository.find({ where });
    return products.map((product) => ({
      ...product,
      code: product.barcode,
    }));
  }

  async syncSales(salesDto: CreateSaleDto[]) {
    const results = [];
    
    // Process each sale in a transaction to ensure integrity
    for (const saleDto of salesDto) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Check if sale already exists
        const existingSale = await queryRunner.manager.findOne(Sale, {
            where: { posSaleId: saleDto.posSaleId }
        });

        if (existingSale) {
          this.logger.log(`Sale ${saleDto.posSaleId} already exists. Skipping.`);
          results.push({ posSaleId: saleDto.posSaleId, status: 'skipped', message: 'Already exists' });
          await queryRunner.rollbackTransaction();
          continue;
        }

        const store = await queryRunner.manager.findOne(Store, { where: { id: saleDto.storeId } });
        if (!store) {
          throw new Error(`Store ${saleDto.storeId} not found`);
        }

        // Create Sale
        const sale = new Sale();
        sale.posSaleId = saleDto.posSaleId;
        sale.date = new Date(saleDto.date);
        sale.total = saleDto.total;
        sale.paymentMethod = saleDto.paymentMethod;
        sale.store = store;

        const savedSale = await queryRunner.manager.save(Sale, sale);

        // Process Items and Update Inventory
        for (const itemDto of saleDto.items) {
          // Try lookup by Barcode first (robustness), then ID
          let product = await queryRunner.manager.findOne(Product, { where: { barcode: itemDto.productId } });
          
          if (!product) {
             // Fallback to ID check if it looks like a UUID (or just try it)
             try {
                product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId } });
             } catch (e) {
                // Ignore UUID format errors if productId is a barcode
             }
          }

          this.logger.log(`[Sync Debug] Lookup product with identifier: ${itemDto.productId}. Found: ${product ? 'Yes' : 'No'}`);
          
          if (product) {
            this.logger.log(`Processing item: ${itemDto.productId}, current stock: ${product.quantity}, deducting: ${itemDto.quantity}`);
            // Deduct stock
            product.quantity = Number(product.quantity) - itemDto.quantity;
            await queryRunner.manager.save(Product, product);
            this.logger.log(`Updated stock for product ${itemDto.productId}: ${product.quantity}`);
          } else {
            this.logger.warn(`Product ${itemDto.productId} not found during sync. Skipping stock deduction.`);
          }

          const saleItem = new SaleItem();
          saleItem.sale = savedSale;
          saleItem.product = product; // Can be null if product not found (historical data integrity)
          saleItem.quantity = itemDto.quantity;
          saleItem.price = itemDto.price;
          saleItem.subtotal = itemDto.quantity * itemDto.price;

          await queryRunner.manager.save(SaleItem, saleItem);
        }

        await queryRunner.commitTransaction();
        results.push({ posSaleId: saleDto.posSaleId, status: 'success', id: savedSale.id });

      } catch (err) {
        this.logger.error(`Failed to sync sale ${saleDto.posSaleId}: ${err.message}`);
        await queryRunner.rollbackTransaction();
        results.push({ posSaleId: saleDto.posSaleId, status: 'error', message: err.message });
      } finally {
        await queryRunner.release();
      }
    }
    return results;
  }
}
