import { Injectable } from '@nestjs/common';

@Injectable() //this is "Dependency Injection"
export class AuthService {
  register() {
    return { message: 'register' };
  }

  login() {
    return { message: 'login' };
  }
}
