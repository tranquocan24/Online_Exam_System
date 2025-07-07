# Kế hoạch phát triển ứng dụng thi online tối giản (Node.js thuần, lưu file)

## 1. Kiến trúc tổng thể
### 1.1. Thành phần chính
- Server Node.js thuần: Xử lý HTTP, routing, đọc/ghi file JSON.
- Frontend HTML/CSS/JS: Layout chung, mỗi chức năng là một file content riêng, load động qua JS.
- Lưu trữ: Dữ liệu user, đề thi, kết quả... lưu file JSON.

### 1.2. Cấu trúc thư mục đề xuất (cập nhật)
```
/online-exam/
│
├── server.js                // Server Node.js thuần
├── data/
│   ├── users.json           // Lưu thông tin sinh viên, giảng viên (được cấp sẵn)
│   ├── questions.json       // Lưu đề thi
│   └── results.json         // Lưu kết quả thi
│
├── public/
│   ├── index.html           // Layout chung cấp 1
│   ├── student.html         // Layout chung cấp 2 cho sinh viên
│   ├── teacher.html         // Layout chung cấp 2 cho giáo viên
│   ├── css/
│   │   ├── common.css       // CSS chung cho toàn bộ ứng dụng
│   │   ├── student.css      // CSS riêng cho sinh viên
│   │   └── teacher.css      // CSS riêng cho giáo viên
│   ├── js/
│   │   ├── main.js          // Xử lý layout cấp 1, load content động
│   │   ├── auth.js          // Xử lý đăng nhập, phân quyền
│   │   ├── student/
│   │   │   ├── exam.js      // Xử lý thi
│   │   │   └── result.js    // Xem kết quả cá nhân
│   │   └── teacher/
│   │       ├── create_exam.js   // Tạo đề thi
│   │       ├── manage_exam.js   // Quản lý đề thi
│   │       └── view_results.js  // Xem kết quả tất cả sinh viên
│   └── content/
│       ├── login.html       // Form đăng nhập
│       ├── student/
│       │   ├── dashboard.html   // Trang chủ sinh viên
│       │   ├── exam_list.html   // Danh sách bài thi
│       │   ├── exam.html        // Thi trực tuyến
│       │   └── my_results.html  // Kết quả cá nhân
│       └── teacher/
│           ├── dashboard.html    // Trang chủ giáo viên
│           ├── create_exam.html  // Tạo đề thi mới
│           ├── manage_exams.html // Quản lý đề thi
│           └── view_results.html // Xem kết quả sinh viên
│
└── README.md
```

### 1.3. Cấu trúc Layout phân cấp

#### Layout Cấp 1 (index.html) - Layout tổng thể
```html
<!DOCTYPE html>
<html>
<head>
    <title>Hệ thống thi online</title>
    <link rel="stylesheet" href="css/common.css">
</head>
<body>
    <!-- Header chung -->
    <header id="main-header">
        <h1>Hệ thống thi online</h1>
        <div id="user-info" style="display:none;">
            <span id="welcome-text"></span>
            <button id="logout-btn">Đăng xuất</button>
        </div>
    </header>

    <!-- Container chính -->
    <div id="app-container">
        <!-- Nơi load content động -->
    </div>

    <!-- Footer chung -->
    <footer id="main-footer">
        <p>&copy; 2025 Hệ thống thi online</p>
    </footer>

    <script src="js/main.js"></script>
    <script src="js/auth.js"></script>
</body>
</html>
```

#### Layout Cấp 2 cho Sinh viên (student.html template)
```html
<!-- Template được load vào app-container -->
<div id="student-layout">
    <!-- Navigation cho sinh viên -->
    <nav id="student-nav">
        <ul>
            <li><a href="#" data-page="dashboard">Trang chủ</a></li>
            <li><a href="#" data-page="exam_list">Danh sách bài thi</a></li>
            <li><a href="#" data-page="my_results">Kết quả của tôi</a></li>
        </ul>
    </nav>

    <!-- Content area cho sinh viên -->
    <main id="student-content">
        <!-- Nơi load các chức năng sinh viên -->
    </main>
</div>
```

#### Layout Cấp 2 cho Giáo viên (teacher.html template)
```html
<!-- Template được load vào app-container -->
<div id="teacher-layout">
    <!-- Navigation cho giáo viên -->
    <nav id="teacher-nav">
        <ul>
            <li><a href="#" data-page="dashboard">Trang chủ</a></li>
            <li><a href="#" data-page="create_exam">Tạo đề thi</a></li>
            <li><a href="#" data-page="manage_exams">Quản lý đề thi</a></li>
            <li><a href="#" data-page="view_results">Xem kết quả</a></li>
        </ul>
    </nav>

    <!-- Content area cho giáo viên -->
    <main id="teacher-content">
        <!-- Nơi load các chức năng giáo viên -->
    </main>
</div>
```

### 1.4. Luồng hoạt động chi tiết
1. **Khởi tạo**: Người dùng truy cập `index.html` (Layout cấp 1)
2. **Đăng nhập**: Load form đăng nhập vào `app-container`
3. **Phân quyền**: Sau khi đăng nhập thành công:
   - Nếu là sinh viên: Load layout sinh viên + dashboard sinh viên
   - Nếu là giáo viên: Load layout giáo viên + dashboard giáo viên
4. **Điều hướng**: Click menu sẽ load content tương ứng vào content area của layout cấp 2

