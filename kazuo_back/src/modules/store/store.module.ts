import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../../Entities/store.entity';
import { Category } from '../../Entities/category.entity';
import { CompanyModule } from '../../company/company.module';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category]), CompanyModule, MailModule],
  controllers: [StoreController],
  providers: [StoreService],
  exports:[StoreService],
})
export class StoreModule {}
