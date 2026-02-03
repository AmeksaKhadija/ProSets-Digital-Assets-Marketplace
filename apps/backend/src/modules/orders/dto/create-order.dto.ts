import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  assetIds: string[];
}
