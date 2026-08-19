import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDTO } from './dto';

@Injectable() //đây là "Dependency Injection" - tiêm phụ thuộc
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async register(authDTO: AuthDTO) {
    //mã hoá mật khẩu thành hashedPassword
    const hashedPassword = await argon.hash(authDTO.password);
    try {
      //thêm dữ liệu vào database
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashedPassword,
          firstName: '',
          lastName: '',
        },
        //chỉ lấy về id, email, createdAt (không trả hashedPassword cho client)
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      //P2002 = vi phạm ràng buộc unique (email đã tồn tại)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
    //nên thêm ràng buộc "unique" cho bảng user
  }

  async login(authDTO: AuthDTO) {
    //tìm user theo email được gửi lên
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    //so sánh mật khẩu gửi lên với hash đã lưu trong DB
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new ForbiddenException('Incorrect password');
    }
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
