import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from '../Entities/company.entity';
import { CompanyRepository } from './company.repository';
import { UsersModule } from '../modules/users/users.module';
import { MailModule } from '../mail/mail.module';
import { Store } from '../Entities/store.entity';
import { Product } from '../Entities/product.entity';
import { Provider } from '../Entities/providers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      CompanyRepository,
      Store,
      Product,
      Provider,
    ]),
    UsersModule,
    MailModule,
  ],
  providers: [CompanyService, CompanyRepository],
  controllers: [CompanyController],
  exports: [CompanyRepository, CompanyService],
})
export class CompanyModule {}
