# EIU Color Palette - Bảng màu Trường Đại Học Quốc Tế Miền Đông

## Tổng quan
Hệ thống thi online đã được cập nhật để sử dụng bảng màu chủ đạo của Trường Đại Học Quốc Tế Miền Đông (EIU), tạo nên sự nhất quán về thương hiệu và trải nghiệm người dùng.

## Bảng màu chính

### Màu chủ đạo (Primary Colors)
- **EIU Primary**: `#112444` - Xanh đậm, màu chính của logo EIU
- **EIU Primary Light**: `#1a365d` - Xanh nhạt hơn, dùng cho hover states
- **EIU Primary Lighter**: `#2d5aa0` - Xanh trung bình, dùng cho accents

### Màu phụ (Secondary Colors)
- **EIU Secondary**: `#e2e8f0` - Xanh nhạt cho background
- **EIU Secondary Light**: `#f7fafc` - Xanh rất nhạt cho hover states

### Màu chữ (Text Colors)
- **EIU Text Primary**: `#2d3748` - Xám đậm cho text chính
- **EIU Text Secondary**: `#718096` - Xám nhạt cho text phụ
- **EIU Text Light**: `#a0aec0` - Xám rất nhạt cho text thứ cấp

### Màu nền (Background Colors)
- **EIU BG Primary**: `#ffffff` - Trắng
- **EIU BG Secondary**: `#f5f5f5` - Xám nhạt
- **EIU BG Light**: `#f8f9fa` - Xám rất nhạt

### Màu trạng thái (Status Colors)
- **EIU Success**: `#27ae60` - Xanh lá cho thành công
- **EIU Warning**: `#f39c12` - Cam cho cảnh báo
- **EIU Error**: `#e74c3c` - Đỏ cho lỗi
- **EIU Info**: `#3498db` - Xanh dương cho thông tin

## Gradient Colors
- **EIU Gradient Primary**: `linear-gradient(135deg, #112444 0%, #1a365d 100%)`
- **EIU Gradient Secondary**: `linear-gradient(135deg, #1a365d 0%, #2d5aa0 100%)`

## Cách sử dụng

### CSS Variables
```css
/* Sử dụng biến CSS */
.my-element {
    background-color: var(--eiu-primary);
    color: var(--eiu-text-primary);
    border: 1px solid var(--eiu-border-light);
}
```

### Utility Classes
```css
/* Sử dụng class tiện ích */
<button class="btn-eiu-primary">Nút EIU</button>
<div class="card-eiu">Card với style EIU</div>
<header class="header-eiu-gradient">Header gradient</header>
```

### Trong JavaScript
```javascript
// Cập nhật màu động
element.style.background = 'linear-gradient(135deg, #112444 0%, #1a365d 100%)';
element.style.color = '#2d3748';
```

## Các thành phần đã được cập nhật

### 1. Header
- Background gradient sử dụng màu EIU primary
- Text màu trắng
- Border bottom với màu accent

### 2. Navigation
- Active state sử dụng màu EIU primary
- Hover state sử dụng màu EIU primary light
- Border và background phù hợp

### 3. Buttons
- Primary buttons sử dụng gradient EIU
- Secondary buttons sử dụng màu EIU secondary
- Hover effects với màu EIU primary light

### 4. Cards
- Border left với màu EIU primary
- Hover effects với transform và shadow
- Background màu trắng

### 5. Forms
- Focus states với màu EIU primary
- Border colors phù hợp
- Validation states với màu status

### 6. Footer
- Background màu EIU primary
- Text màu trắng
- Logo EIU được giữ nguyên

## Responsive Design
- Màu sắc được tối ưu cho tất cả kích thước màn hình
- Mobile-first approach
- Touch-friendly color contrasts

## Accessibility
- Đảm bảo contrast ratio đạt chuẩn WCAG 2.1 AA
- Hỗ trợ high contrast mode
- Hỗ trợ reduced motion preferences

## File CSS chính
- `public/css/eiu-colors.css` - Định nghĩa biến màu và utility classes
- `public/css/common.css` - Styles chung với màu EIU
- `public/css/admin.css` - Styles admin với màu EIU
- `public/css/student.css` - Styles sinh viên với màu EIU
- `public/css/teacher.css` - Styles giáo viên với màu EIU

## Cập nhật trong tương lai
- Hỗ trợ dark mode
- Thêm các biến thể màu mới
- Tối ưu hóa performance
- Thêm animation với màu EIU

## Lưu ý
- Tất cả màu sắc đều tuân theo brand guidelines của EIU
- Đảm bảo tính nhất quán xuyên suốt hệ thống
- Dễ dàng maintain và update trong tương lai 