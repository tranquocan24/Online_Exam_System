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
        // Hiển thị thông tin user trong admin header
        const welcomeText = document.getElementById('welcome-text');
        const userInfo = document.getElementById('user-info');
        
        if (this.currentUser && welcomeText && userInfo) {
            welcomeText.textContent = `Xin chào, ${this.currentUser.name}`;
            userInfo.style.display = 'flex'; // Show user info
            console.log('User info displayed in admin header');
        } else {
            console.warn('Could not display user info - elements not found or no user');
        }
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
        console.log('Binding admin events...');
        
        // Tab navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        console.log('Found nav tabs:', navTabs.length);
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.target.dataset.tab;
                console.log('Tab clicked:', tabName);
                this.showTab(tabName);
            });
        });

        // Don't bind logout here - will be handled by main.js
        // But ensure logout button is visible and works
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Call main app logout
                if (window.app && window.app.logout) {
                    window.app.logout();
                } else {
                    // Fallback logout
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('sessionExpiry');
                    window.location.href = '/';
                }
            });
            console.log('Admin logout button bound');
        }
        
        // Add user button
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showUserModal();
            });
        }

        // User form - will be re-bound in bindModalEvents when modal opens
        // Don't bind here to avoid conflicts
        console.log('Initial user form binding skipped - will bind in modal');

        // Role change in user form - will be re-bound in modal
        // Don't bind here to avoid conflicts
        console.log('Initial role change binding skipped - will bind in modal');

        // Modal close buttons - will be re-bound in bindModalEvents when modal opens
        // Don't bind here to avoid conflicts
        console.log('Initial modal close binding skipped - will bind in modal');

        // User filters
        const userTypeFilter = document.getElementById('user-type-filter');
        if (userTypeFilter) {
            userTypeFilter.addEventListener('change', () => {
                this.filterUsers();
            });
        }

        const searchUsers = document.getElementById('search-users');
        if (searchUsers) {
            searchUsers.addEventListener('input', () => {
                this.filterUsers();
            });
        }

        // Settings
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('user-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        console.log('Admin events bound successfully');
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
        console.log('showUserModal called', { userId, userType });
        this.editingUserId = userId;
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        const title = document.getElementById('modal-title');
        
        if (!modal || !form || !title) {
            console.error('Modal elements not found', { modal: !!modal, form: !!form, title: !!title });
            return;
        }
        
        // Reset form first
        form.reset();
        
        // Reset handler flags to ensure re-binding
        form.hasCustomSubmitHandler = false;
        const submitBtn = document.querySelector('#user-form button[type="submit"]');
        if (submitBtn) submitBtn.hasCustomClickHandler = false;
        const roleSelect = document.getElementById('user-role');
        if (roleSelect) roleSelect.hasCustomChangeHandler = false;
        const cancelBtn = document.getElementById('cancel-user-btn');
        if (cancelBtn) cancelBtn.hasCustomClickHandler = false;
        const closeBtn = document.querySelector('#user-modal .close');
        if (closeBtn) closeBtn.hasCustomClickHandler = false;
        
        if (userId) {
            // Edit mode
            title.textContent = 'Chỉnh sửa tài khoản';
            const user = this.findUserInType(userId, userType);
            if (user) {
                // Wait a bit for form reset to take effect
                setTimeout(() => {
                    document.getElementById('user-username').value = user.username || '';
                    document.getElementById('user-password').value = user.password || '';
                    document.getElementById('user-name').value = user.name || '';
                    document.getElementById('user-role').value = user.role || 'student';
                    document.getElementById('user-class').value = user.class || '';
                    document.getElementById('user-subject').value = user.subject || '';
                    this.toggleUserFields(user.role);
                }, 50);
            }
        } else {
            // Add mode
            title.textContent = 'Thêm tài khoản mới';
            // Wait a bit for form reset to take effect
            setTimeout(() => {
                document.getElementById('user-role').value = 'student';
                this.toggleUserFields('student');
            }, 50);
        }
        
        // Show modal with proper display
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Bind modal events after form is ready
        setTimeout(() => {
            this.bindModalEvents();
        }, 100);
        
        console.log('Modal opened successfully');
    }

    // Bind events specifically for modal
    bindModalEvents() {
        console.log('Binding modal events...');
        
        // For form, we don't clone because it will lose the input values
        // Instead we use a different approach
        const form = document.getElementById('user-form');
        if (form) {
            // Remove existing submit listeners by setting a flag
            if (!form.hasCustomSubmitHandler) {
                form.addEventListener('submit', (e) => {
                    console.log('Modal form submit triggered via form event');
                    this.handleUserFormSubmit(e);
                });
                form.hasCustomSubmitHandler = true;
                console.log('Form submit event bound');
            }
        }
        
        // Also bind directly to submit button as backup
        const submitBtn = document.querySelector('#user-form button[type="submit"]');
        if (submitBtn && !submitBtn.hasCustomClickHandler) {
            submitBtn.addEventListener('click', (e) => {
                console.log('Submit button clicked directly');
                // Let the form submit event handle it, just log for debug
            });
            submitBtn.hasCustomClickHandler = true;
            console.log('Submit button click event bound');
        }

        // Backup: Direct binding to submit button with form data extraction
        const submitBtnBackup = document.querySelector('#user-form button[type="submit"]');
        if (submitBtnBackup) {
            submitBtnBackup.onclick = (e) => {
                console.log('Submit button onclick backup triggered');
                e.preventDefault();
                e.stopPropagation();
                
                // Create a fake form submit event
                const form = document.getElementById('user-form');
                const fakeEvent = new Event('submit');
                fakeEvent.preventDefault = () => {};
                
                this.handleUserFormSubmit(fakeEvent);
                return false;
            };
            console.log('Submit button onclick backup bound');
        }
        
        // Bind role change event
        const roleSelect = document.getElementById('user-role');
        if (roleSelect && !roleSelect.hasCustomChangeHandler) {
            roleSelect.addEventListener('change', (e) => {
                console.log('Role changed to:', e.target.value);
                this.toggleUserFields(e.target.value);
            });
            roleSelect.hasCustomChangeHandler = true;
            console.log('Role change event bound');
        }
        
        // Bind cancel button
        const cancelBtn = document.getElementById('cancel-user-btn');
        if (cancelBtn && !cancelBtn.hasCustomClickHandler) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked');
                this.closeModal();
            });
            cancelBtn.hasCustomClickHandler = true;
            console.log('Cancel button event bound');
        }
        
        // Bind close button (X)
        const closeBtn = document.querySelector('#user-modal .close');
        if (closeBtn && !closeBtn.hasCustomClickHandler) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                this.closeModal();
            });
            closeBtn.hasCustomClickHandler = true;
            console.log('Close button event bound');
        }
        
        // === BACKUP HANDLERS MOVED HERE ===
        // Set backup handlers after other events are bound
        setTimeout(() => {
            const saveButton = document.querySelector('#user-form button[type="submit"]');
            if (saveButton) {
                // Keep existing handlers but add backup onclick
                const originalOnClick = saveButton.onclick;
                
                saveButton.onclick = (event) => {
                    console.log('=== BACKUP SAVE BUTTON CLICKED ===');
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Call handleUserFormSubmit directly with proper context
                    this.handleUserFormSubmit(event);
                    
                    return false;
                };
                
                console.log('Backup save button handler set');
            }
        }, 100);
        
        console.log('Modal events bound successfully');
    }

    findUserInType(userId, userType) {
        if (!this.users || !userType) return null;
        
        const users = this.users[userType + 's'] || [];
        return users.find(user => user.id === userId);
    }

    toggleUserFields(role) {
        console.log('toggleUserFields called with role:', role);
        const studentFields = document.getElementById('student-fields');
        const teacherFields = document.getElementById('teacher-fields');
        
        if (!studentFields || !teacherFields) {
            console.error('Student or teacher fields not found');
            return;
        }
        
        studentFields.style.display = role === 'student' ? 'block' : 'none';
        teacherFields.style.display = role === 'teacher' ? 'block' : 'none';
        
        // Set required attributes
        const classField = document.getElementById('user-class');
        const subjectField = document.getElementById('user-subject');
        
        if (classField) {
            classField.required = role === 'student';
        }
        if (subjectField) {
            subjectField.required = role === 'teacher';
        }
        
        console.log('User fields toggled successfully');
    }

    async handleUserFormSubmit(e) {
        e.preventDefault();
        console.log('=== Form submit triggered ===');
        console.log('Event:', e);
        console.log('Form element:', e.target);
        
        const usernameEl = document.getElementById('user-username');
        const passwordEl = document.getElementById('user-password');
        const nameEl = document.getElementById('user-name');
        const roleEl = document.getElementById('user-role');
        
        console.log('Form elements found:', {
            username: !!usernameEl,
            password: !!passwordEl,
            name: !!nameEl,
            role: !!roleEl
        });
        
        if (!usernameEl || !passwordEl || !nameEl || !roleEl) {
            console.error('Form elements not found');
            this.showAlert('Lỗi: Không tìm thấy các trường dữ liệu', 'error');
            return;
        }
        
        const userData = {
            username: usernameEl.value.trim(),
            password: passwordEl.value,
            name: nameEl.value.trim(),
            role: roleEl.value
        };
        
        console.log('User data collected:', userData);

        // Validate required fields
        if (!userData.username || !userData.password || !userData.name || !userData.role) {
            console.log('Validation failed - missing required fields');
            this.showAlert('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        // Add role-specific fields
        if (userData.role === 'student') {
            const classEl = document.getElementById('user-class');
            userData.class = classEl ? classEl.value.trim() : '';
            console.log('Student class:', userData.class);
            if (!userData.class) {
                this.showAlert('Vui lòng nhập lớp cho học sinh', 'error');
                return;
            }
        } else if (userData.role === 'teacher') {
            const subjectEl = document.getElementById('user-subject');
            userData.subject = subjectEl ? subjectEl.value.trim() : '';
            console.log('Teacher subject:', userData.subject);
            if (!userData.subject) {
                this.showAlert('Vui lòng nhập môn học cho giáo viên', 'error');
                return;
            }
        }

        console.log('Final user data:', userData);

        try {
            let response;
            if (this.editingUserId) {
                // Update user
                userData.id = this.editingUserId;
                console.log('Updating user:', userData);
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
                console.log('Creating new user:', userData);
                response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', response.headers);

            if (response.ok) {
                console.log('User saved successfully');
                const responseData = await response.json();
                console.log('Response data:', responseData);
                
                this.showAlert(
                    this.editingUserId ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản thành công!',
                    'success'
                );
                this.closeModal();
                await this.loadAllData();
                this.displayUsers();
            } else {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: errorText || 'Server error' };
                }
                
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
        console.log('closeModal called');
        const modal = document.getElementById('user-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
            console.log('Modal closed');
        } else {
            console.error('Modal not found when trying to close');
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

    // Debug method to test form submission manually
    testFormSubmit() {
        console.log('=== TESTING FORM SUBMIT ===');
        const form = document.getElementById('user-form');
        if (form) {
            const fakeEvent = { preventDefault: () => {} };
            this.handleUserFormSubmit(fakeEvent);
        } else {
            console.error('Form not found for testing');
        }
    }
}

// Export AdminPanel class to global scope for main.js to access
window.AdminPanel = AdminPanel;

// Auto-initialize if we're on admin page and not already initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.adminPanel && window.location.pathname.includes('admin')) {
            console.log('Auto-initializing AdminPanel...');
            window.adminPanel = new AdminPanel();
        }
    });
} else {
    // DOM already loaded
    if (!window.adminPanel && (window.location.pathname.includes('admin') || document.getElementById('user-modal'))) {
        console.log('Auto-initializing AdminPanel (DOM ready)...');
        window.adminPanel = new AdminPanel();
    }
}