### 1.5. Dữ liệu mẫu users.json (được cấp sẵn)
```json
{
  "students": [
    {
      "id": "SV001",
      "username": "sv001",
      "password": "123456",
      "name": "Nguyễn Văn A",
      "class": "CNTT01"
    }
  ],
  "teachers": [
    {
      "id": "GV001", 
      "username": "gv001",
      "password": "123456",
      "name": "PGS.TS Nguyễn Văn B",
      "subject": "Lập trình Web"
    }
  ]
}
```

---

## 2. Kế hoạch phát triển theo giai đoạn (cập nhật)

### Giai đoạn 1: Khởi tạo dự án & layout chung ✅
- ✅ Tạo cấu trúc thư mục như trên
- ✅ Xây dựng Layout cấp 1 (index.html) với header, footer chung
- ✅ Xây dựng Layout cấp 2 cho sinh viên và giáo viên
- ✅ Viết CSS chung và CSS riêng cho từng role
- ✅ Viết JS để load layout và content động

### Giai đoạn 2: Đăng nhập & phân quyền ✅
- ✅ Tạo form đăng nhập (login.html, auth.js)
- ✅ Tạo dữ liệu user mẫu trong users.json (được cấp sẵn)
- ✅ Xử lý đăng nhập, phân biệt quyền sinh viên/giáo viên
- ✅ Load layout tương ứng sau khi đăng nhập
- ✅ Thêm session management với thời gian hết hạn
- ✅ Validation input và bảo mật cơ bản
- ✅ Remember me functionality
- ✅ Thống kê đăng nhập và hoạt động người dùng
- ✅ Keyboard shortcuts và UX improvements

### Giai đoạn 3: Dashboard và navigation ✅
- ✅ Xây dựng dashboard cho sinh viên và giáo viên
- ✅ Tạo navigation menu cho từng role
- ✅ Xử lý điều hướng giữa các chức năng
- ✅ Responsive navigation với icons
- ✅ Active state management
- ✅ Breadcrumb navigation
- ✅ Quick actions và shortcuts
- ✅ Debug và sửa lỗi đăng nhập không chuyển dashboard
- ✅ Hoàn thiện session management và user experience
- ✅ Tạo dashboard.js cho cả sinh viên và giáo viên
- ✅ Tích hợp API calls và hiển thị thống kê cơ bản

### Giai đoạn 4: Chức năng cho sinh viên ✅
- ✅ Danh sách bài thi (exam_list.html, exam_list.js)
- ✅ Giao diện thi (exam.html, exam.js)
- ✅ Xem kết quả cá nhân (result.html, result.js, my_results.html, my_results.js)
- ✅ Lưu kết quả vào results.json
- ✅ API endpoints cho exam và result
- ✅ Timer, navigation, auto-save
- ✅ Hỗ trợ nhiều loại câu hỏi: multiple-choice, multiple-select, text
- ✅ Responsive design và UX tốt
- ✅ Hoàn thiện exam_list.js với đầy đủ chức năng lọc, tìm kiếm
- ✅ Tích hợp modal preview bài thi
- ✅ Chức năng thi lại và xem kết quả chi tiết
- ✅ Kiểm tra và xác nhận tất cả file JS hoạt động tốt

### Giai đoạn 5: Chức năng cho giáo viên ✅
- ✅ Tạo đề thi (create_exam.html, create_exam.js)
- ✅ Quản lý đề thi (manage_exams.html, manage_exam.js)
- ✅ Xem kết quả sinh viên (view_results.html, view_results.js)
- ✅ Lưu đề thi vào questions.json
- ✅ CRUD operations cho exam management
- ✅ Statistics và analytics cho giáo viên
- ✅ Export results functionality
- ✅ Hoàn thiện form tạo đề thi với validation
- ✅ Quản lý đề thi với filter, search, bulk actions
- ✅ Chi tiết kết quả thi với biểu đồ phân bố điểm
- ✅ Export CSV và thống kê toàn diện

### Giai đoạn 6: Hoàn thiện & kiểm thử 🔄
- ⏳ Kiểm thử các luồng chính
  - ✅ Sửa lỗi nút "Bắt đầu thi" không hoạt động
  - ✅ Sửa lỗi routing API submit exam
  - ✅ Cải thiện error handling trong exam submission
  - ✅ Debug và fix navigation between pages
  - ✅ Sửa lỗi dashboard student không cập nhật thống kê (bài thi khả dụng, đã hoàn thành, điểm trung bình)
  - ✅ Sửa lỗi dashboard không load dữ liệu khi navigation về trang chủ
  - ✅ Sửa lỗi tính điểm bài thi (xử lý multiple answer formats, tạo ScoreCalculator chung)
  - ✅ Sửa lỗi mất dữ liệu khi chuyển trang (cải thiện logic khởi tạo và refresh instance)
  - ✅ Sửa lỗi hiển thị điểm không đúng trong exam card và teacher dashboard (đồng bộ với ScoreCalculator)
  - ✅ Sửa lỗi teacher dashboard không hiển thị thống kê (đề thi đã tạo, sinh viên tham gia, điểm TB, bài nộp)
  - ✅ Sửa lỗi nút "Thêm câu hỏi" trong trang tạo đề thi không hoạt động
  - ⏳ Test complete exam flow: login → exam list → take exam → submit → view results
- ⏳ Bổ sung CSS, tối ưu giao diện responsive
- ⏳ Thêm validation và xử lý lỗi
- ⏳ Viết README hướng dẫn sử dụng
- ⏳ Test integration giữa các modules
- ⏳ Performance optimization
- ⏳ Cross-browser compatibility

### Giai đoạn 7: Tối ưu và bảo mật cơ bản
- Thêm session management đơn giản
- Validate input data
- Xử lý lỗi và thông báo user-friendly
- Backup dữ liệu định kỳ
