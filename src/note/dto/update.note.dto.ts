import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

//DTO cho việc SỬA note: mọi field đều optional
//client gửi lên field nào thì chỉ sửa field đó (đúng tinh thần của PATCH)
export class UpdateNoteDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  @IsOptional()
  url?: string;
}
