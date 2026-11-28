# TutorCenter — Tìm gia sư & đăng ký 1 kèm 1

Frontend giữ cách tổ chức TypeScript, React Router và giao diện vàng kem của nhánh `LongNhat`; bộ lọc và dữ liệu booking dùng chung Zustand. API chạy Express/Mongoose trong `server/`.

## Chạy dự án

1. Cài frontend từ thư mục gốc: `npm install` rồi `npm run dev`.
2. Tạo `server/.env` dựa trên `server/.env.example`, đặt `JWT_SECRET` riêng và cấu hình `MONGO_URI`.
3. Trong `server/`, chạy `npm install` rồi `npm run dev`.
4. Đăng ký tài khoản với vai trò gia sư, mở **Hồ sơ dạy học** để nhập môn/cấp lớp, giá, hình thức và khung giờ. Học viên đăng ký rồi gửi yêu cầu từ trang **Tìm gia sư**.

Vite chuyển tiếp `/api` sang `http://localhost:5000`; có thể đổi backend bằng `VITE_API_URL`.

## API chính

- `GET /api/tutors/search`: `search`, `subject`, `grade`, `minFee`, `maxFee`, `location`, `teachingMode`, `dayOfWeek`, `timeSlot`.
- `POST /api/bookings`: tạo yêu cầu `pending`; cần JWT học viên.
- `GET /api/bookings?status=pending|approved|rejected`: danh sách theo quyền tài khoản.
- `PATCH /api/bookings/:id/approve` và `/reject`: chỉ admin hoặc gia sư được phân công.
- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/profile`.

## Dữ liệu lịch

`User` lưu `subjectsTaught`, `gradeLevels`, `hourlyRate`, `location`, `teachingModes` và `weeklyAvailability: [{ dayOfWeek, timeSlot, isBooked }]`. `dayOfWeek` dùng `0` cho Chủ Nhật, `1–6` cho Thứ 2 đến Thứ 7. `Booking` tham chiếu `studentId` và `tutorId`, lưu môn, cấp lớp, hình thức, ngày, ca và trạng thái `pending | approved | rejected`. Chỉ lịch `approved` chiếm slot chính thức. Kiểm tra duyệt dò lịch của cả học viên và gia sư; unique partial indexes chống hai yêu cầu đồng thời chiếm cùng lịch.

Vai trò `admin` được quản trị ngoài luồng đăng ký công khai; API không cho người dùng tự đăng ký quyền admin.
