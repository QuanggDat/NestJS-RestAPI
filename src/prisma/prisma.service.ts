import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
//service này dùng để kết nối DB
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      //không hardcode connection string, lấy từ .env qua ConfigService
      //url: 'postgresql://postgres:Abc123456789@localhost:5434/testdb'
      adapter: new PrismaPg({
        connectionString: configService.get<string>('DATABASE_URL'),
      }),
    });
    console.log(
      'configService DATABASE_URL : ' +
        configService.get<string>('DATABASE_URL'),
    );
  }

  //Nest gọi hook này khi app đóng -> đóng luôn connection pool tới Postgres
  async onModuleDestroy() {
    await this.$disconnect();
  }

  //dọn sạch dữ liệu trước mỗi lần chạy e2e test
  //xoá notes TRƯỚC users vì notes giữ khoá ngoại userId trỏ tới users
  cleanDb() {
    return this.$transaction([this.note.deleteMany(), this.user.deleteMany()]);
  }
}
