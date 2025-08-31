// session-manager.js - Quản lý phiên đăng nhập và auto logout

class SessionManager {
    constructor() {
        this.timeoutDuration = this.getSessionTimeoutFromSettings() * 60 * 1000; // Lấy từ settings
        this.warningDuration = 2 * 60 * 1000; // Cảnh báo trước 2 phút
        this.timeoutId = null;
        this.warningTimeoutId = null;
        this.lastActivity = Date.now();
        this.isWarningShown = false;
        
        this.init();
    }

    getSessionTimeoutFromSettings() {
        try {
            const settings = localStorage.getItem('systemSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                return parsedSettings.sessionTimeout || 10; // Mặc định 10 phút
            }
        } catch (e) {
            console.warn('Error reading session timeout from settings:', e);
        }
        return 10; // Mặc định 10 phút
    }

    init() {
        // Chỉ khởi tạo nếu người dùng đã đăng nhập
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return;
        }

        const timeoutMinutes = this.timeoutDuration / (60 * 1000);
        console.log(`Session Manager initialized with ${timeoutMinutes}-minute timeout`);
        
        // Đặt lại timer
        this.resetTimer();
        
        // Theo dõi hoạt động của người dùng
        this.trackUserActivity();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    trackUserActivity() {
        // Danh sách các event để theo dõi hoạt động
        const activityEvents = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 
            'touchstart', 'click', 'focus', 'blur'
        ];

        // Thêm event listener cho tất cả các loại hoạt động
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.onUserActivity();
            }, true);
        });

        // Theo dõi thay đổi trang
        window.addEventListener('beforeunload', () => {
            this.onUserActivity();
        });
    }

    onUserActivity() {
        this.lastActivity = Date.now();
        
        // Đóng cảnh báo nếu đang hiển thị
        if (this.isWarningShown) {
            this.hideWarning();
        }
        
        // Đặt lại timer
        this.resetTimer();
    }

    resetTimer() {
        // Xóa timer cũ
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
        }

        // Đặt timer cảnh báo (8 phút)
        this.warningTimeoutId = setTimeout(() => {
            this.showWarning();
        }, this.timeoutDuration - this.warningDuration);

        // Đặt timer logout (10 phút)
        this.timeoutId = setTimeout(() => {
            this.autoLogout();
        }, this.timeoutDuration);
    }

    showWarning() {
        if (this.isWarningShown) {
            return;
        }

        this.isWarningShown = true;
        
        // Tạo modal cảnh báo
        const warningModal = document.createElement('div');
        warningModal.id = 'session-warning-modal';
        warningModal.className = 'modal session-warning-modal';
        warningModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cảnh báo phiên làm việc</h3>
                </div>
                <div class="modal-body">
                    <p>Phiên làm việc của bạn sẽ hết hạn trong <span id="countdown">2:00</span> phút.</p>
                    <p>Nhấn "Tiếp tục" để duy trì phiên làm việc.</p>
                </div>
                <div class="modal-footer">
                    <button id="continue-session-btn" class="btn btn-primary">Tiếp tục</button>
                    <button id="logout-now-btn" class="btn btn-secondary">Đăng xuất ngay</button>
                </div>
            </div>
        `;

        document.body.appendChild(warningModal);
        warningModal.style.display = 'block';

        // Đếm ngược
        this.startCountdown();

        // Event listeners cho các nút
        document.getElementById('continue-session-btn').addEventListener('click', () => {
            this.onUserActivity(); // Sẽ tự động ẩn warning và reset timer
        });

        document.getElementById('logout-now-btn').addEventListener('click', () => {
            this.autoLogout();
        });
    }

    startCountdown() {
        let timeLeft = 120; // 2 phút = 120 giây
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
            
            if (timeLeft < 0 || !this.isWarningShown) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    hideWarning() {
        const warningModal = document.getElementById('session-warning-modal');
        if (warningModal) {
            warningModal.remove();
        }
        this.isWarningShown = false;
    }

    autoLogout() {
        console.log('Auto logout triggered due to inactivity');
        
        // Xóa dữ liệu phiên
        localStorage.removeItem('currentUser');
        
        // Hiển thị thông báo
        alert('Phiên làm việc đã hết hạn do không có hoạt động. Bạn sẽ được chuyển về trang đăng nhập.');
        
        // Chuyển về trang đăng nhập
        window.location.href = 'index.html';
    }

    // Phương thức để cập nhật thời gian timeout từ admin settings
    updateTimeout(minutes) {
        if (!minutes) {
            minutes = this.getSessionTimeoutFromSettings();
        }
        
        this.timeoutDuration = minutes * 60 * 1000;
        this.warningDuration = Math.min(2 * 60 * 1000, this.timeoutDuration / 5); // Cảnh báo trước 2 phút hoặc 1/5 thời gian
        
        console.log(`Session timeout updated to ${minutes} minutes`);
        
        // Reset timer với thời gian mới
        this.resetTimer();
    }

    // Phương thức để dừng session manager (khi logout thủ công)
    destroy() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.warningTimeoutId) {
            clearTimeout(this.warningTimeoutId);
        }
        this.hideWarning();
        
        console.log('Session Manager destroyed');
    }
}

// Khởi tạo Session Manager khi trang load
let sessionManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Đợi một chút để đảm bảo user data đã được load
    setTimeout(() => {
        sessionManager = new SessionManager();
    }, 1000);
});

// Export để sử dụng ở file khác nếu cần
window.SessionManager = SessionManager;
window.sessionManager = sessionManager;
