// main.js - Xử lý layout cấp 1 và load content động

class App {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentPage = null;
        this.init();
    }

    init() {
        // Kiểm tra session khi load trang
        this.checkSession();

        // Bind events
        this.bindEvents();

        // Load trang đăng nhập nếu chưa đăng nhập
        if (!this.currentUser) {
            this.loadLoginPage();
        }
    }

    bindEvents() {
        // Sự kiện đăng xuất sẽ được bind sau khi layout được load
        // Không bind ở đây để tránh conflict
    }

    // Kiểm tra session đơn giản (localStorage)
    checkSession() {
        const savedUser = localStorage.getItem('currentUser');
        const sessionExpiry = localStorage.getItem('sessionExpiry');

        if (savedUser && sessionExpiry) {
            const now = new Date().getTime();
            const expiry = parseInt(sessionExpiry);

            if (now > expiry) {
                // Session expired
                this.clearExpiredSession();
                this.showSessionExpiredMessage();
                return;
            }

            // Extend session
            this.extendSession();

            this.currentUser = JSON.parse(savedUser);
            this.currentRole = this.currentUser.role;
            this.showUserInfo();
            this.loadRoleLayout();
        }
    }

    // Clear expired session
    clearExpiredSession() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiry');
        this.currentUser = null;
        this.currentRole = null;
    }

    // Show session expired message
    showSessionExpiredMessage() {
        const container = document.getElementById('app-container');
        if (container) {
            container.innerHTML = `
                <div class="session-expired">
                    <div class="message-card">
                        <h3>Phiên đăng nhập đã hết hạn</h3>
                        <p>Vui lòng đăng nhập lại để tiếp tục sử dụng.</p>
                        <button onclick="window.app.loadLoginPage()" class="btn btn-primary">
                            Đăng nhập lại
                        </button>
                    </div>
                </div>
            `;

            // Add styles for session expired message
            const style = document.createElement('style');
            style.textContent = `
                .session-expired {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 400px;
                }
                .message-card {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    text-align: center;
                    border-top: 4px solid #e53e3e;
                }
                .message-card h3 {
                    color: #e53e3e;
                    margin-bottom: 10px;
                }
                .message-card p {
                    color: #718096;
                    margin-bottom: 20px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Extend session
    extendSession() {
        const sessionDuration = 30 * 60 * 1000; // 30 minutes
        const newExpiry = new Date().getTime() + sessionDuration;
        localStorage.setItem('sessionExpiry', newExpiry.toString());
    }

    // Create session
    createSession(user) {
        const sessionDuration = 30 * 60 * 1000; // 30 minutes
        const expiry = new Date().getTime() + sessionDuration;

        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionExpiry', expiry.toString());
        localStorage.setItem('loginTime', new Date().toISOString());
    }

    // Hiển thị thông tin user đã đăng nhập
    showUserInfo() {
        const userInfo = document.getElementById('user-info');
        const welcomeText = document.getElementById('welcome-text');
        const headerTitle = document.querySelector('#main-header h1');

        if (this.currentUser && userInfo && welcomeText) {
            let roleText = '';
            switch (this.currentUser.role) {
                case 'admin':
                    roleText = 'Quản trị viên';
                    if (headerTitle) {
                        headerTitle.textContent = 'Quản trị hệ thống';
                    }
                    break;
                case 'teacher':
                    roleText = 'Giáo viên';
                    if (headerTitle) {
                        headerTitle.textContent = 'Hệ thống thi online - Giáo viên';
                    }
                    break;
                case 'student':
                    roleText = 'Học sinh';
                    if (headerTitle) {
                        headerTitle.textContent = 'Hệ thống thi online - Học sinh';
                    }
                    break;
                default:
                    roleText = '';
            }

            welcomeText.textContent = `Xin chào, ${this.currentUser.name} (${roleText})`;
            userInfo.style.display = 'flex';
        }
    }

    // Ẩn thông tin user
    hideUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }

    // Load trang đăng nhập
    async loadLoginPage() {
        try {
            const response = await fetch('content/login.html');
            const html = await response.text();
            this.renderContent(html);

            // Load auth.js nếu chưa có
            if (!window.Auth) {
                await this.loadScript('js/auth.js');
                // Wait a bit for Auth to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Lỗi load trang đăng nhập:', error);
            this.renderContent('<p>Lỗi tải trang đăng nhập</p>');
        }
    }

    // Load layout theo role
    async loadRoleLayout() {
        try {
            let layoutFile = '';
            let cssFile = '';

            if (this.currentRole === 'student') {
                layoutFile = 'student.html';
                cssFile = 'css/student.css';
            } else if (this.currentRole === 'teacher') {
                layoutFile = 'teacher.html';
                cssFile = 'css/teacher.css';
            } else if (this.currentRole === 'admin') {
                // Admin sử dụng approach khác - load content trực tiếp
                cssFile = 'css/admin.css';

                // Add admin class to body for special styling
                document.body.classList.add('admin-mode');

                // Keep main header visible for logout button, hide footer
                const mainHeader = document.getElementById('main-header');
                if (mainHeader) {
                    mainHeader.style.display = '';
                }

                const mainFooter = document.getElementById('main-footer');
                if (mainFooter) {
                    mainFooter.style.display = 'none';
                }

                // Load CSS cho admin
                await this.loadCSS(cssFile);

                // Load admin content trực tiếp
                const response = await fetch('admin-content.html');
                const html = await response.text();
                this.renderContent(html);

                // Load admin script
                await this.loadRoleScripts();

                // Admin content đã bao gồm layout, không cần load page
                return;
            } else {
                // Show main header/footer for other roles (not admin)
                const mainHeader = document.getElementById('main-header');
                if (mainHeader) {
                    mainHeader.style.display = '';
                }

                const mainFooter = document.getElementById('main-footer');
                if (mainFooter) {
                    mainFooter.style.display = '';
                }

                // Remove admin mode regardless of current role
                document.body.classList.remove('admin-mode');
            }

            // Load CSS riêng cho role
            await this.loadCSS(cssFile);

            // Load layout HTML
            const response = await fetch(layoutFile);
            const html = await response.text();
            this.renderContent(html);

            // Load role-specific scripts
            await this.loadRoleScripts();

            // Bind logout button for all roles after layout is loaded
            if (this.currentRole !== 'admin') {
                setTimeout(() => {
                    this.bindLogoutButton();
                }, 200);
            }

            // Bind navigation events
            this.bindNavigationEvents();

            // Load dashboard mặc định (chỉ cho student và teacher)
            if (this.currentRole !== 'admin') {
                this.loadPage('dashboard');
            }
            // Admin không cần loadPage vì layout đã có sẵn tất cả content

        } catch (error) {
            console.error('Lỗi load layout:', error);
            this.renderContent('<p>Lỗi tải giao diện</p>');
        }
    }

    // Load role-specific scripts
    async loadRoleScripts() {
        try {
            if (this.currentRole === 'admin') {
                // Load admin script
                console.log('Loading admin script...');
                await this.loadScript('js/admin/admin.js');

                // Initialize admin panel after script is loaded
                console.log('Initializing admin panel...');
                setTimeout(() => {
                    if (window.AdminPanel) {
                        console.log('Creating AdminPanel instance...');
                        window.adminPanel = new window.AdminPanel();

                        // Bind logout button after admin layout is loaded
                        setTimeout(() => {
                            this.bindLogoutButton();
                        }, 300);
                    } else {
                        console.error('AdminPanel class not found!');
                    }
                }, 200);
            }
            // Add other role scripts here if needed
        } catch (error) {
            console.error('Error loading role scripts:', error);
        }
    }

    // Bind logout button - unified for all roles  
    bindLogoutButton() {
        console.log('Binding logout button for role:', this.currentRole);

        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                console.log('Logout button found, binding simple event...');

                // Simple logout binding
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log('Logout clicked for role:', this.currentRole);
                    this.logout();
                };

                console.log('Logout button bound successfully for role:', this.currentRole);
            } else {
                console.warn('Logout button not found for role:', this.currentRole);
            }
        }, 100);
    }

    // Bind events cho navigation
    bindNavigationEvents() {
        // Admin có navigation riêng, không cần bind ở đây
        if (this.currentRole === 'admin') {
            return;
        }

        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.loadPage(page);

                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // Load trang theo role và page
    async loadPage(page) {
        try {
            const contentPath = `content/${this.currentRole}/${page}.html`;
            const response = await fetch(contentPath);

            if (!response.ok) {
                throw new Error(`Không tìm thấy trang: ${contentPath}`);
            }

            const html = await response.text();
            const contentContainer = document.getElementById(`${this.currentRole}-content`);

            if (contentContainer) {
                contentContainer.innerHTML = html;
                this.currentPage = page;

                // Load JS tương ứng nếu có
                await this.loadPageScript(page);
            }

        } catch (error) {
            console.error('Lỗi load trang:', error);
            const contentContainer = document.getElementById(`${this.currentRole}-content`);
            if (contentContainer) {
                contentContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Lỗi tải trang</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    // Load script cho trang cụ thể
    async loadPageScript(page) {
        const scriptPath = `js/${this.currentRole}/${page}.js`;

        try {
            // Kiểm tra xem script đã load chưa
            const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
            if (!existingScript) {
                await this.loadScript(scriptPath);

                // Đợi một chút để script được execute
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Khởi tạo instance cho trang cụ thể
            await this.initializePageInstance(page);

        } catch (error) {
            // Không bắt buộc phải có JS cho mọi trang
            console.log(`Không có script cho trang ${page}`, error);
        }
    }

    // Khởi tạo instance cho từng trang
    async initializePageInstance(page) {
        // Đợi một chút để script load xong
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            switch (page) {
                case 'dashboard':
                    if (this.currentRole === 'student') {
                        // Nếu đã có instance, chỉ refresh data
                        if (window.studentDashboard && typeof window.studentDashboard.refreshData === 'function') {
                            console.log('Refreshing existing student dashboard...');
                            await window.studentDashboard.refreshData();
                        } else if (window.StudentDashboard) {
                            console.log('Creating new student dashboard instance...');
                            window.studentDashboard = new StudentDashboard();
                        } else {
                            console.warn('StudentDashboard class not found');
                        }
                    } else if (this.currentRole === 'teacher') {
                        if (window.teacherDashboard && typeof window.teacherDashboard.refreshData === 'function') {
                            console.log('Refreshing existing teacher dashboard...');
                            await window.teacherDashboard.refreshData();
                        } else if (window.TeacherDashboard) {
                            console.log('Creating new teacher dashboard instance...');
                            window.teacherDashboard = new TeacherDashboard();
                        } else {
                            console.warn('TeacherDashboard class not found');
                        }
                    }
                    break;

                case 'exam_list':
                    if (this.currentRole === 'student') {
                        // Nếu đã có instance, chỉ refresh data
                        if (window.examList && typeof window.examList.refreshData === 'function') {
                            console.log('Refreshing existing exam list...');
                            await window.examList.refreshData();
                        } else if (window.ExamList) {
                            console.log('Creating new exam list instance...');
                            window.examList = new ExamList();
                        } else {
                            console.warn('ExamList class not found');
                        }
                    }
                    break;

                case 'my_results':
                    if (this.currentRole === 'student') {
                        if (window.myResultsManager && typeof window.myResultsManager.reset === 'function') {
                            console.log('Resetting existing my results...');
                            window.myResultsManager.reset();
                            await window.myResultsManager.refreshData();
                        } else if (window.MyResultsManager) {
                            console.log('Creating new my results instance...');
                            window.myResultsManager = new MyResultsManager();
                        } else {
                            console.warn('MyResultsManager class not found');
                        }
                    }
                    break;

                case 'exam':
                    if (this.currentRole === 'student') {
                        // Exam luôn tạo mới để tránh conflict
                        if (window.ExamManager) {
                            console.log('Creating new exam instance...');
                            window.examInstance = new ExamManager();
                        } else {
                            console.warn('ExamManager class not found');
                        }
                    }
                    break;

                case 'create_exam':
                    if (this.currentRole === 'teacher') {
                        if (window.createExam && typeof window.createExam.reset === 'function') {
                            console.log('Resetting existing create exam...');
                            window.createExam.reset();
                        } else if (window.CreateExam) {
                            console.log('Creating new create exam instance...');
                            window.createExam = new CreateExam();
                        } else {
                            console.warn('CreateExam class not found');
                        }
                    }
                    break;

                case 'manage_exams':
                    if (this.currentRole === 'teacher') {
                        if (window.manageExams && typeof window.manageExams.refreshData === 'function') {
                            console.log('Refreshing existing manage exams...');
                            await window.manageExams.refreshData();
                        } else if (window.ManageExams) {
                            console.log('Creating new manage exams instance...');
                            window.manageExams = new ManageExams();
                        } else {
                            console.warn('ManageExams class not found');
                        }
                    }
                    break;

                case 'view_results':
                    if (this.currentRole === 'teacher') {
                        if (window.viewResults && typeof window.viewResults.refreshData === 'function') {
                            console.log('Refreshing existing view results...');
                            await window.viewResults.refreshData();
                        } else if (window.ViewResults) {
                            console.log('Creating new view results instance...');
                            window.viewResults = new ViewResults();
                        } else {
                            console.warn('ViewResults class not found');
                        }
                    }
                    break;

                default:
                    console.log(`No special initialization needed for page: ${page}`);
            }
        } catch (error) {
            console.error(`Error initializing page instance for ${page}:`, error);
        }
    }

    // Helper function để load script
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Helper function để load CSS
    loadCSS(href) {
        return new Promise((resolve, reject) => {
            // Kiểm tra xem CSS đã load chưa
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // Render content vào app-container
    renderContent(html) {
        const container = document.getElementById('app-container');
        if (container) {
            container.innerHTML = html;
        }
    }

    // Xử lý đăng nhập thành công
    handleLoginSuccess(user) {
        this.currentUser = user;
        this.currentRole = user.role;

        // Tạo session với thời gian hết hạn
        this.createSession(user);

        // Log successful login
        this.logUserActivity('login', `User ${user.username} logged in as ${user.role}`);

        // Hiển thị thông tin user
        this.showUserInfo();

        // Load layout tương ứng
        this.loadRoleLayout();

        // Setup session monitoring
        this.setupSessionMonitoring();
    }

    // Setup session monitoring
    setupSessionMonitoring() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(() => {
            this.checkSessionStatus();
        }, 5 * 60 * 1000);

        // Extend session on user activity
        this.setupActivityTracking();
    }

    // Check session status
    checkSessionStatus() {
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        if (sessionExpiry) {
            const now = new Date().getTime();
            const expiry = parseInt(sessionExpiry);
            const timeLeft = expiry - now;

            // Warn user 5 minutes before expiry
            if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
                this.showSessionWarning(Math.ceil(timeLeft / 60000));
            }
        }
    }

    // Show session warning
    showSessionWarning(minutesLeft) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'session-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <span>⚠️ Phiên đăng nhập sẽ hết hạn trong ${minutesLeft} phút</span>
                <button onclick="this.parentElement.parentElement.remove(); window.app.extendSession();" class="btn btn-secondary btn-sm">
                    Gia hạn
                </button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .session-warning {
                position: fixed;
                top: 80px;
                right: 20px;
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 1000;
                animation: slideInRight 0.3s ease-out;
            }
            .warning-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(warningDiv);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentElement) {
                warningDiv.remove();
            }
        }, 10000);
    }

    // Setup activity tracking
    setupActivityTracking() {
        const events = ['click', 'keypress', 'scroll', 'mousemove'];
        const activityHandler = () => {
            this.extendSession();
            this.logUserActivity('activity', 'User activity detected');
        };

        // Throttle activity tracking
        let lastActivity = 0;
        events.forEach(event => {
            document.addEventListener(event, () => {
                const now = Date.now();
                if (now - lastActivity > 60000) { // Only extend once per minute
                    lastActivity = now;
                    activityHandler();
                }
            });
        });
    }

    // Log user activity
    logUserActivity(type, description) {
        const activity = {
            type,
            description,
            timestamp: new Date().toISOString(),
            user: this.currentUser?.username || 'anonymous'
        };

        const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        activities.push(activity);

        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }

        localStorage.setItem('userActivities', JSON.stringify(activities));
    }

    // Đăng xuất
    logout() {
        console.log('Logout called from:', this.currentRole);

        // Log logout activity
        if (this.currentUser) {
            this.logUserActivity('logout', `User ${this.currentUser.username} logged out`);
        }

        // Clear session monitoring
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }

        // Clean up page instances
        this.cleanupPageInstances();

        // Remove admin mode class if in admin mode
        if (this.currentRole === 'admin') {
            console.log('Removing admin mode class');
            document.body.classList.remove('admin-mode');
        }

        // Xóa session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiry');
        localStorage.removeItem('loginTime');

        // Reset state
        this.currentUser = null;
        this.currentRole = null;
        this.currentPage = null;

        // Ẩn thông tin user
        this.hideUserInfo();

        // Remove session warnings
        const warnings = document.querySelectorAll('.session-warning');
        warnings.forEach(warning => warning.remove());

        // Show logout success message
        this.showLogoutMessage();

        // Về trang đăng nhập after delay
        setTimeout(() => {
            this.loadLoginPage();
        }, 1500);
    }

    // Clean up all page instances when logout
    cleanupPageInstances() {
        console.log('Cleaning up page instances...');

        // Clean up student instances
        window.studentDashboard = null;
        window.examList = null;
        window.myResultsManager = null;
        window.examInstance = null;

        // Clean up teacher instances
        window.teacherDashboard = null;
        window.createExam = null;
        window.manageExams = null;
        window.viewResults = null;
    }

    // Show logout success message
    showLogoutMessage() {
        const container = document.getElementById('app-container');
        if (container) {
            container.innerHTML = `
                <div class="logout-success">
                    <div class="message-card">
                        <div class="success-icon">✅</div>
                        <h3>Đăng xuất thành công</h3>
                        <p>Cảm ơn bạn đã sử dụng hệ thống. Đang chuyển về trang đăng nhập...</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <footer id="main-footer" style="
                    position: fixed; 
                    bottom: 0; 
                    left: 0; 
                    width: 100%; 
                    background: #f8f9fa; 
                    padding: 15px 0; 
                    border-top: 1px solid #e9ecef;
                    z-index: 1000;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                ">
                    <div class="footer-container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                        <div class="footer-content" style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
                            <img src="https://cdn.haitrieu.com/wp-content/uploads/2021/12/Logo-DH-Quoc-Te-Mien-Dong-EIU.png" 
                                 alt="Logo EIU" 
                                 style="height: 35px; width: auto;">
                            <p style="color: #112444; margin: 0; font-size: 13px; text-align: center;">
                                &copy; 2025 Hệ thống thi online - Trường Đại Học Quốc Tế Miền Đông
                            </p>
                        </div>
                    </div>
                </footer>
            `;

            // Add styles for logout message
            const style = document.createElement('style');
            style.textContent = `
                .logout-success {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 400px;
                    margin-bottom: 80px; /* Add margin to prevent overlap with footer */
                }
                .logout-success .message-card {
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    text-align: center;
                    border-top: 4px solid #48bb78;
                    animation: fadeInUp 0.5s ease-out;
                }
                .success-icon {
                    font-size: 3rem;
                    margin-bottom: 15px;
                }
                .logout-success h3 {
                    color: #48bb78;
                    margin-bottom: 10px;
                }
                .logout-success p {
                    color: #718096;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // API call helper
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(endpoint, options);
            return await response.json();

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Khởi tạo app khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export để các module khác có thể sử dụng
window.App = App;
