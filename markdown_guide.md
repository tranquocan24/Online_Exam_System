# Hướng dẫn tạo đề thi bằng Markdown

## Giới thiệu
Chức năng này cho phép bạn import đề thi từ file Markdown (.md) với định dạng đặc biệt. Điều này giúp bạn tạo đề thi nhanh chóng và có thể chia sẻ đề thi dưới dạng văn bản.

## Cấu trúc file Markdown

### 1. Thông tin đề thi (Header)
```markdown
# Tên đề thi

**Môn học:** Tên môn học  
**Thời gian:** 90 phút  
**Số câu hỏi:** 15  
**Mô tả:** Mô tả về đề thi

---
```

### 2. Câu hỏi trắc nghiệm đơn
```markdown
## Câu 1: Nội dung câu hỏi
**Loại:** multiple-choice  
**Điểm:** 1

Nội dung câu hỏi ở đây
- A. Đáp án A
- B. Đáp án B
- C. Đáp án C
- D. Đáp án D

**Đáp án:** A

---
```

### 3. Câu hỏi trắc nghiệm nhiều lựa chọn
```markdown
## Câu 2: Nội dung câu hỏi
**Loại:** multiple-select  
**Điểm:** 2

Nội dung câu hỏi ở đây
- A. Đáp án A
- B. Đáp án B
- C. Đáp án C
- D. Đáp án D
- E. Đáp án E

**Đáp án:** A,C,D

---
```

### 4. Câu hỏi tự luận
```markdown
## Câu 3: Nội dung câu hỏi
**Loại:** text  
**Điểm:** 3

Nội dung câu hỏi tự luận ở đây

**Đáp án mẫu:** 
Đáp án mẫu hoặc hướng dẫn chấm điểm

---
```

## Quy tắc quan trọng

1. **Tiêu đề câu hỏi**: Phải bắt đầu bằng `## Câu X:`
2. **Loại câu hỏi**: Có 3 loại
   - `multiple-choice`: Trắc nghiệm đơn
   - `multiple-select`: Trắc nghiệm nhiều lựa chọn
   - `text`: Câu hỏi tự luận
3. **Điểm số**: Phải là số nguyên dương
4. **Đáp án**: 
   - Trắc nghiệm đơn: Chỉ một chữ cái (A, B, C, D...)
   - Trắc nghiệm nhiều lựa chọn: Các chữ cái cách nhau bởi dấu phẩy (A,C,D)
   - Tự luận: Đáp án mẫu hoặc hướng dẫn chấm
5. **Phân cách**: Sử dụng `---` để phân cách giữa các câu hỏi

## Lưu ý khi sử dụng

- File phải có phần mở rộng `.md`
- Sử dụng encoding UTF-8 để hỗ trợ tiếng Việt
- Kiểm tra xem trước trước khi import
- Sau khi import, bạn có thể chỉnh sửa thêm trong giao diện tạo đề thi

## Ví dụ file hoàn chỉnh

Xem file `sample_exam.md` để tham khảo một ví dụ hoàn chỉnh về cách tạo đề thi bằng Markdown.
