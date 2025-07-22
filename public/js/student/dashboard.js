// student/dashboard.js - Dashboard cho sinh viên

class StudentDashboard {
    constructor() {
        this.user = null;
        this.init();
    }

    async init() {
        console.log('Student Dashboard initialized');

        // Get user from app or storage
        this.user = window.app?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');

        if (!this.user || !this.user.id) {
            console.error('User not found in dashboard');
            return;
        }

        console.log('Loading dashboard for user:', this.user.id);
        await this.loadDashboardData();
        this.bindEvents();
    }

    async loadDashboardData() {
        try {
            console.log('Loading dashboard data...');

            // Load recent exams
            console.log('Fetching exams...');
            // Sửa: truyền userId khi fetch danh sách bài thi
            const examsResponse = await fetch(`/api/exams?userId=${this.user.id}`);
            const exams = await examsResponse.json();
            console.log('Exams loaded:', exams.length);

            // Load user results
            console.log('Fetching results for user:', this.user.id);
            const resultsResponse = await fetch(`/api/results?userId=${this.user.id}`);
            const results = await resultsResponse.json();
            console.log('Results loaded:', results.length);

            // Calculate available vs completed stats
            const completedExamIds = results.map(result => result.examId);
            const availableExams = exams.filter(exam => !completedExamIds.includes(exam.id));
            const completedExams = exams.filter(exam => completedExamIds.includes(exam.id));

            console.log('Available exams:', availableExams.length);
            console.log('Completed exams:', completedExams.length);
            console.log('Average score:', this.calculateAverageScore(results));

            this.displayDashboardStats(availableExams.length, completedExams.length, results);
            this.displayRecentExams(exams.slice(0, 3));
            // Note: displayRecentResults không cần vì dashboard.html không có phần này

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Không thể tải dữ liệu dashboard');
        }
    }

    async refreshData() {
        console.log('Refreshing dashboard data...');
        await this.loadDashboardData();
    }

    displayDashboardStats(availableCount, completedCount, results) {
        // Cập nhật số liệu vào các thẻ id tương ứng
        const totalExamsEl = document.getElementById('total-exams');
        const completedExamsEl = document.getElementById('completed-exams');
        const averageScoreEl = document.getElementById('average-score');

        if (totalExamsEl) totalExamsEl.textContent = availableCount;
        if (completedExamsEl) completedExamsEl.textContent = completedCount;
        if (averageScoreEl) averageScoreEl.textContent = this.calculateAverageScore(results) + '%';
    }

    displayRecentExams(exams) {
        const container = document.getElementById('recent-exams');
        if (container && exams.length > 0) {
            container.innerHTML = `
                ${exams.map(exam => `
                    <div class="exam-item">
                        <div class="exam-content">
                            <h4>${exam.title}</h4>
                            <p>${exam.description || exam.subject}</p>
                            <div class="exam-meta">
                                <span class="exam-duration">⏱️ ${exam.duration} phút</span>
                                <span class="exam-questions">📝 ${exam.questionCount || exam.questions?.length || 0} câu</span>
                            </div>
                        </div>
                        <div class="exam-actions">
                            <button onclick="window.app?.loadPage('exam_list')" class="btn btn-primary btn-sm">
                                Xem tất cả
                            </button>
                        </div>
                    </div>
                `).join('')}
            `;
        } else if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>Chưa có bài thi nào</p>
                </div>
            `;
        }
    }

    displayRecentResults(results) {
        const container = document.getElementById('recent-results');
        if (container && results.length > 0) {
            container.innerHTML = `
                ${results.map(result => {
                const score = this.calculateScore(result);
                const scoreClass = score >= 80 ? 'score-excellent' : score >= 60 ? 'score-good' : 'score-poor';

                return `
                        <div class="result-item">
                            <div class="result-content">
                                <h4>${result.examTitle}</h4>
                                <p>Ngày làm: ${new Date(result.submittedAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div class="result-score ${scoreClass}">
                                ${score}%
                            </div>
                        </div>
                    `;
            }).join('')}
                <div class="view-all-results">
                    <button onclick="window.app?.loadPage('my_results')" class="btn btn-secondary btn-sm">
                        Xem tất cả kết quả
                    </button>
                </div>
            `;
        } else if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>Chưa có kết quả nào</p>
                </div>
            `;
        }
    }

    calculateScore(result) {
        // Use shared score calculator if available
        if (window.ScoreCalculator) {
            return window.ScoreCalculator.calculateScore(result);
        }

        // Fallback to local implementation
        if (!result.examQuestions || !result.answers) {
            console.log('Missing examQuestions or answers for result:', result.id);
            return 0;
        }

        let correct = 0;
        const total = result.examQuestions.length;

        result.examQuestions.forEach((question, index) => {
            let userAnswer = null;

            if (result.answers.hasOwnProperty(question.id)) {
                userAnswer = result.answers[question.id];
            } else if (result.answers.hasOwnProperty(index.toString())) {
                userAnswer = result.answers[index.toString()];
            } else if (result.answers.hasOwnProperty(index)) {
                userAnswer = result.answers[index];
            } else if (result.answers.hasOwnProperty(question.id.toString())) {
                userAnswer = result.answers[question.id.toString()];
            }

            if (this.isAnswerCorrect(question, userAnswer)) {
                correct++;
            }
        });

        return Math.round((correct / total) * 100);
    }

    calculateAverageScore(results) {
        if (results.length === 0) return 0;

        const totalScore = results.reduce((sum, result) => {
            return sum + this.calculateScore(result);
        }, 0);

        return Math.round(totalScore / results.length);
    }

    isAnswerCorrect(question, userAnswer) {
        if (!userAnswer) return false;

        switch (question.type) {
            case 'multiple-choice':
                return userAnswer === question.correctAnswer;
            case 'multiple-select':
                if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false;
                return userAnswer.length === question.correctAnswer.length &&
                    userAnswer.every(answer => question.correctAnswer.includes(answer));
            case 'text':
                return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            default:
                return false;
        }
    }

    bindEvents() {
        // Add any event listeners here
        console.log('Student dashboard events bound');
    }

    showError(message) {
        const statsContainer = document.querySelector('.dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Lỗi tải dữ liệu</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">Thử lại</button>
                </div>
            `;
        }
    }
}

// Initialize when script loads (for dynamic loading)
function initStudentDashboard() {
    console.log('initStudentDashboard called');

    if (window.app?.currentRole === 'student') {
        console.log('Initializing StudentDashboard...');
        // Only create new instance if not already created
        if (!window.studentDashboard) {
            window.studentDashboard = new StudentDashboard();
        } else {
            // If already exists, just refresh data
            console.log('StudentDashboard already exists, refreshing data...');
            window.studentDashboard.refreshData();
        }
    } else {
        console.log('Not student role or app not ready, retrying...');
        // Retry after a short delay
        setTimeout(() => {
            if (window.app?.currentRole === 'student') {
                console.log('Initializing StudentDashboard (retry)...');
                if (!window.studentDashboard) {
                    window.studentDashboard = new StudentDashboard();
                }
            }
        }, 100);
    }
}

// Initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudentDashboard);
} else {
    // DOM already loaded
    initStudentDashboard();
}
