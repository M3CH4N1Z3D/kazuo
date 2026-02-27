import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from './store.entity';
import { SaleItem } from './sale-item.entity';

@Entity({ name: 'sales' })
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  posSaleId: string; // ID from the POS system to prevent duplicates

  @ManyToOne(() => Store, (store) => store.sales, { onDelete: 'CASCADE' })
  store: Store;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];
}
