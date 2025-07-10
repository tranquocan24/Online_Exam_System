// Hàm load footer chung cho tất cả các trang
function loadCommonFooter() {
    const footerHTML = `
        <!-- Footer chung -->
        <footer id="main-footer" style="background: #f8f9fa; padding: 20px 0; margin-top: 40px; border-top: 1px solid #e9ecef;">
            <div class="footer-container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                <div class="footer-content" style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    <img src="https://cdn.haitrieu.com/wp-content/uploads/2021/12/Logo-DH-Quoc-Te-Mien-Dong-EIU.png" 
                         alt="Logo EIU" 
                         style="height: 40px; width: auto;">
                    <p style="color: #112444; margin: 0; font-size: 14px; text-align: center;">
                        &copy; 2025 Hệ thống thi online - Trường Đại Học Quốc Tế Miền Đông
                    </p>
                </div>
            </div>
        </footer>
    `;
    
    // Kiểm tra xem đã có footer chưa
    const existingFooter = document.getElementById('main-footer');
    if (existingFooter) {
        existingFooter.remove();
    }
    
    // Thêm footer vào cuối body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

// Tự động load footer khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCommonFooter);
} else {
    loadCommonFooter();
}
