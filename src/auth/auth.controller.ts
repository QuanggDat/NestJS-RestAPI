import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto'; //import cả một "thư mục"

//mọi route trong controller này đều có tiền tố /auth
@Controller('auth')
export class AuthController {
  //auth service được tự động khởi tạo cùng với controller
  constructor(private authService: AuthService) {}

  //các request gửi lên từ client
  //POST: .../auth/register
  @Post('register') //đăng ký user mới
  register(@Body() authDTO: AuthDTO) {
    //kiểu của body phải là một "Data Transfer Object" - DTO
    //giờ controller gọi xuống "service"
    console.log(authDTO);
    return this.authService.register(authDTO);
  }

  //POST: .../auth/login
  @Post('login')
  login(@Body() authDTO: AuthDTO) {
    return this.authService.login(authDTO);
  }
}
//export = "cho phép file khác dùng"
