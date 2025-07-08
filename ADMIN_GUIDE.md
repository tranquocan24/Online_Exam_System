# Hướng dẫn sử dụng Giao diện Quản trị Admin

## Tổng quan
Giao diện quản trị admin cho phép quản lý toàn bộ hệ thống thi online, bao gồm quản lý tài khoản người dùng, xem thống kê hệ thống và cấu hình các thiết lập.

## Thông tin đăng nhập Admin
- **Username:** `admin`
- **Password:** `admin123`

## Các tính năng chính

### 1. Tổng quan (Dashboard)
- Hiển thị số liệu thống kê tổng quan:
  - Tổng số học sinh
  - Tổng số giáo viên  
  - Tổng số bài thi
  - Lượt thi hôm nay
- Hiển thị hoạt động gần đây của hệ thống

### 2. Quản lý tài khoản (Users Management)
#### Xem danh sách tài khoản
- Hiển thị tất cả tài khoản trong hệ thống
- Lọc theo loại tài khoản (học sinh, giáo viên, admin)
- Tìm kiếm theo tên hoặc username

#### Thêm tài khoản mới
1. Nhấn nút "Thêm tài khoản mới"
2. Điền thông tin:
   - Username (bắt buộc, phải duy nhất)
   - Mật khẩu (bắt buộc)
   - Tên đầy đủ (bắt buộc)
   - Vai trò (học sinh/giáo viên/admin)
   - Thông tin bổ sung theo vai trò:
     - Học sinh: Lớp
     - Giáo viên: Môn học
3. Nhấn "Lưu" để tạo tài khoản

#### Chỉnh sửa tài khoản
1. Nhấn nút "Sửa" bên cạnh tài khoản cần chỉnh sửa
2. Cập nhật thông tin trong form
3. Nhấn "Lưu" để cập nhật

#### Xóa tài khoản
1. Nhấn nút "Xóa" bên cạnh tài khoản cần xóa
2. Xác nhận xóa trong hộp thoại

### 3. Thống kê (Statistics)
- Biểu đồ phân bố người dùng
- Thống kê hoạt động thi theo tháng
- Các số liệu quan trọng khác

### 4. Cài đặt hệ thống (Settings)
#### Cài đặt chung
- Tên hệ thống
- Thời gian thi mặc định
- Cho phép đăng ký tài khoản

#### Cài đặt bảo mật
- Độ dài mật khẩu tối thiểu
- Thời gian session

## Cách truy cập

### Từ trang chủ
1. Vào http://localhost:3000
2. Đăng nhập với tài khoản admin
3. Hệ thống sẽ tự động chuyển hướng đến giao diện admin

### Truy cập trực tiếp
- Vào http://localhost:3000/admin.html
- Đăng nhập với tài khoản admin

## API Endpoints cho Admin

### Quản lý Users
- `GET /api/users` - Lấy danh sách tất cả users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/{id}` - Cập nhật user
- `DELETE /api/users/{id}` - Xóa user

### Dữ liệu khác
- `GET /api/exams` - Lấy danh sách bài thi
- `GET /api/results` - Lấy kết quả thi

## Bảo mật

### Kiểm tra quyền truy cập
- Chỉ tài khoản có role `admin` mới có thể truy cập
- Kiểm tra phiên đăng nhập
- Tự động đăng xuất khi hết phiên

### Validation dữ liệu
- Kiểm tra username không trùng lặp
- Validate các trường bắt buộc
- Sanitize input để tránh XSS

## Giao diện và trải nghiệm

### Responsive Design
- Tương thích với desktop, tablet và mobile
- Navigation adaptive
- Tables responsive với scroll horizontal

### Accessibility
- Proper semantic HTML
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

### Performance
- Lazy loading cho dữ liệu lớn
- Efficient filtering và search
- Optimized CSS và JavaScript

## Lưu ý quan trọng

1. **Backup dữ liệu**: Luôn backup trước khi thực hiện thay đổi lớn
2. **Quyền admin**: Cần thận trọng khi cấp quyền admin cho người khác
3. **Mật khẩu**: Sử dụng mật khẩu mạnh cho tài khoản admin
4. **Session**: Đăng xuất sau khi sử dụng xong

## Troubleshooting

### Không thể đăng nhập
- Kiểm tra username/password
- Xóa cache trình duyệt
- Kiểm tra console để xem lỗi

### Lỗi khi tạo/sửa user
- Kiểm tra username có trùng không
- Validate các trường bắt buộc
- Xem response từ server trong Network tab

### Giao diện không hiển thị đúng
- Kiểm tra CSS files được load
- Clear browser cache
- Kiểm tra JavaScript console

## Phát triển tương lai

### Tính năng dự kiến
- Dashboard với biểu đồ chi tiết hơn
- Export/Import users từ CSV/Excel
- Log audit trail
- Email notifications
- Bulk operations
- Advanced filtering và sorting
- Real-time notifications

### Cải tiến bảo mật
- Two-factor authentication
- Session management nâng cao
- Role-based permissions chi tiết hơn
- Password policies

---

**Liên hệ hỗ trợ**: Nếu có vấn đề gì, vui lòng liên hệ với đội phát triển.
