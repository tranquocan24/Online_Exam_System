# Hệ thống thi online tối giản

Một ứng dụng thi online đơn giản sử dụng Node.js thuần túy, không cần database, lưu trữ dữ liệu bằng file JSON.

## 🚀 Tính năng

### Dành cho Sinh viên
- ✅ Đăng nhập hệ thống
- ✅ Xem dashboard với thống kê cá nhân
- 📝 Xem danh sách bài thi
- ⏰ Thi trực tuyến với giới hạn thời gian
- 📊 Xem kết quả và điểm số

### Dành cho Giáo viên
- ✅ Đăng nhập hệ thống
- ✅ Xem dashboard với thống kê lớp học
- ✏️ Tạo đề thi trắc nghiệm
- 📋 Quản lý các đề thi đã tạo
- 📈 Xem kết quả thi của sinh viên

## 🏗️ Kiến trúc

- **Frontend**: HTML, CSS, JavaScript thuần túy
- **Backend**: Node.js HTTP server (không Express)
- **Lưu trữ**: File JSON (users.json, questions.json, results.json)
- **Thiết kế**: Layout phân cấp, Single Page Application (SPA)

## 📂 Cấu trúc thư mục

```
/online-exam/
│
├── server.js                # Server Node.js thuần
├── data/                    # Dữ liệu JSON
│   ├── users.json          # Thông tin sinh viên, giáo viên
│   ├── questions.json      # Đề thi và câu hỏi
│   └── results.json        # Kết quả thi
│
├── public/                 # Static files
│   ├── index.html          # Layout chính
│   ├── student.html        # Layout sinh viên
│   ├── teacher.html        # Layout giáo viên
│   │
│   ├── css/                # Stylesheets
│   │   ├── common.css      # CSS chung
│   │   ├── student.css     # CSS sinh viên
│   │   └── teacher.css     # CSS giáo viên
│   │
│   ├── js/                 # JavaScript
│   │   ├── main.js         # Logic chính
│   │   ├── auth.js         # Xử lý đăng nhập
│   │   ├── student/        # JS cho sinh viên
│   │   └── teacher/        # JS cho giáo viên
│   │
│   └── content/            # Nội dung trang
│       ├── login.html      # Form đăng nhập
│       ├── student/        # Nội dung sinh viên
│       └── teacher/        # Nội dung giáo viên
│
└── README.md
```

## 🛠️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js version 14 trở lên
- NPM (đi kèm với Node.js)

### Hướng dẫn chạy

1. **Mở terminal tại thư mục dự án:**
   ```bash
   cd Online_exam_project
   ```

2. **Chạy server (có 2 cách):**
   
   **Cách 1 - Sử dụng npm:**
   ```bash
   npm start
   ```
   
   **Cách 2 - Chạy trực tiếp:**
   ```bash
   node server.js
   ```

3. **Mở trình duyệt và truy cập:**
   ```
   http://localhost:3000
   ```

4. **Dừng server:**
   Nhấn `Ctrl + C` trong terminal

## 👥 Tài khoản demo

### Sinh viên
- **Username:** `sv001`
- **Password:** `123456`
- **Tên:** Nguyễn Văn A

- **Username:** `sv002`  
- **Password:** `123456`
- **Tên:** Trần Thị B

### Giáo viên
- **Username:** `gv001`
- **Password:** `123456`
- **Tên:** PGS.TS Nguyễn Văn C

## 📖 Hướng dẫn sử dụng

### Đăng nhập
1. Truy cập trang chủ
2. Nhập username và password
3. Hệ thống sẽ tự động chuyển đến giao diện tương ứng

### Dành cho Sinh viên
1. **Dashboard:** Xem thống kê và bài thi gần đây
2. **Danh sách bài thi:** Xem các bài thi có thể làm
3. **Thi:** Làm bài thi trong thời gian quy định
4. **Kết quả:** Xem điểm số và chi tiết bài làm

### Dành cho Giáo viên
1. **Dashboard:** Xem thống kê lớp học và hành động nhanh
2. **Tạo đề thi:** Tạo đề thi trắc nghiệm mới
3. **Quản lý đề thi:** Xem, chỉnh sửa các đề thi đã tạo
4. **Xem kết quả:** Theo dõi kết quả thi của sinh viên

## 🔧 API Endpoints

### Users
- `GET /api/users` - Lấy danh sách users

### Questions  
- `GET /api/questions` - Lấy danh sách đề thi
- `POST /api/questions` - Tạo đề thi mới

### Results
- `GET /api/results` - Lấy kết quả thi
- `POST /api/results` - Nộp bài thi

## 🎨 Thiết kế giao diện

- **Responsive Design:** Tương thích mọi thiết bị
- **Modern UI:** Giao diện hiện đại, thân thiện
- **Dark/Light Theme:** Sẵn sàng mở rộng
- **Accessibility:** Tuân thủ các chuẩn accessibility

## 🔒 Bảo mật

- Session management đơn giản với localStorage
- Input validation cơ bản
- CORS handling
- Directory traversal protection

## 📊 Dữ liệu mẫu

Hệ thống đi kèm dữ liệu mẫu bao gồm:
- 2 sinh viên và 1 giáo viên
- 1 đề thi mẫu với 2 câu hỏi
- Kết quả thi mẫu

## 🚧 Phát triển tiếp

### Tính năng có thể mở rộng:
- [ ] Thi tự luận
- [ ] Upload file đính kèm
- [ ] Chat realtime
- [ ] Notification system
- [ ] Email integration
- [ ] Database integration
- [ ] User management
- [ ] Advanced security

## 🐛 Debug và Troubleshooting

### Server không khởi động được:
- Kiểm tra Node.js đã cài đặt
- Kiểm tra port 3000 có bị chiếm dụng
- Xem log trong terminal

### Không đăng nhập được:
- Kiểm tra username/password
- Xem Network tab trong Developer Tools
- Kiểm tra file users.json

### Lỗi load trang:
- Kiểm tra console trong Developer Tools
- Kiểm tra Network requests
- Restart server

## 📝 Ghi chú

- Đây là phiên bản tối giản cho mục đích học tập
- Không sử dụng framework ngoài (Express, React, Vue)
- Dữ liệu lưu trong file JSON, không persistent khi restart
- Session đơn giản, không có expire time

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra phần Troubleshooting
2. Xem log trong terminal và browser console
3. Restart server và thử lại

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** Tháng 1, 2025  
**Tác giả:** Online Exam Project Team
