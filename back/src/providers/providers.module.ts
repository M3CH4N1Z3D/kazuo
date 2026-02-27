import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { Provider } from '../Entities/providers.entity';
import { Product } from '../Entities/product.entity';

import { Users } from '../Entities/users.entity';
import { UserRepository } from '../modules/users/users.repository';
import { UsersService } from '../modules/users/users.service';
import { UsersModule } from '../modules/users/users.module';
import { ProvidersRepository } from './providers.repository';
import { ProductModule } from '../modules/product/product.module';
import { ProvidersController } from './providers.contoller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, Product]),
    UsersModule,
    ProductModule,
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService, UsersService, ProvidersRepository],
  exports: [ProvidersService],
})
export class ProvidersModule {}
