import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  auth0Id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
