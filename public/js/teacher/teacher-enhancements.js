// teacher-enhancements.js - Enhanced functionality for teacher interface

class TeacherEnhancements {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNotifications();
        this.updateBadges();
        this.initQuickActions();
        this.initSearch();
    }

    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            // Handle navigation clicks
            if (e.target.closest('.nav-link')) {
                this.handleNavigation(e.target.closest('.nav-link'));
            }

            // Handle notification toggle
            if (e.target.closest('#notifications')) {
                e.preventDefault();
                this.toggleNotifications();
            }

            // Handle quick actions
            if (e.target.closest('#quick-actions-toggle')) {
                e.preventDefault();
                this.toggleQuickActions();
            }

            // Handle close popup
            if (e.target.closest('.close-popup')) {
                this.closeNotifications();
            }

            // Handle quick action buttons
            if (e.target.closest('[data-action]')) {
                e.preventDefault();
                this.handleQuickAction(e.target.closest('[data-action]').dataset.action);
            }

            // Handle help button
            if (e.target.closest('#quick-help')) {
                e.preventDefault();
                this.showHelp();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Close popups when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-popup') && !e.target.closest('#notifications')) {
                this.closeNotifications();
            }
            if (!e.target.closest('.quick-actions') && !e.target.closest('#quick-actions-toggle')) {
                this.closeQuickActions();
            }
        });
    }

    handleNavigation(navLink) {
        const page = navLink.dataset.page;
        const title = navLink.querySelector('.nav-text').textContent;
        
        // Update page title
        this.updatePageTitle(title, this.getPageSubtitle(page));
        
        // Update breadcrumb
        this.updateBreadcrumb(page, title);
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        navLink.classList.add('active');
    }

    updatePageTitle(title, subtitle = '') {
        const titleElement = document.getElementById('current-page-title');
        const subtitleElement = document.getElementById('current-page-subtitle');
        
        if (titleElement) titleElement.textContent = title;
        if (subtitleElement) subtitleElement.textContent = subtitle;
    }

    getPageSubtitle(page) {
        const subtitles = {
            'dashboard': 'Tổng quan về hoạt động giảng dạy',
            'create_exam': 'Tạo đề thi mới cho học sinh',
            'manage_exams': 'Quản lý và chỉnh sửa các đề thi',
            'view_results': 'Xem kết quả và đánh giá học sinh',
            'login_stats': 'Thống kê chi tiết về hoạt động'
        };
        return subtitles[page] || '';
    }

    updateBreadcrumb(page, title) {
        const breadcrumbList = document.getElementById('breadcrumb-list');
        if (!breadcrumbList) return;

        if (page === 'dashboard') {
            breadcrumbList.innerHTML = '<li><a href="#" data-page="dashboard">Trang chủ</a></li>';
        } else {
            breadcrumbList.innerHTML = `
                <li><a href="#" data-page="dashboard">Trang chủ</a></li>
                <li>${title}</li>
            `;
        }
    }

    loadNotifications() {
        // Simulate loading notifications
        this.notifications = [
            {
                id: 1,
                icon: '📝',
                text: 'Có 2 bài thi mới được nộp',
                time: '5 phút trước',
                unread: true
            },
            {
                id: 2,
                icon: '👥',
                text: 'Học sinh mới đăng ký lớp',
                time: '1 giờ trước',
                unread: true
            },
            {
                id: 3,
                icon: '⚠️',
                text: 'Hệ thống sẽ bảo trì vào 23:00',
                time: '2 giờ trước',
                unread: false
            }
        ];

        this.updateNotificationCount();
    }

    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => n.unread).length;
        const countElement = document.querySelector('.notification-count');
        if (countElement) {
            countElement.textContent = unreadCount;
            countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    toggleNotifications() {
        const popup = document.getElementById('notification-popup');
        if (popup) {
            popup.classList.toggle('active');
            if (popup.classList.contains('active')) {
                this.renderNotifications();
            }
        }
    }

    closeNotifications() {
        const popup = document.getElementById('notification-popup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    renderNotifications() {
        const container = document.querySelector('.popup-content');
        if (!container) return;

        const notificationsHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.unread ? 'unread' : ''}">
                <span class="notification-icon">${notification.icon}</span>
                <div class="notification-text">
                    <p>${notification.text}</p>
                    <small>${notification.time}</small>
                </div>
            </div>
        `).join('');

        container.innerHTML = notificationsHTML;
    }

    updateBadges() {
        // Update navigation badges with counts
        this.updateExamsBadge();
        this.updateResultsBadge();
    }

    async updateExamsBadge() {
        try {
            const response = await fetch('/api/exams');
            if (response.ok) {
                const exams = await response.json();
                const badgeElement = document.getElementById('exams-count');
                if (badgeElement && exams.length > 0) {
                    badgeElement.textContent = exams.length;
                    badgeElement.style.display = 'inline-block';
                }
            }
        } catch (error) {
            console.error('Error updating exams badge:', error);
        }
    }

    async updateResultsBadge() {
        try {
            const response = await fetch('/api/results');
            if (response.ok) {
                const results = await response.json();
                const badgeElement = document.getElementById('results-count');
                if (badgeElement && results.submissions && results.submissions.length > 0) {
                    badgeElement.textContent = results.submissions.length;
                    badgeElement.style.display = 'inline-block';
                }
            }
        } catch (error) {
            console.error('Error updating results badge:', error);
        }
    }

    initQuickActions() {
        // Initialize quick actions functionality
        const quickActionsBtn = document.getElementById('quick-actions-toggle');
        if (quickActionsBtn) {
            quickActionsBtn.addEventListener('click', () => {
                this.toggleQuickActions();
            });
        }
    }

    toggleQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    closeQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        if (menu) {
            menu.classList.remove('active');
        }
    }

    handleQuickAction(action) {
        this.closeQuickActions();
        
        switch (action) {
            case 'create-exam':
                this.quickCreateExam();
                break;
            case 'view-stats':
                this.quickViewStats();
                break;
            case 'backup':
                this.quickBackup();
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }

    quickCreateExam() {
        // Navigate to create exam page
        const createExamLink = document.querySelector('[data-page="create_exam"]');
        if (createExamLink) {
            createExamLink.click();
        }
        this.showToast('Chuyển đến trang tạo đề thi', 'info');
    }

    quickViewStats() {
        // Navigate to stats page
        const statsLink = document.querySelector('[data-page="login_stats"]');
        if (statsLink) {
            statsLink.click();
        }
        this.showToast('Chuyển đến trang thống kê', 'info');
    }

    quickBackup() {
        // Implement backup functionality
        this.showToast('Đang sao lưu dữ liệu...', 'info');
        
        // Simulate backup process
        setTimeout(() => {
            this.showToast('Sao lưu dữ liệu thành công!', 'success');
        }, 2000);
    }

    initSearch() {
        // Initialize global search functionality
        this.searchTimeout = null;
    }

    handleSearch(query) {
        clearTimeout(this.searchTimeout);
        
        if (query.length < 2) return;

        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
        
        // This would typically search through exams, students, results, etc.
        // For now, just show a toast
        this.showToast(`Tìm kiếm: "${query}"`, 'info');
    }

    showHelp() {
        // Show help modal or guide
        const helpContent = `
            <div class="help-modal">
                <div class="help-content">
                    <h3>Hướng dẫn sử dụng</h3>
                    <div class="help-section">
                        <h4>🏠 Trang chủ</h4>
                        <p>Xem tổng quan về hoạt động giảng dạy</p>
                    </div>
                    <div class="help-section">
                        <h4>✏️ Tạo đề thi</h4>
                        <p>Tạo đề thi mới với nhiều loại câu hỏi</p>
                    </div>
                    <div class="help-section">
                        <h4>📋 Quản lý đề thi</h4>
                        <p>Chỉnh sửa và quản lý các đề thi đã tạo</p>
                    </div>
                    <div class="help-section">
                        <h4>📈 Kết quả thi</h4>
                        <p>Xem kết quả và đánh giá học sinh</p>
                    </div>
                    <div class="help-section">
                        <h4>📊 Thống kê</h4>
                        <p>Xem báo cáo và thống kê chi tiết</p>
                    </div>
                    <div class="help-section">
                        <h4>⚡ Thao tác nhanh</h4>
                        <p>Sử dụng nút thao tác nhanh ở góc dưới bên phải</p>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Trợ giúp', helpContent);
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        // Add toast styles if not exist
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 100px;
                    right: 30px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideInRight 0.3s ease;
                }
                .toast-success { border-left: 4px solid #4ecdc4; }
                .toast-error { border-left: 4px solid #ff6b6b; }
                .toast-info { border-left: 4px solid #667eea; }
                .toast-icon { font-size: 18px; }
                .toast-message { color: #2d3748; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️',
            'warning': '⚠️'
        };
        return icons[type] || icons.info;
    }

    showModal(title, content) {
        // Create modal if not exists
        let modal = document.getElementById('dynamic-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dynamic-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">${title}</h3>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body" id="modal-body">
                        ${content}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Bind close event
            modal.querySelector('.close').addEventListener('click', () => {
                this.closeModal();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        } else {
            modal.querySelector('#modal-title').textContent = title;
            modal.querySelector('#modal-body').innerHTML = content;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('dynamic-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize teacher enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('teacher-layout')) {
        new TeacherEnhancements();
    }
});
