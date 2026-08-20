//tạo một database riêng để test !
//mỗi lần chạy test, dọn sạch dữ liệu
//phải gọi request giống như khi làm với Postman
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDTO } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

const TEST_PORT = 3001;

describe('App EndToEnd tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  //beforeAll chạy MỘT lần, trước tất cả các test trong file này
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    //dựng app y như trong main.ts để test đúng hành vi thật
    app = appModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    //phải listen thật vì pactum gọi qua HTTP như Postman
    await app.listen(TEST_PORT);

    //lấy PrismaService từ container của Nest để dọn dữ liệu
    prismaService = app.get(PrismaService);
    await prismaService.cleanDb();

    //đặt sẵn base URL, các test sau chỉ cần viết đường dẫn ngắn
    pactum.request.setBaseUrl(`http://localhost:${TEST_PORT}`);
  });

  //afterAll chạy sau khi tất cả test kết thúc
  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const authDTO: AuthDTO = {
      email: 'test@gmail.com',
      password: '123456',
    };

    describe('Register', () => {
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({ password: authDTO.password })
          .expectStatus(400);
      });

      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({ email: authDTO.email })
          .expectStatus(400);
      });

      it('should throw error if body is empty', () => {
        return pactum.spec().post('/auth/register').expectStatus(400);
      });

      it('should register a new user', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDTO)
          .expectStatus(201)
          .expectBodyContains(authDTO.email);
      });

      it('should throw error if email already exists', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(authDTO)
          .expectStatus(403);
      });
    });

    describe('Login', () => {
      it('should throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: authDTO.password })
          .expectStatus(400);
      });

      it('should throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: authDTO.email })
          .expectStatus(400);
      });

      it('should throw error if user not found', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: 'notfound@gmail.com', password: '123456' })
          .expectStatus(403);
      });

      it('should throw error if password is incorrect', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: authDTO.email, password: 'wrongPassword' })
          .expectStatus(403);
      });

      it('should login and return accessToken', () => {
        return (
          pactum
            .spec()
            .post('/auth/login')
            .withBody(authDTO)
            .expectStatus(200)
            .expectBodyContains('accessToken')
            //lưu accessToken lại để các test sau dùng qua $S{userAccessToken}
            .stores('userAccessToken', 'accessToken')
        );
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should throw error if no accessToken', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });

      it('should throw error if accessToken is invalid', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer invalid.token.here' })
          .expectStatus(401);
      });

      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectBodyContains('test@gmail.com');
      });
    });
  });
});
