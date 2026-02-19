import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUploadRepository } from './file-upload.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../Entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [FileUploadService, FileUploadRepository],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
