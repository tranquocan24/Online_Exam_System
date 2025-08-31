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
        const tryAddDemo = () => {
            // Try both the placeholder and the container
            const placeholder = document.getElementById('demo-accounts-placeholder');
            const container = document.querySelector('.login-container');
            const targetElement = placeholder || container;
            
            // Kiểm tra xem demo info đã tồn tại chưa
            if (document.querySelector('.demo-accounts')) {
                console.log('Demo accounts already added');
                return;
            }
            
            if (targetElement) {
                console.log('Adding demo accounts info to:', targetElement.id || targetElement.className);
                const demoInfo = document.createElement('div');
                demoInfo.className = 'demo-accounts';
                demoInfo.innerHTML = `
                    <div class="demo-info">
                        <h4>Tài khoản demo:</h4>
                        <div class="demo-grid">
                            <div class="demo-account" onclick="Auth.fillDemoAccount('sv001', '123456')">
                                <strong>Sinh viên:</strong><br>
                                Username: sv001<br>
                                Password: 123456<br>
                                <small>Click để điền tự động</small>
                            </div>
                            <div class="demo-account" onclick="Auth.fillDemoAccount('gv001', '123456')">
                                <strong>Giáo viên:</strong><br>
                                Username: gv001<br>
                                Password: 123456<br>
                                <small>Click để điền tự động</small>
                            </div>
                            <div class="demo-account" onclick="Auth.fillDemoAccount('admin', 'admin123')">
                                <strong>Quản trị viên:</strong><br>
                                Username: admin<br>
                                Password: admin123<br>
                                <small>Click để điền tự động</small>
                            </div>
                        </div>
                        <div class="keyboard-shortcuts">
                            <small>
                                💡 <strong>Phím tắt:</strong> Alt+L để focus vào form, Esc để xóa form
                            </small>
                        </div>
                    </div>
                `;
                
                // Thêm CSS cho demo info nếu chưa có
                if (!document.querySelector('#demo-accounts-styles')) {
                    const style = document.createElement('style');
                    style.id = 'demo-accounts-styles';
                    style.textContent = `
                        .demo-accounts {
                            margin-top: 20px;
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            border-left: 4px solid #667eea;
                        }
                        .demo-info h4 {
                            margin-bottom: 15px;
                            color: #2d3748;
                        }
                        .demo-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 15px;
                            margin-bottom: 15px;
                        }
                        .demo-account {
                            background: white;
                            padding: 15px;
                            border-radius: 6px;
                            font-size: 14px;
                            line-height: 1.4;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            border: 2px solid transparent;
                        }
                        .demo-account:hover {
                            border-color: #667eea;
                            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
                            transform: translateY(-1px);
                        }
                        .demo-account small {
                            color: #667eea;
                            font-style: italic;
                            display: block;
                            margin-top: 5px;
                        }
                        .keyboard-shortcuts {
                            text-align: center;
                            padding: 10px;
                            background: rgba(102, 126, 234, 0.1);
                            border-radius: 4px;
                        }
                        .keyboard-shortcuts small {
                            color: #4a5568;
                        }
                        @media (max-width: 480px) {
                            .demo-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // If using placeholder, replace it; if using container, append to it
                if (placeholder) {
                    placeholder.parentNode.replaceChild(demoInfo, placeholder);
                } else {
                    container.appendChild(demoInfo);
                }
                
            } else {
                console.log('No target element found for demo accounts, retrying...');
                // Retry sau 100ms nếu container chưa sẵn sàng
                setTimeout(tryAddDemo, 100);
            }
        };
        
        // Thực hiện ngay lập tức hoặc khi DOM sẵn sàng
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryAddDemo);
        } else {
            tryAddDemo();
        }
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
