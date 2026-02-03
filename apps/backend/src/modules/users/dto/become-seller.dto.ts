import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class BecomeSellerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  storeName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  storeDescription?: string;
}
