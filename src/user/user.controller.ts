import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MyJwtGuard } from '../auth/guard';

//mọi route trong controller này đều có tiền tố /users
@Controller('users')
export class UserController {
  //path : .../users/me
  //@UseGuards(AuthGuard('jwt'))
  @UseGuards(MyJwtGuard)
  @Get('me')
  me(@Req() request: Request) {
    //request.user đến từ đâu ? -> chính là giá trị validate() trả về
    //console.log(request.user)
    return request.user;
  }
}
