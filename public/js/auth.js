// auth.js - Xử lý đăng nhập và phân quyền

class Auth {
    constructor() {
        this.users = null;
        this.init();
    }

    async init() {
        // Load danh sách users từ server
        await this.loadUsers();
        
        // Bind form events nếu có form login
        this.bindLoginForm();
    }

    // Load danh sách users từ server
    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                this.users = await response.json();
            } else {
                // Fallback: sử dụng dữ liệu mẫu
                this.users = this.getDefaultUsers();
            }
        } catch (error) {
            console.log('Sử dụng dữ liệu mẫu');
            this.users = this.getDefaultUsers();
        }
    }

    // Dữ liệu users mẫu
    getDefaultUsers() {
        return {
            students: [
                {
                    id: "SV001",
                    username: "sv001",
                    password: "123456",
                    name: "Nguyễn Văn A",
                    class: "CNTT01",
                    role: "student"
                },
                {
                    id: "SV002",
                    username: "sv002",
                    password: "123456",
                    name: "Trần Thị B",
                    class: "CNTT01",
                    role: "student"
                }
            ],
            teachers: [
                {
                    id: "GV001",
                    username: "gv001",
                    password: "123456",
                    name: "PGS.TS Nguyễn Văn C",
                    subject: "Lập trình Web",
                    role: "teacher"
                }
            ],
            admins: [
                {
                    id: "AD001",
                    username: "admin",
                    password: "admin123",
                    name: "Quản trị viên hệ thống",
                    role: "admin"
                }
            ]
        };
    }

    // Bind events cho form đăng nhập
    bindLoginForm() {
        console.log('Binding login form events...');
        
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Remove existing event listeners to prevent duplicates
            const newForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newForm, loginForm);
            
            // Bind new event listener
            newForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Auto-fill remembered username
        this.loadRememberedUser();

        // Thêm demo accounts với retry để đảm bảo được thêm
        this.addDemoAccountsInfo();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
    }

    // Load remembered username
    loadRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberUser');
        if (rememberedUser) {
            const usernameField = document.getElementById('username');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (usernameField) {
                usernameField.value = rememberedUser;
            }
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }

    // Add keyboard shortcuts
    addKeyboardShortcuts() {
        // Remove existing keyboard shortcuts first
        if (this._keyboardHandler) {
            document.removeEventListener('keydown', this._keyboardHandler);
        }
        
        // Create new handler
        this._keyboardHandler = (e) => {
            // Alt + L to focus on login form
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                const usernameField = document.getElementById('username');
                if (usernameField) {
                    usernameField.focus();
                }
            }
            
            // Escape to clear form
            if (e.key === 'Escape') {
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.reset();
                    this.showMessage('', 'info');
                }
            }
        };
        
        document.addEventListener('keydown', this._keyboardHandler);
    }

    // Hiển thị thông tin tài khoản demo
    addDemoAccountsInfo() {
        // Demo accounts section has been removed for production use
        // Login form will work normally without showing demo credentials
        console.log('Demo accounts display disabled');
    }

    // Fill demo account info
    static fillDemoAccount(username, password) {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const messageDiv = document.getElementById('loginMessage');
        
        if (usernameField && passwordField) {
            usernameField.value = username;
            passwordField.value = password;
            
            // Show feedback
            if (messageDiv) {
                messageDiv.textContent = `Đã điền thông tin tài khoản ${username === 'sv001' ? 'sinh viên' : 'giáo viên'}`;
                messageDiv.className = 'login-message info';
            }
            
            // Focus on submit button
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.focus();
            }
        }
    }

    // Xử lý đăng nhập
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        const messageDiv = document.getElementById('loginMessage');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Clear previous messages
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'login-message';
        }
        
        // Validate input
        const validation = this.validateLoginInput(username, password);
        if (!validation.isValid) {
            this.showMessage(validation.message, 'error');
            return;
        }
        
        // Disable submit button và show loading
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang đăng nhập...';
        }
        this.showMessage('Đang xác thực thông tin...', 'info');
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = this.validateCredentials(username, password);
            
            if (user) {
                // Log successful login
                this.logLoginAttempt(username, true);
                
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberUser', username);
                } else {
                    localStorage.removeItem('rememberUser');
                }
                
                this.showMessage('Đăng nhập thành công!', 'success');
                
                // Delay để user thấy thông báo thành công
                setTimeout(() => {
                    if (window.app) {
                        window.app.handleLoginSuccess(user);
                    } else {
                        // Fallback: wait for app to be ready
                        this.waitForAppAndLogin(user);
                    }
                }, 500);
            } else {
                // Log failed login
                this.logLoginAttempt(username, false);
                this.showMessage('Tên đăng nhập hoặc mật khẩu không đúng', 'error');
                
                // Security: add delay after failed login
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Lỗi hệ thống, vui lòng thử lại sau', 'error');
        } finally {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đăng nhập';
            }
        }
    }

    // Validate login input
    validateLoginInput(username, password) {
        if (!username || !password) {
            return {
                isValid: false,
                message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
            };
        }
        
        if (username.length < 3) {
            return {
                isValid: false,
                message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
            };
        }
        
        if (password.length < 6) {
            return {
                isValid: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự'
            };
        }
        
        // Check for basic injection attempts
        const dangerousChars = ['<', '>', '"', "'", '&', 'script', 'SELECT', 'DROP'];
        const inputText = (username + password).toLowerCase();
        for (const char of dangerousChars) {
            if (inputText.includes(char.toLowerCase())) {
                return {
                    isValid: false,
                    message: 'Thông tin đăng nhập chứa ký tự không hợp lệ'
                };
            }
        }
        
        return { isValid: true };
    }

    // Log login attempts (simple security logging)
    logLoginAttempt(username, success) {
        const timestamp = new Date().toISOString();
        const attempt = {
            username,
            success,
            timestamp,
            ip: 'localhost' // In real app, get actual IP
        };
        
        // Store in localStorage for demo (in real app, send to server)
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
        attempts.push(attempt);
        
        // Keep only last 10 attempts
        if (attempts.length > 10) {
            attempts.splice(0, attempts.length - 10);
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    // Validate thông tin đăng nhập
    validateCredentials(username, password) {
        if (!this.users) return null;
        
        // Kiểm tra trong danh sách sinh viên
        if (this.users.students) {
            for (const student of this.users.students) {
                if (student.username === username && student.password === password) {
                    return student;
                }
            }
        }
        
        // Kiểm tra trong danh sách giáo viên
        if (this.users.teachers) {
            for (const teacher of this.users.teachers) {
                if (teacher.username === username && teacher.password === password) {
                    return teacher;
                }
            }
        }
        
        // Kiểm tra trong danh sách admin
        if (this.users.admins) {
            for (const admin of this.users.admins) {
                if (admin.username === username && admin.password === password) {
                    return admin;
                }
            }
        }
        
        return null;
    }

    // Wait for app to be ready then login
    waitForAppAndLogin(user) {
        const checkApp = () => {
            if (window.app) {
                window.app.handleLoginSuccess(user);
            } else {
                setTimeout(checkApp, 100);
            }
        };
        checkApp();
    }

    // Hiển thị thông báo
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('loginMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `login-message ${type}`;
        }
    }

    // Kiểm tra quyền truy cập
    hasPermission(user, action) {
        if (!user) return false;
        
        const permissions = {
            student: ['view_exams', 'take_exam', 'view_results'],
            teacher: ['create_exam', 'manage_exams', 'view_all_results', 'edit_exam']
        };
        
        return permissions[user.role]?.includes(action) || false;
    }

    // Lấy thông tin user hiện tại
    getCurrentUser() {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    }

    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        if (window.app) {
            window.app.logout();
        }
    }
}

// Khởi tạo Auth khi script được load (chỉ nếu chưa có)
if (!window.Auth) {
    window.Auth = new Auth();
}
