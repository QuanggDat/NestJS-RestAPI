import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  //auth service is automatically created when initializing the controller
  constructor(private authService: AuthService) {}
}
//export = "make public"
