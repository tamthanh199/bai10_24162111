# Bài 10 - JWT với Nimbus JOSE+JWT - 24162111

## 1. Tạo database

Mở SQL Server Management Studio và chạy file:

```text
database/setup.sql
```

Hoặc chạy trực tiếp:

```sql
IF DB_ID('jwt_nimbus_24162111') IS NULL
BEGIN
    CREATE DATABASE jwt_nimbus_24162111;
END
GO
```

Bảng `users` được Hibernate tạo tự động khi ứng dụng chạy.

---

## 2. Cấu hình `.env`

Copy:

```text
.env.example
```

thành:

```text
.env
```

Sau đó điền mật khẩu SQL Server và tạo khóa JWT riêng:

```properties
DB_PASSWORD=MAT_KHAU_SA_CUA_BAN
JWT_SECRET=KHOA_NGAU_NHIEN_CUA_BAN_TOI_THIEU_32_BYTE
```

Có thể tạo khóa ngẫu nhiên bằng PowerShell trên Windows:

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy kết quả của dòng cuối vào `JWT_SECRET` trong `.env`; không dùng nguyên chuỗi minh họa ở trên.

Mẫu đầy đủ:

```properties
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=jwt_nimbus_24162111;encrypt=false;trustServerCertificate=true;sslProtocol=TLSv1.2;characterEncoding=UTF-8
DB_USERNAME=sa
DB_PASSWORD=YOUR_SA_PASSWORD
DDL_AUTO=update
SHOW_SQL=true
SERVER_PORT=8094
JWT_SECRET=<KHOA_NGAU_NHIEN_VUA_TAO>
JWT_EXPIRATION=3600000
```

`JWT_SECRET` cần tối thiểu 32 byte để dùng HS256. Nếu để trống, ứng dụng không thể cấp JWT.

File `.env` đã có trong `.gitignore`, không upload mật khẩu SQL Server/secret thật lên GitHub.

---

## 3. Chạy project trong STS

1. `File -> Import -> Existing Maven Projects`.
2. Chọn thư mục `bai10_24162111`.
3. Đợi Maven tải dependency.
4. Chạy `JwtNimbusApplication.java` bằng `Run As -> Spring Boot App`.
5. Mặc định ứng dụng chạy tại:

```text
http://localhost:8094
```

Trang đăng nhập/AJAX:

```text
http://localhost:8094/login
```

Trang profile gọi API có JWT:

```text
http://localhost:8094/profile
```

---

## 4. API cần test

### 4.1 Đăng ký

```http
POST /auth/signup
Content-Type: application/json
```

```json
{
  "fullName": "Đoàn Thành Tâm",
  "email": "tam24162111@gmail.com",
  "password": "123456"
}
```

### 4.2 Đăng nhập và sinh JWT

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "tam24162111@gmail.com",
  "password": "123456"
}
```

Response mẫu:

```json
{
  "token": "eyJ...",
  "expiresIn": 3600000
}
```

### 4.3 Lấy user đang đăng nhập

```http
GET /users/me
Authorization: Bearer <token>
```

### 4.4 Lấy tất cả user

```http
GET /users
Authorization: Bearer <token>
```

Không có JWT hoặc JWT sai/hết hạn sẽ nhận `401 Unauthorized`.

---

## 5. Test nhanh bằng Postman

Import file:

```text
postman/Bai10_JWT_Nimbus.postman_collection.json
```

Chạy lần lượt:

1. `1. Signup`
2. `2. Login - create JWT`
3. `3. Get current user`
4. `4. Get all users`

Request Login có script tự lưu token vào collection variable `token`, nên hai request cuối dùng Bearer Token tự động.

---

