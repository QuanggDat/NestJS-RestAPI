# NestJS RestAPI

Back-end REST API viết bằng NestJS + Prisma + PostgreSQL, phục vụ cho front-end
Next.js (`NextJS-Blogs-Management`).

API gồm 2 phần: **xác thực người dùng** (bảng `users`) và **quản lý blog**
(bảng `notes`).

## Kiến trúc

| Thành phần | Đường dẫn | Port |
|---|---|---|
| Back-end (NestJS)   | `NestJS-RestAPI`          | **3000** |
| Front-end (Next.js) | `NextJS-Blogs-Management` | **3001** |
| Database dev (Postgres) | docker `dev-database`  | 5434 |
| Database test (Postgres) | docker `test-database` | 5435 |

Back-end đã bật CORS cho `http://localhost:3001` trong [`src/main.ts`](src/main.ts)
để trình duyệt cho phép front-end gọi API.

## Cách chạy

**1. Bật database** (Docker phải đang chạy):
```bash
npm run db:dev:create      # tạo & bật container dev-database
npm run prisma:dev:deploy  # chạy migration, tạo bảng users + notes
```

**2. Cài thư viện và bật server**:
```bash
npm install
npm run start:dev          # watch mode, tự restart khi sửa code
```

Server chạy tại http://localhost:3000

> Lần đầu clone project cần chạy thêm `npx prisma generate` để sinh Prisma Client
> vào thư mục `src/generated/prisma`.

**Lệnh hữu ích khác**:
```bash
npm run db:dev:restart     # xoá sạch DB dev, tạo lại từ đầu + chạy migration
npm run start:prod         # chạy bản build production
npm run test:e2e           # chạy e2e test (tự dựng lại test-database)
```

## Danh sách API

### Xác thực — không cần token

| Chức năng | Method | Endpoint | Body |
|---|---|---|---|
| Đăng ký | POST | `/auth/register` | `{ email, password }` |
| Đăng nhập | POST | `/auth/login` | `{ email, password }` |

- `/auth/register` trả về `{ id, email, createdAt }`. Email trùng thì trả **403**
  `Email already exists`.
- `/auth/login` trả về `{ accessToken }`. Sai email/mật khẩu trả **403**.
- `password` phải có **tối thiểu 6 ký tự** (`@MinLength(6)`), sai thì trả **400**.

### Người dùng & Blog — bắt buộc gửi token

Các route bên dưới đều có `@UseGuards(MyJwtGuard)`, phải gửi kèm header:

```
Authorization: Bearer <accessToken>
```

| Chức năng | Method | Endpoint | Ghi chú |
|---|---|---|---|
| Thông tin user đang đăng nhập | GET | `/users/me` | |
| Danh sách blog | GET | `/notes` | chỉ trả blog của chính user đó |
| Chi tiết blog | GET | `/notes/:id` | |
| Tạo blog | POST | `/notes` | `userId` tự gắn từ token |
| Sửa blog | PATCH | `/notes/:id` | dùng **PATCH**, không phải PUT |
| Xoá blog | DELETE | `/notes/:id` | trả **204 No Content** |

Thiếu hoặc sai token → **401 Unauthorized**.
Sửa/xoá blog của người khác → **403 Access to resource denied**.

## Cấu trúc dữ liệu

Xem chi tiết tại [`prisma/schema.prisma`](prisma/schema.prisma).

**Bảng `users`**

| Field | Kiểu | Ghi chú |
|---|---|---|
| id | Int | khoá chính, tự tăng |
| email | String | **unique** |
| hashedPassword | String | mã hoá bằng argon2, không bao giờ trả về client |
| firstName, lastName | String? | có thể để trống |
| createdAt, updatedAt | DateTime | |

**Bảng `notes`**

| Field | Kiểu | Ghi chú |
|---|---|---|
| id | Int | khoá chính, tự tăng |
| title | String | bắt buộc |
| description | String | bắt buộc |
| url | String | bắt buộc, phải đúng định dạng URL (`@IsUrl`) |
| userId | Int | khoá ngoại trỏ tới `users.id` |
| createdAt, updatedAt | DateTime | |

Quan hệ: một `user` viết được nhiều `note` (1–n).

> Khi tạo/sửa blog, `url` phải dạng `https://example.com`. Nhập chuỗi thường
> sẽ bị `ValidationPipe` trả về lỗi **400**.

## Cấu trúc thư mục

```
src/
├── main.ts                     # điểm khởi động: bật CORS + ValidationPipe
├── app.module.ts               # module gốc, gom tất cả module con
├── auth/                       # đăng ký / đăng nhập
│   ├── auth.controller.ts      # nhận request POST /auth/*
│   ├── auth.service.ts         # mã hoá mật khẩu, kiểm tra login, ký JWT
│   ├── dto/auth.dto.ts         # ràng buộc dữ liệu client gửi lên
│   ├── strategy/jwt.strategy.ts# đọc & kiểm tra token, gắn user vào request
│   ├── guard/myjwt.guard.ts    # chặn request không có token hợp lệ
│   └── decorator/              # @GetUser() lấy user ra khỏi request
├── user/
│   └── user.controller.ts      # GET /users/me
├── note/                       # CRUD blog
│   ├── note.controller.ts      # định tuyến GET/POST/PATCH/DELETE /notes
│   ├── note.service.ts         # xử lý nghiệp vụ + kiểm tra quyền sở hữu
│   └── dto/                    # InsertNoteDTO, UpdateNoteDTO
├── prisma/
│   └── prisma.service.ts       # kết nối PostgreSQL
└── generated/prisma/           # Prisma Client tự sinh (không sửa tay)

prisma/
├── schema.prisma               # định nghĩa bảng users, notes
└── migrations/                 # lịch sử thay đổi cấu trúc DB
```

## Luồng xử lý một request

```
Client → Controller → Service → PrismaService → PostgreSQL
             ↑
          Guard + Strategy (kiểm tra token, với route cần đăng nhập)
```

- **Controller**: nhận request, không chứa logic nghiệp vụ.
- **Service**: xử lý nghiệp vụ (mã hoá mật khẩu, kiểm tra quyền, truy vấn DB).
- **DTO**: mô tả dữ liệu client được phép gửi lên. `ValidationPipe` với
  `whitelist: true` sẽ **tự loại bỏ** field không khai báo trong DTO.
- **Guard + Strategy**: đọc token từ header, giải mã, tìm user trong DB rồi gắn
  vào `request.user`.

## Biến môi trường

File [`.env`](.env) (môi trường dev):

```
DATABASE_URL="postgresql://postgres:Abc123456789@localhost:5434/testdb?schema=public"
JWT_SECRET="..."
```

File `.env.test` dùng cho e2e test, trỏ sang `test-database` ở port 5435 nên
chạy test **không ảnh hưởng** dữ liệu dev.

## Lưu ý quan trọng

1. **Token chỉ sống 10 phút** (`expiresIn: '10m'` trong
   [`auth.service.ts`](src/auth/auth.service.ts)). Hết hạn phải đăng nhập lại.
2. **Sửa blog dùng PATCH**, không phải PUT — front-end phải gọi đúng method.
3. **Đổi code trong `main.ts` phải khởi động lại server** thì CORS mới có hiệu lực.
4. Mỗi user chỉ thấy và thao tác được blog của chính mình.
