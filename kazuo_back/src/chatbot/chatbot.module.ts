import { Module } from '@nestjs/common';
import { ChatBotController } from './chatbot.controller';
import { ChatBotService } from './chatbot.service';
import { CompanyService } from '../company/company.service';
import { ProductService } from '../modules/product/product.service';
import { CompanyModule } from '../company/company.module';
import { ProductModule } from '../modules/product/product.module';
import { StoreModule } from '../modules/store/store.module';
import { CategoryModule } from '../modules/category/category.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [CompanyModule, ProductModule, StoreModule, CategoryModule, UsersModule],
  controllers: [ChatBotController],
  providers: [ChatBotService],
})
export class ChatbotModule {}
