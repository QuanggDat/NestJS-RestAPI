import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  //JwtModule.register({}) cung cấp JwtService cho AuthService
  imports: [PrismaModule, JwtModule.register({})], //cung cấp PrismaService cho AuthService
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
