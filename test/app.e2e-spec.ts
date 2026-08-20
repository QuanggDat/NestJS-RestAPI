//tạo một database riêng để test !
//mỗi lần chạy test, dọn sạch dữ liệu
//phải gọi request giống như khi làm với Postman
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { AuthDTO } from '../src/auth/dto';
import { InsertNoteDTO, UpdateNoteDTO } from '../src/note/dto';
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

  describe('Note', () => {
    const insertNoteDTO: InsertNoteDTO = {
      title: 'Note dau tien',
      description: 'Mo ta cua note dau tien',
      url: 'https://docs.nestjs.com',
    };

    //mọi route /notes đều nằm sau MyJwtGuard nên phải có token
    describe('Get empty notes', () => {
      it('should throw error if no accessToken', () => {
        return pactum.spec().get('/notes').expectStatus(401);
      });

      it('should get empty notes at first', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Insert note', () => {
      it('should throw error if no accessToken', () => {
        return pactum
          .spec()
          .post('/notes')
          .withBody(insertNoteDTO)
          .expectStatus(401);
      });

      it('should throw error if title is empty', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody({
            description: insertNoteDTO.description,
            url: insertNoteDTO.url,
          })
          .expectStatus(400);
      });

      it('should throw error if url is not a valid URL', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody({ ...insertNoteDTO, url: 'khong-phai-url' })
          .expectStatus(400);
      });

      it('should insert a new note', () => {
        return (
          pactum
            .spec()
            .post('/notes')
            .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
            .withBody(insertNoteDTO)
            .expectStatus(201)
            .expectBodyContains(insertNoteDTO.title)
            //lưu id lại để các test sau dùng qua $S{noteId}
            .stores('noteId', 'id')
        );
      });
    });

    describe('Get notes', () => {
      it('should get notes with 1 item', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get note by id', () => {
      it('should throw error if id is not a number', () => {
        return pactum
          .spec()
          .get('/notes/khong-phai-so')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(400);
      });

      it('should throw error if note does not exist', () => {
        return pactum
          .spec()
          .get('/notes/999999')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(404);
      });

      it('should get note by id', () => {
        return pactum
          .spec()
          .get('/notes/$S{noteId}')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectBodyContains(insertNoteDTO.title);
      });
    });

    describe('Update note by id', () => {
      const updateNoteDTO: UpdateNoteDTO = {
        title: 'Tieu de da duoc sua',
        description: 'Mo ta da duoc sua',
      };

      it('should throw error if no accessToken', () => {
        return pactum
          .spec()
          .patch('/notes/$S{noteId}')
          .withBody(updateNoteDTO)
          .expectStatus(401);
      });

      it('should throw error if note does not exist', () => {
        return pactum
          .spec()
          .patch('/notes/999999')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .withBody(updateNoteDTO)
          .expectStatus(404);
      });

      it('should update note by id', () => {
        return (
          pactum
            .spec()
            .patch('/notes/$S{noteId}')
            .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
            .withBody(updateNoteDTO)
            .expectStatus(200)
            .expectBodyContains(updateNoteDTO.title)
            .expectBodyContains(updateNoteDTO.description)
            //url không gửi lên nên phải giữ nguyên giá trị cũ
            .expectBodyContains(insertNoteDTO.url)
        );
      });
    });

    describe('Delete note by id', () => {
      it('should throw error if no accessToken', () => {
        return pactum.spec().delete('/notes/$S{noteId}').expectStatus(401);
      });

      it('should throw error if note does not exist', () => {
        return pactum
          .spec()
          .delete('/notes/999999')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(404);
      });

      it('should delete note by id', () => {
        return pactum
          .spec()
          .delete('/notes/$S{noteId}')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(204);
      });

      it('should get empty notes after deleting', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({ Authorization: 'Bearer $S{userAccessToken}' })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
