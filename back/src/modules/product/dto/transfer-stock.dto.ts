import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferStockDto {
  @ApiProperty({
    description: 'ID de la bodega origen',
    example: 'uuid-source-store',
  })
  @IsNotEmpty()
  @IsUUID()
  sourceStoreId: string;

  @ApiProperty({
    description: 'ID de la bodega destino',
    example: 'uuid-target-store',
  })
  @IsNotEmpty()
  @IsUUID()
  targetStoreId: string;

  @ApiProperty({
    description: 'Código de barras del producto a transferir',
    example: 'WH-001',
  })
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @ApiProperty({
    description: 'Cantidad a transferir',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
