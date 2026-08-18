# NestJS REST API — Dự án học

Dự án cá nhân dùng để **học NestJS** và cách xây dựng một REST API theo kiến trúc module hoá.
Repo hiện đang ở giai đoạn khởi tạo: bộ  khung ứng dụng đã dựng xong, các module nghiệp vụ
(`auth`, `user`, `note`) đã được tạo và đăng ký, phần logic sẽ được bổ sung dần theo tiến độ học.

## Mục tiêu học tập

- Hiểu cấu trúc một ứng dụng NestJS: **Module – Controller – Service**
- Nắm cách hoạt động của **Dependency Injection** qua decorator `@Injectable()` và constructor injection
- Xây dựng REST API với các nhóm route: xác thực (`auth`), người dùng (`user`), ghi chú (`note`)
- Làm quen với TypeScript, ESLint, Prettier và testing bằng Jest trong hệ sinh thái Nest

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | NestJS 11 |
| Ngôn ngữ | TypeScript 5 |
| HTTP platform | Express |
| Testing | Jest + Supertest |
| Code style | ESLint + Prettier |

## Cấu trúc thư mục

```
NestJS-RestAPI/
└── nestjs-api-app/
    ├── src/
    │   ├── main.ts            # Điểm khởi động, bootstrap ứng dụng (mặc định port 3000)
    │   ├── app.module.ts      # Module gốc, import AuthModule / UserModule / NoteModule
    │   ├── auth/              # Module xác thực
    │   │   ├── auth.module.ts
    │   │   ├── auth.controller.ts
    │   │   └── auth.service.ts
    │   ├── user/              # Module người dùng
    │   │   └── user.module.ts
    │   └── note/              # Module ghi chú
    │       └── note.module.ts
    ├── test/                  # Test e2e
    └── package.json
```

## Cài đặt & chạy

```bash
cd nestjs-api-app
npm install
```

```bash
npm run start:dev     # chế độ watch, tự reload khi sửa code
npm run start         # chạy thường
npm run build         # build ra thư mục dist/
npm run start:prod    # chạy bản build
```

Ứng dụng chạy tại `http://localhost:3000` (đổi bằng biến môi trường `PORT`).

## Các lệnh khác

```bash
npm run lint          # kiểm tra và tự sửa lỗi lint
npm run format        # format code bằng Prettier
npm test              # chạy unit test
npm run test:e2e      # chạy test e2e
npm run test:cov      # báo cáo độ phủ test
```

## Lộ trình học

- [x] Khởi tạo project, dựng cấu trúc module cơ bản
- [ ] Hoàn thiện `AuthModule`: đăng ký, đăng nhập
- [ ] Kết nối cơ sở dữ liệu và tầng truy xuất dữ liệu
- [ ] Validation request bằng DTO và `ValidationPipe`
- [ ] Bảo vệ route bằng JWT và Guard
- [ ] CRUD đầy đủ cho `user` và `note`
- [ ] Viết unit test và e2e test cho từng module

## Ghi chú

Đây là repo phục vụ mục đích học tập, không dùng cho môi trường production.
