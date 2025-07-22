// Hàm load footer chung cho tất cả các trang (trừ admin)
function loadCommonFooter(retry = 0) {
    // Nếu là trang admin thì không chèn footer
    if (window.location.pathname.includes('admin')) return;
    // Kiểm tra xem đã có footer chưa
    const existingFooter = document.getElementById('main-footer');
    if (existingFooter) return;
    // Thêm footer vào cuối body
    fetch('/components/footer.html')
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
        });
}
// Tự động load footer khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadCommonFooter(0));
} else {
    loadCommonFooter(0);
}
