import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSaleItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  posSaleId: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsOptional()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
