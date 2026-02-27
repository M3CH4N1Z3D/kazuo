import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadRepository {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!this.bucketName || !region || !accessKeyId || !secretAccessKey) {
      console.warn('AWS S3 credentials not fully configured');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ secure_url: string }> {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    const key = `uploads/${uniqueSuffix}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // ACL: 'public-read' // Uncomment if you want public read access and the bucket allows it
        }),
      );

      // Construct URL (assuming public access or standard S3 structure)
      const region = this.configService.get<string>('AWS_REGION');
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      return { secure_url: url };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Error uploading file to S3');
    }
  }
}
