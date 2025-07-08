# Đề thi Lập trình Web - Midterm

**Môn học:** Lập trình Web  
**Thời gian:** 90 phút  
**Số câu hỏi:** 15  
**Mô tả:** Đề thi giữa kỳ môn Lập trình Web, bao gồm các kiến thức cơ bản về HTML, CSS, JavaScript và Node.js

---

## Câu 1: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

HTML là viết tắt của:
- A. HyperText Markup Language
- B. HyperText Modern Language
- C. HyperLink Markup Language
- D. HyperLink Modern Language

**Đáp án:** A

---

## Câu 2: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

CSS được sử dụng để:
- A. Tạo cấu trúc trang web
- B. Tạo logic cho trang web
- C. Tạo giao diện và định dạng cho trang web
- D. Kết nối cơ sở dữ liệu

**Đáp án:** C

---

## Câu 3: Trắc nghiệm nhiều lựa chọn
**Loại:** multiple-select  
**Điểm:** 2

Những thẻ HTML nào sau đây là thẻ block element?
- A. div
- B. span
- C. p
- D. h1
- E. a

**Đáp án:** A,C,D

---

## Câu 4: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

Trong JavaScript, để khai báo một biến, ta sử dụng từ khóa:
- A. var, let, const
- B. variable, declare
- C. int, string, boolean
- D. define, set

**Đáp án:** A

---

## Câu 5: Câu hỏi tự luận
**Loại:** text  
**Điểm:** 3

Giải thích sự khác biệt giữa var, let và const trong JavaScript. Cho ví dụ cụ thể.

**Đáp án mẫu:** 
- var: Function-scoped, có thể redeclare và reassign
- let: Block-scoped, có thể reassign nhưng không thể redeclare
- const: Block-scoped, không thể reassign và redeclare

---

## Câu 6: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

Phương thức HTTP nào được sử dụng để gửi dữ liệu tới server?
- A. GET
- B. POST
- C. PUT
- D. DELETE

**Đáp án:** B

---

## Câu 7: Trắc nghiệm nhiều lựa chọn
**Loại:** multiple-select  
**Điểm:** 2

Những selector CSS nào sau đây hợp lệ?
- A. #header
- B. .navigation
- C. div p
- D. [type="text"]
- E. ::before

**Đáp án:** A,B,C,D,E

---

## Câu 8: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

Node.js là:
- A. Một framework JavaScript
- B. Một thư viện JavaScript
- C. Một runtime environment cho JavaScript
- D. Một database

**Đáp án:** C

---

## Câu 9: Câu hỏi tự luận
**Loại:** text  
**Điểm:** 3

Viết một hàm JavaScript để kiểm tra xem một chuỗi có phải là palindrome hay không.

**Đáp án mẫu:**
```javascript
function isPalindrome(str) {
    const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanStr === cleanStr.split('').reverse().join('');
}
```

---

## Câu 10: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

Trong CSS, để tạo layout responsive, ta thường sử dụng:
- A. Media queries
- B. Flexbox
- C. Grid
- D. Tất cả các đáp án trên

**Đáp án:** D

---

## Câu 11: Trắc nghiệm nhiều lựa chọn
**Loại:** multiple-select  
**Điểm:** 2

Những event nào sau đây là valid DOM events?
- A. click
- B. mouseover
- C. keydown
- D. scroll
- E. resize

**Đáp án:** A,B,C,D,E

---

## Câu 12: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

JSON là viết tắt của:
- A. JavaScript Object Notation
- B. JavaScript Object Network
- C. Java Standard Object Notation
- D. Java Simple Object Network

**Đáp án:** A

---

## Câu 13: Câu hỏi tự luận
**Loại:** text  
**Điểm:** 4

Giải thích khái niệm "Callback function" trong JavaScript và cho ví dụ cụ thể về việc sử dụng callback với setTimeout.

**Đáp án mẫu:**
Callback function là một function được truyền như một argument vào một function khác và được gọi sau khi function chính hoàn thành.

Ví dụ:
```javascript
function sayHello(name, callback) {
    console.log('Hello ' + name);
    callback();
}

function sayGoodbye() {
    console.log('Goodbye!');
}

sayHello('John', sayGoodbye);
```

---

## Câu 14: Trắc nghiệm đơn
**Loại:** multiple-choice  
**Điểm:** 1

Để debug JavaScript code, ta có thể sử dụng:
- A. console.log()
- B. debugger;
- C. Developer Tools
- D. Tất cả các đáp án trên

**Đáp án:** D

---

## Câu 15: Câu hỏi tự luận
**Loại:** text  
**Điểm:** 3

Nêu ưu điểm và nhược điểm của việc sử dụng Node.js trong phát triển web.

**Đáp án mẫu:**
Ưu điểm:
- Hiệu suất cao với event-driven, non-blocking I/O
- Sử dụng cùng ngôn ngữ JavaScript cho cả frontend và backend
- Có NPM với nhiều package hữu ích

Nhược điểm:
- Không phù hợp cho CPU-intensive tasks
- Callback hell (mặc dù có thể giải quyết với Promise/async-await)
- Thay đổi API thường xuyên
