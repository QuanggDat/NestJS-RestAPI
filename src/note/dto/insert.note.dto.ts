import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

//DTO cho việc TẠO note mới: mọi field đều bắt buộc
//id, userId, createdAt, updatedAt do hệ thống tự sinh nên không nằm ở đây
export class InsertNoteDTO {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUrl()
  @IsNotEmpty()
  url!: string;
}
