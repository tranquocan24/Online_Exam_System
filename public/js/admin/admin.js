// admin.js - Quản lý giao diện admin

class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.users = null;
        this.exams = null;
        this.results = null;
        this.currentUser = null;
        this.editingUserId = null;
        
        this.init();
    }

    async init() {
        console.log('AdminPanel init started');
        
        // Kiểm tra quyền admin
        this.currentUser = this.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '/';
            return;
        }

        console.log('Admin user verified:', this.currentUser);

        // Hiển thị thông tin user
        this.displayUserInfo();
        
        // Load dữ liệu
        await this.loadAllData();
        
        // Bind events
        this.bindEvents();
        
        // Hiển thị tab mặc định
        this.showTab('dashboard');
        
        console.log('AdminPanel init completed');
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    displayUserInfo() {
        // User info đã được hiển thị bởi main.js ở header
        // Không cần làm gì thêm ở đây
        console.log('User info already displayed in header by main.js');
    }

    async loadAllData() {
        try {
            // Load users
            const usersResponse = await fetch('/api/users');
            if (usersResponse.ok) {
                this.users = await usersResponse.json();
            }
            
            // Load exams
            const examsResponse = await fetch('/api/exams');
            if (examsResponse.ok) {
                this.exams = await examsResponse.json();
            }
            
            // Load results
            const resultsResponse = await fetch('/api/results');
            if (resultsResponse.ok) {
                this.results = await resultsResponse.json();
            }
            
            // Cập nhật dashboard
            this.updateDashboard();
            
        } catch (error) {
            console.error('Lỗi khi load dữ liệu:', error);
            this.showAlert('Có lỗi khi tải dữ liệu', 'error');
        }
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                this.showTab(tabName);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = '/';
        });

        // Add user button
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.showUserModal();
        });

        // User form
        document.getElementById('user-form').addEventListener('submit', (e) => {
            this.handleUserFormSubmit(e);
        });

        // Role change in user form
        document.getElementById('user-role').addEventListener('change', (e) => {
            this.toggleUserFields(e.target.value);
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-user-btn').addEventListener('click', () => {
            this.closeModal();
        });

        // User filters
        document.getElementById('user-type-filter').addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('search-users').addEventListener('input', () => {
            this.filterUsers();
        });

        // Settings
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('reset-settings-btn').addEventListener('click', () => {
            this.resetSettings();
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('user-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    showTab(tabName) {
        console.log('showTab called with:', tabName);
        
        // Hide all tabs
        const allTabs = document.querySelectorAll('.tab-content');
        console.log('Found tabs:', allTabs.length);
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active from nav tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        console.log('Found nav tabs:', navTabs.length);
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        const targetTab = document.getElementById(tabName + '-tab');
        const targetNavTab = document.querySelector(`[data-tab="${tabName}"]`);
        
        console.log('Target tab:', targetTab);
        console.log('Target nav tab:', targetNavTab);
        
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('Tab not found:', tabName + '-tab');
        }
        
        if (targetNavTab) {
            targetNavTab.classList.add('active');
        } else {
            console.error('Nav tab not found for:', tabName);
        }

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'users':
                this.displayUsers();
                break;
            case 'stats':
                this.displayStats();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    updateDashboard() {
        if (!this.users) return;

        // Count statistics
        const totalStudents = this.users.students ? this.users.students.length : 0;
        const totalTeachers = this.users.teachers ? this.users.teachers.length : 0;
        const totalExams = this.exams && this.exams.exams ? this.exams.exams.length : 0;
        const todayAttempts = this.getTodayAttempts();

        // Update stats display
        document.getElementById('total-students').textContent = totalStudents;
        document.getElementById('total-teachers').textContent = totalTeachers;
        document.getElementById('total-exams').textContent = totalExams;
        document.getElementById('today-attempts').textContent = todayAttempts;

        // Update recent activities
        this.displayRecentActivities();
    }

    getTodayAttempts() {
        if (!this.results || !this.results.results) return 0;
        
        const today = new Date().toDateString();
        return this.results.results.filter(result => {
            const resultDate = new Date(result.submittedAt).toDateString();
            return resultDate === today;
        }).length;
    }

    displayRecentActivities() {
        const container = document.getElementById('recent-activities-list');
        if (!this.results || !this.results.results) {
            container.innerHTML = '<p class="empty-state">Chưa có hoạt động nào</p>';
            return;
        }

        // Get recent results (last 5)
        const recentResults = this.results.results
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

        if (recentResults.length === 0) {
            container.innerHTML = '<p class="empty-state">Chưa có hoạt động nào</p>';
            return;
        }

        const activities = recentResults.map(result => {
            const student = this.findUserById(result.studentId);
            const exam = this.findExamById(result.examId);
            const timeAgo = this.getTimeAgo(result.submittedAt);
            
            return `
                <div class="activity-item">
                    <strong>${student ? student.name : 'N/A'}</strong> 
                    đã hoàn thành bài thi 
                    <strong>${exam ? exam.title : 'N/A'}</strong>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = activities;
    }

    findUserById(userId) {
        if (!this.users) return null;
        
        const allUsers = [
            ...(this.users.students || []),
            ...(this.users.teachers || []),
            ...(this.users.admins || [])
        ];
        
        return allUsers.find(user => user.id === userId);
    }

    findExamById(examId) {
        if (!this.exams || !this.exams.exams) return null;
        return this.exams.exams.find(exam => exam.id === examId);
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
            return `${diffMins} phút trước`;
        } else if (diffHours < 24) {
            return `${diffHours} giờ trước`;
        } else {
            return `${diffDays} ngày trước`;
        }
    }

    displayUsers() {
        if (!this.users) return;

        const tbody = document.getElementById('users-table-body');
        const allUsers = [
            ...(this.users.students || []).map(user => ({...user, type: 'student'})),
            ...(this.users.teachers || []).map(user => ({...user, type: 'teacher'})),
            ...(this.users.admins || []).map(user => ({...user, type: 'admin'}))
        ];

        const rows = allUsers.map(user => {
            const additionalInfo = this.getUserAdditionalInfo(user);
            const isProtectedAdmin = user.id === 'AD001'; // Bảo vệ admin chính
            
            return `
                <tr data-user-id="${user.id}" data-user-type="${user.type}">
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.name}</td>
                    <td><span class="user-role ${user.role}">${this.getRoleDisplayName(user.role)}</span></td>
                    <td>${additionalInfo}</td>
                    <td>
                        <div class="user-actions">
                            <button class="btn-sm btn-edit" onclick="adminPanel.editUser('${user.id}', '${user.type}')">
                                Sửa
                            </button>
                            ${isProtectedAdmin ? 
                                '<span class="protected-user" title="Tài khoản này được bảo vệ">🔒 Bảo vệ</span>' :
                                `<button class="btn-sm btn-delete" onclick="adminPanel.deleteUser('${user.id}', '${user.type}')">
                                    Xóa
                                </button>`
                            }
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    getUserAdditionalInfo(user) {
        switch (user.role) {
            case 'student':
                return user.class || 'N/A';
            case 'teacher':
                return user.subject || 'N/A';
            default:
                return '-';
        }
    }

    getRoleDisplayName(role) {
        switch (role) {
            case 'student': return 'Học sinh';
            case 'teacher': return 'Giáo viên';
            case 'admin': return 'Quản trị viên';
            default: return role;
        }
    }

    filterUsers() {
        const typeFilter = document.getElementById('user-type-filter').value;
        const searchTerm = document.getElementById('search-users').value.toLowerCase();
        
        const rows = document.querySelectorAll('#users-table-body tr');
        
        rows.forEach(row => {
            const userType = row.dataset.userType;
            const username = row.children[1].textContent.toLowerCase();
            const name = row.children[2].textContent.toLowerCase();
            
            const typeMatch = typeFilter === 'all' || userType === typeFilter;
            const searchMatch = username.includes(searchTerm) || name.includes(searchTerm);
            
            row.style.display = typeMatch && searchMatch ? '' : 'none';
        });
    }

    showUserModal(userId = null, userType = null) {
        this.editingUserId = userId;
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form || !title) {
            console.error('Modal elements not found');
            return;
        }
        
        if (userId) {
            // Edit mode
            title.textContent = 'Chỉnh sửa tài khoản';
            const user = this.findUserInType(userId, userType);
            if (user) {
                document.getElementById('user-username').value = user.username;
                document.getElementById('user-password').value = user.password;
                document.getElementById('user-name').value = user.name;
                document.getElementById('user-role').value = user.role;
                document.getElementById('user-class').value = user.class || '';
                document.getElementById('user-subject').value = user.subject || '';
                this.toggleUserFields(user.role);
            }
        } else {
            // Add mode
            title.textContent = 'Thêm tài khoản mới';
            form.reset();
            this.toggleUserFields('student');
        }
        
        // Show modal with proper display
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    findUserInType(userId, userType) {
        if (!this.users || !userType) return null;
        
        const users = this.users[userType + 's'] || [];
        return users.find(user => user.id === userId);
    }

    toggleUserFields(role) {
        const studentFields = document.getElementById('student-fields');
        const teacherFields = document.getElementById('teacher-fields');
        
        studentFields.style.display = role === 'student' ? 'block' : 'none';
        teacherFields.style.display = role === 'teacher' ? 'block' : 'none';
        
        // Set required attributes
        document.getElementById('user-class').required = role === 'student';
        document.getElementById('user-subject').required = role === 'teacher';
    }

    async handleUserFormSubmit(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('user-username').value,
            password: document.getElementById('user-password').value,
            name: document.getElementById('user-name').value,
            role: document.getElementById('user-role').value
        };

        // Add role-specific fields
        if (userData.role === 'student') {
            userData.class = document.getElementById('user-class').value;
        } else if (userData.role === 'teacher') {
            userData.subject = document.getElementById('user-subject').value;
        }

        try {
            let response;
            if (this.editingUserId) {
                // Update user
                userData.id = this.editingUserId;
                response = await fetch(`/api/users/${this.editingUserId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // Create new user
                userData.id = this.generateUserId(userData.role);
                response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            if (response.ok) {
                this.showAlert(
                    this.editingUserId ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản thành công!',
                    'success'
                );
                this.closeModal();
                await this.loadAllData();
                this.displayUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showAlert(error.message || 'Có lỗi khi lưu tài khoản', 'error');
        }
    }

    generateUserId(role) {
        let prefix;
        if (role === 'student') {
            prefix = 'SV';
        } else if (role === 'teacher') {
            prefix = 'GV';
        } else {
            prefix = 'AD';
        }
        
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}${timestamp}`;
    }

    async editUser(userId, userType) {
        this.showUserModal(userId, userType);
    }

    async deleteUser(userId, userType) {
        // Kiểm tra tài khoản được bảo vệ
        if (userId === 'AD001') {
            this.showAlert('Không thể xóa tài khoản quản trị viên chính!', 'error');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showAlert('Xóa tài khoản thành công!', 'success');
                await this.loadAllData();
                this.displayUsers();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showAlert(error.message || 'Có lỗi khi xóa tài khoản', 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
        }
        this.editingUserId = null;
    }

    displayStats() {
        // Placeholder for charts - would need Chart.js or similar library
        console.log('Displaying statistics...');
    }

    loadSettings() {
        // Load current settings from localStorage or server
        const settings = this.getSettings();
        
        document.getElementById('system-name').value = settings.systemName || 'Hệ thống thi online';
        document.getElementById('default-exam-time').value = settings.defaultExamTime || 60;
        document.getElementById('allow-registration').checked = settings.allowRegistration || false;
        document.getElementById('min-password-length').value = settings.minPasswordLength || 6;
        document.getElementById('session-timeout').value = settings.sessionTimeout || 30;
    }

    getSettings() {
        const settings = localStorage.getItem('systemSettings');
        return settings ? JSON.parse(settings) : {};
    }

    saveSettings() {
        const settings = {
            systemName: document.getElementById('system-name').value,
            defaultExamTime: parseInt(document.getElementById('default-exam-time').value),
            allowRegistration: document.getElementById('allow-registration').checked,
            minPasswordLength: parseInt(document.getElementById('min-password-length').value),
            sessionTimeout: parseInt(document.getElementById('session-timeout').value)
        };

        localStorage.setItem('systemSettings', JSON.stringify(settings));
        this.showAlert('Lưu cài đặt thành công!', 'success');
    }

    resetSettings() {
        if (confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
            localStorage.removeItem('systemSettings');
            this.loadSettings();
            this.showAlert('Đã đặt lại cài đặt mặc định!', 'info');
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // Insert at top of container
        const container = document.getElementById('app-container');
        container.insertBefore(alert, container.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

// Export AdminPanel class to global scope for main.js to access
window.AdminPanel = AdminPanel;
