# Hệ thống thi online tối giản - EIU

# Hệ thống thi online tối giản - Trường Đại Học Quốc Tế Miền Đông

Hệ thống thi online đơn giản được xây dựng bằng Node.js thuần, lưu trữ dữ liệu bằng file JSON.

## 🎨 Thiết kế & Giao diện
- **EIU Brand Colors**: Sử dụng bảng màu chủ đạo của Trường Đại Học Quốc Tế Miền Đông
- **Responsive Design**: Tối ưu cho mọi thiết bị
- **Modern UI/UX**: Giao diện hiện đại, thân thiện người dùng
- **Accessibility**: Hỗ trợ accessibility standards

## 🚀 Tính năng chính

### Sinh viên
- Đăng nhập và xem dashboard cá nhân
- Xem danh sách bài thi khả dụng
- Làm bài thi trực tuyến với giao diện thân thiện
- Xem kết quả và lịch sử thi

### Giảng viên
- Đăng nhập và xem dashboard quản lý
- Tạo đề thi với nhiều loại câu hỏi
- **Import đề thi từ file Markdown** 📝
- Quản lý đề thi đã tạo với giao diện card hiện đại
- Bộ lọc nâng cao cho quản lý đề thi
- Xem kết quả thi của sinh viên
- Thống kê và phân tích điểm số

## 🛠️ Cài đặt và chạy

### Yêu cầu
- Node.js >= 14.0.0
- NPM

### Cài đặt
```bash
# Clone repository
git clone https://github.com/tranquocan24/Online_Exam_System.git

# Di chuyển vào thư mục
cd Online_Exam_System

# Cài đặt dependencies (nếu có)
npm install
```

### Chạy ứng dụng
```bash
# Chạy server
npm start

# Hoặc
node server.js
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

## 👥 Tài khoản mẫu

### Sinh viên
- Username: `sv001`, Password: `123456` (Nguyễn Văn A)
- Username: `sv002`, Password: `123456` (Trần Thị B)
- Username: `sv003`, Password: `123456` (Lê Văn C)

### Giảng viên
- Username: `gv001`, Password: `123456` (PGS.TS Nguyễn Văn C)
- Username: `gv002`, Password: `123456` (TS. Trần Thị D)

## 🧪 Kiểm thử

### Chạy test cơ bản
```bash
npm run test:basic
```

### Chạy test đầy đủ
```bash
npm run test:full
```

### Chạy tất cả test
```bash
npm test
```
│   │   ├── auth.js         # Xử lý đăng nhập
│   │   ├── student/        # JS cho sinh viên
│   │   └── teacher/        # JS cho giáo viên
│   │
│   └── content/            # Nội dung trang
│       ├── login.html      # Form đăng nhập
│       ├── student/        # Nội dung sinh viên
│       └── teacher/        # Nội dung giáo viên
│
├── EIU_COLORS.md          # Documentation về bảng màu EIU
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
1. **Dashboard:** Xem thống kê tổng quan
2. **Tạo đề thi:** 
   - Tạo đề thi thủ công với form
   - **Import từ file Markdown** (tính năng mới!)
3. **Quản lý đề thi:** Xem, chỉnh sửa, xóa các đề thi đã tạo
4. **Xem kết quả:** Phân tích kết quả thi của sinh viên

## 📝 Tính năng Import Markdown

### Cách sử dụng
1. Vào trang "Tạo đề thi"
2. Nhấn nút "Import từ Markdown"
3. Chọn file .md hoặc dán nội dung trực tiếp
4. Xem trước và nhấn "Import câu hỏi"

### Định dạng Markdown
- **File mẫu:** `sample_exam.md`
- **Hướng dẫn chi tiết:** `markdown_guide.md`
- **Hỗ trợ 3 loại câu hỏi:** Trắc nghiệm đơn, trắc nghiệm nhiều lựa chọn, tự luận

### Ví dụ cú pháp
```markdown
# Đề thi Lập trình Web

**Môn học:** Lập trình Web
**Thời gian:** 90 phút

## Câu 1: HTML là viết tắt của gì?
**Loại:** multiple-choice
**Điểm:** 1

- A. HyperText Markup Language
- B. HyperText Modern Language
- C. HyperLink Markup Language
- D. HyperLink Modern Language

**Đáp án:** A
```

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
