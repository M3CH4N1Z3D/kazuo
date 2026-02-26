import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from './product.entity';

@Entity({ name: 'sale_items' })
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
  sale: Sale;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  product: Product;
}
