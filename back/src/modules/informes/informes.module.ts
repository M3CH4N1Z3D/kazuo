import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [InformesController],
  providers: [InformesService],
})
export class InformesModule {}
