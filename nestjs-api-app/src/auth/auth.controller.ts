import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

//all routes in this controller are prefixed with /auth
@Controller('auth')
export class AuthController {
  //auth service is automatically created when initializing the controller
  constructor(private authService: AuthService) {}

  //POST: .../auth/register
  @Post('register') //register a new user
  register() {
    return this.authService.register();
  }

  //POST: .../auth/login
  @Post('login')
  login() {
    return this.authService.login();
  }
}
//export = "make public"
