import { AuthGuard } from '@nestjs/passport';

//guard "custom": đặt tên riêng thay vì viết AuthGuard('jwt') ở mọi nơi
export class MyJwtGuard extends AuthGuard('jwt') {}
