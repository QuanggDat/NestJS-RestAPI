import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], //các module khác có thể dùng PrismaService
})
export class PrismaModule {}
