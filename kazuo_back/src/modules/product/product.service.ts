import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../../Entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { Category } from '../../Entities/category.entity';
import { StoreService } from '../store/store.service';
import { Store } from '../../Entities/store.entity';
import { StoreRepository } from '../store/store.repository';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly storeRepository: StoreRepository,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  private generateBarcode(): string {
    const timestamp = Date.now().toString().slice(-9);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  async create(createProduct: CreateProductDto) {
    const store = await this.storeRepository.findById(createProduct.storeId);

    if (!store) {
      throw new NotFoundException('Bodega no encontrada');
    }

    if (!createProduct.barcode) {
      createProduct.barcode = this.generateBarcode();
    }

    const product = await this.productsRepository.findOne({
      where: { name: createProduct.name },
    });

    if (product) {
      throw new ConflictException('El producto ya existe');
    }
    const newProduct = this.productsRepository.create({
      ...createProduct,
      store: store,
      createdAt: new Date(),
    });

    await this.productsRepository.save(newProduct);
    return { message: 'El producto fue creado exitosamente', newProduct };
  }

  async findAll() {
    const all = await this.productsRepository.find({
      relations: ['category'],
    });
    return all;
  }

  async findOne(id: string) {
    try {
      const product = await this.productsRepository.findOneOrFail({
        where: { id },
        relations: ['store'],
      });
      return product;
    } catch (error) {
      console.error(`Producto con ID ${id} no encontrado`, error);
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    };
  }

  async update(id: string, updateProduct: UpdateProductDto) {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['user'] });
  
    if (!product) {
      throw new NotFoundException('El producto no existe');
    }
  
    if (updateProduct.storeId) {
      const store = await this.storeRepository.findById(updateProduct.storeId);
      if (!store) {
        throw new NotFoundException('Bodega no encontrada');
      }
      product.store = store;
    }

    Object.assign(product, updateProduct);
    product.updatedAt = new Date();
  
    const updatedProduct = await this.productsRepository.save(product);
  
    const companyEmail = product.user.email;
  
    if (companyEmail) {
      try {
        await this.mailService.sendProductNotification(
          companyEmail,
          product.name,
          'modificado',
          'Se han realizado cambios en los detalles del producto.',
        );
      } catch (error) {
        console.error('Error enviando el correo:', error);
      }
    } else {
      console.warn('No se encontró un email para la compañía asociada');
    }
  
    return {
      message: 'Producto actualizado correctamente',
      product: updatedProduct,
    };
  }

  
  async remove(id: string) {
    const deleteProduct = await this.productsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!deleteProduct) throw new NotFoundException('Producto no encontrado');

    if (deleteProduct.user && deleteProduct.user.email) {
      await this.mailService.sendProductNotification(
        deleteProduct.user.email,
        deleteProduct.name,
        'eliminado',
        'El producto ha sido eliminado permanentemente del sistema.',
      );
    }

    await this.productsRepository.remove(deleteProduct);

    return {
      message: `El producto con el ID: ${id} fue eliminado exitosamente`,
    };
  }

  async getProductsByStoreId(storeId: string): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { store: { id: storeId } },
      relations: ['store'],
    });
  }

  async bulkCreate(products: CreateProductDto[]) {
    const createdProducts = await Promise.all(
      products.map(async (product) => {
        const store = await this.storeRepository.findById(product.storeId);
        if (!store) {
          throw new NotFoundException(
            `Bodega con ID ${product.storeId} no encontrada`,
          );
        }

        if (!product.barcode) {
          product.barcode = this.generateBarcode();
        }

        const newProduct = this.productsRepository.create({
          ...product,
          store: { id: product.storeId },
          user: { id: product.userId },
        });

        return await this.productsRepository.save(newProduct);
      }),
    );

    return createdProducts;
  }

  async transferStock(
    sourceStoreId: string,
    targetStoreId: string,
    barcode: string,
    quantity: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sourceStore = await this.storeRepository.findById(sourceStoreId);
      if (!sourceStore) {
        throw new NotFoundException(
          `Bodega origen con ID ${sourceStoreId} no encontrada`,
        );
      }

      const targetStore = await this.storeRepository.findById(targetStoreId);
      if (!targetStore) {
        throw new NotFoundException(
          `Bodega destino con ID ${targetStoreId} no encontrada`,
        );
      }

      const sourceProduct = await queryRunner.manager.findOne(Product, {
        where: { bange: barcode, store: { id: sourceStoreId } },
        relations: ['category', 'user', 'providers'],
      });

      if (!sourceProduct) {
        throw new NotFoundException(
          `Producto con código ${barcode} no encontrado en la bodega origen`,
        );
      }

      if (Number(sourceProduct.quantity) < quantity) {
        throw new ConflictException(
          `Stock insuficiente en la bodega origen`,
        );
      }

      let targetProduct = await queryRunner.manager.findOne(Product, {
        where: { bange: barcode, store: { id: targetStoreId } },
      });

      if (targetProduct) {
        targetProduct.quantity = Number(targetProduct.quantity) + quantity;
        targetProduct.updatedAt = new Date();
        await queryRunner.manager.save(targetProduct);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, store, createdAt, updatedAt, saleItems, ...productData } =
          sourceProduct;
        
        targetProduct = queryRunner.manager.create(Product, {
          ...productData,
          store: targetStore,
          quantity: quantity,
          createdAt: new Date(),
        });
        await queryRunner.manager.save(targetProduct);
      }

      sourceProduct.quantity = Number(sourceProduct.quantity) - quantity;
      sourceProduct.updatedAt = new Date();
      await queryRunner.manager.save(sourceProduct);

      await queryRunner.commitTransaction();

      return {
        message: 'Transferencia de stock realizada exitosamente',
        sourceProduct,
        targetProduct,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async importProducts(buffer: Buffer) {
    const csvData = buffer.toString('utf-8');
    const lines = csvData.split(/\r?\n/);
    const productsToCreate: CreateProductDto[] = [];

    // Headers: name,quantity,unids,maxCapacity,inPrice,bange,outPrice,minStock,storeId,userId,barcode
    if (lines.length < 2) {
      throw new HttpException(
        'El archivo CSV está vacío o faltan encabezados',
        HttpStatus.BAD_REQUEST,
      );
    }

    const headers = lines[0].split(',').map((h) => h.trim());

    // Map of header name to index
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => (headerMap[h] = i));

    // Helper to get value
    const getVal = (row: string[], key: string) => {
      const idx = headerMap[key];
      return idx !== undefined && row[idx] ? row[idx].trim() : null;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row = line.split(',');

      const name = getVal(row, 'name');
      const quantity = getVal(row, 'quantity');
      const unids = getVal(row, 'unids');
      const maxCapacity = getVal(row, 'maxCapacity');
      const inPrice = getVal(row, 'inPrice');
      const bange = getVal(row, 'bange');
      const outPrice = getVal(row, 'outPrice');
      const minStock = getVal(row, 'minStock');
      const storeId = getVal(row, 'storeId');
      const userId = getVal(row, 'userId');
      const barcode = getVal(row, 'barcode');

      if (name && quantity && storeId && userId) {
        productsToCreate.push({
          name,
          quantity: Number(quantity),
          unids: unids || 'unids',
          maxCapacity: Number(maxCapacity) || 0,
          inPrice: Number(inPrice) || 0,
          bange: bange || '',
          outPrice: Number(outPrice) || 0,
          minStock: Number(minStock) || 0,
          storeId,
          userId,
          barcode: barcode || this.generateBarcode(),
        });
      }
    }

    if (productsToCreate.length > 0) {
      const results = [];
      for (const productData of productsToCreate) {
        const existingProduct = await this.productsRepository.findOne({
          where: {
            bange: productData.bange,
            store: { id: productData.storeId },
          },
        });

        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, {
            name: productData.name,
            quantity: productData.quantity,
            unids: productData.unids,
            maxCapacity: productData.maxCapacity,
            inPrice: productData.inPrice,
            outPrice: productData.outPrice,
            minStock: productData.minStock,
          });
          
          if (!existingProduct.barcode) {
             existingProduct.barcode = productData.barcode;
          }

          await this.productsRepository.save(existingProduct);
          results.push({ ...existingProduct, _status: 'updated' });
        } else {
          // Create new product
          const store = await this.storeRepository.findById(productData.storeId);
          if (store) {
            const newProduct = this.productsRepository.create({
              ...productData,
              store: store,
              user: { id: productData.userId },
              createdAt: new Date(),
            });
            await this.productsRepository.save(newProduct);
            results.push({ ...newProduct, _status: 'created' });
          }
        }
      }
      return results;
    } else {
      return { message: 'No se encontraron productos válidos para importar' };
    }
  }
}
