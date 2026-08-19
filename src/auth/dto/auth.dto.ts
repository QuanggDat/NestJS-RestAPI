import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

//DTO = "Data Transfer Object": mô tả cấu trúc dữ liệu client gửi lên
export class AuthDTO {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
