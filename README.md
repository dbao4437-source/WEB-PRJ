# 🎓 HSA Education - Hệ Thống Quản Lý & Đặt Lớp Gia Sư

> **Bài tập lớn môn Công nghệ Web Fullstack · Nhóm 3-4 SV Học viện Công nghệ Bưu chính Viễn thông (PTIT)**

---

## 👥 Phân công nhiệm vụ các thành viên

| Thành viên | Phụ trách | Chi tiết chức năng |
| :--- | :--- | :--- |
| **Người A (Trưởng nhóm)** | Nền tảng, Tài khoản & Hồ sơ Gia sư | Đăng nhập/Đăng ký (JWT, bcrypt), phân quyền (Student/Tutor/Admin), Quản lý hồ sơ gia sư, Layout chung (`Header`, `Footer`, `AuthContext`, `ProtectedRoute`). Collection: `users`. |
| **Người B** | **Quản lý Lớp học, Khung giờ & Tìm kiếm** | **Màn hình 3:** Danh sách lớp học (tìm kiếm từ khóa, bộ lọc đa năng môn/giá/khối lớp, phân trang).<br>**Màn hình 4:** Chi tiết lớp học & Bảng quản lý lớp cho Gia sư/Admin (CRUD Thêm - Sửa - Xóa lớp học).<br>**Backend API:** Toàn bộ REST API `classes` + Model Mongoose `Class`. |
| **Người C** | Đăng ký thuê, Học phí & Thống kê | Màn hình 5 (Lớp học của tôi, gửi yêu cầu thuê, duyệt/hủy yêu cầu, modal xác nhận thanh toán). Màn hình 6 (Dashboard thống kê biểu đồ doanh thu, số học viên). Collection: `enrollments & payments`. |

---

## 🛠️ Yêu cầu kỹ thuật đạt được (Theo tiêu chí Đề bài)

1. **Frontend React:**
   - Xây dựng trên nền **Vite** + **React 19** + **React Router DOM v7**.
   - Giao diện thiết kế Responsive tương thích cả PC, Tablet và Mobile.
   - Các màn hình được phân chia route rõ ràng:
     - `/` hoặc `/classes`: **Màn hình 3** - Danh sách lớp học kèm bộ lọc và tìm kiếm.
     - `/classes/:id`: **Màn hình 4A** - Chi tiết lớp học và thông tin gia sư phụ trách.
     - `/manage-classes`: **Màn hình 4B** - Bảng quản lý lớp học (CRUD) cho Gia sư / Quản trị viên.
2. **Quản lý State:**
   - Tầng `classService` mô phỏng và đồng bộ dữ liệu thời gian thực (hỗ trợ `localStorage` khi offline và sẵn sàng cắm REST API).
3. **Backend Express & MongoDB (Người B):**
   - Đầy đủ 5 REST API endpoints với phương thức và mã trạng thái HTTP chuẩn (`200 OK`, `201 Created`, `404 Not Found`, `500 Internal Error`).
   - Mongoose Schema `Class` có quan hệ `ref: 'User'` với collection `users` của Người A.
   - Phân trang (`page / limit`), tìm kiếm từ khóa (`regex`), lọc theo khoảng giá (`minFee / maxFee`).
   - Middleware tập trung xử lý lỗi (`centralized error handling`).
4. **Bảo mật & Git:**
   - `.gitignore` đã chặn các file môi trường `.env`, không lộ thông tin nhạy cảm.

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Khởi chạy Giao diện Frontend
```bash
# Di chuyển vào thư mục dự án
cd "d:\IT\tutor management website"

# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi chạy server phát triển
npm run dev
```
Trình duyệt sẽ mở tại: `http://localhost:5173`

---

### 2. Khởi chạy Backend Express (Nếu kết nối cơ sở dữ liệu MongoDB)
```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt thư viện backend
npm install

# Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# Khởi chạy backend
npm run dev
```
Backend sẽ chạy tại: `http://localhost:5000`

---

## 📡 Tài liệu API của Người B (`/api/classes`)

| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/classes` | Public | Lấy danh sách lớp, hỗ trợ `search`, `subject`, `gradeLevel`, `minFee`, `maxFee`, `page`, `limit` |
| `GET` | `/api/classes/:id` | Public | Lấy chi tiết lớp học và `populate('tutorId')` |
| `POST` | `/api/classes` | Gia sư / Admin | Tạo lớp học mới |
| `PUT` | `/api/classes/:id` | Gia sư / Admin | Sửa thông tin lớp, cập nhật sĩ số, đổi lịch học |
| `DELETE`| `/api/classes/:id` | Gia sư / Admin | Hủy / xóa lớp học khỏi hệ thống |
