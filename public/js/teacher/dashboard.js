// teacher/dashboard.js - Dashboard cho giáo viên

class TeacherDashboard {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        console.log('Teacher Dashboard initialized');

        // Get user from app or storage with fallback
        this.user = window.app?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');

        if (!this.user || !this.user.id) {
            console.error('User not found in teacher dashboard');
            return;
        }

        console.log('Loading dashboard for teacher:', this.user.id, this.user.name);
        this.loadDashboardData();
        this.bindEvents();
    }

    async loadDashboardData() {
        try {
            // Load exams created by this teacher
            const examsResponse = await fetch('/api/questions');
            const questionsData = await examsResponse.json();
            const teacherExams = questionsData.exams.filter(exam => exam.createdBy === this.user?.id);

            // Load all results for teacher's exams
            const resultsResponse = await fetch('/api/results');
            const allResults = await resultsResponse.json();
            const teacherResults = allResults.filter(result =>
                teacherExams.some(exam => exam.id === result.examId)
            );

            this.displayRecentExams(teacherExams.slice(0, 3));
            this.displayRecentSubmissions(teacherResults.slice(0, 5));

        } catch (error) {
            console.error('Error loading teacher dashboard data:', error);
        }
    }

    async refreshData() {
        console.log('Refreshing teacher dashboard data...');
        await this.loadDashboardData();
    }

    // Only keep displayRecentExams, displayRecentSubmissions, and navigation/format helpers
    displayRecentExams(exams) {
        const container = document.getElementById('recent-exams');
        if (container) {
            if (exams.length > 0) {
                container.innerHTML = exams.map(exam => `
                    <div class="exam-item">
                        <div class="exam-info">
                            <h4>${exam.title}</h4>
                            <p>${exam.description || 'Không có mô tả'}</p>
                            <div class="exam-meta">
                                <span>⏱️ ${exam.duration} phút</span>
                                <span>❓ ${exam.questions?.length || 0} câu</span>
                                <span>📅 ${new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div class="exam-actions">
                            <button onclick="window.app?.loadPage('manage_exams')" class="btn btn-secondary btn-sm">
                                Quản lý
                            </button>
                            <button onclick="window.app?.loadPage('view_results')" class="btn btn-primary btn-sm">
                                Xem kết quả
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `
                    <div class="no-data">
                        <p>Chưa có đề thi nào</p>
                        <button onclick="window.app?.loadPage('create_exam')" class="btn btn-primary">
                            Tạo đề thi đầu tiên
                        </button>
                    </div>
                `;
            }
        } else {
            // Fallback to old selector
            const oldContainer = document.querySelector('.recent-exams');
            if (oldContainer && exams.length > 0) {
                oldContainer.innerHTML = `
                    <h3>Bài thi gần đây</h3>
                    <div class="exam-list">
                        ${exams.map(exam => `
                            <div class="exam-item">
                                <h4>${exam.title}</h4>
                                <p>${exam.description || 'Không có mô tả'}</p>
                                <div class="exam-info">
                                    <span>Thời gian: ${exam.duration} phút</span>
                                    <span>Số câu: ${exam.questions?.length || 0}</span>
                                    <span>Tạo: ${new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    }

    displayRecentSubmissions(results) {
        const tbody = document.getElementById('results-tbody');
        const recentResultsContainer = document.getElementById('recent-results');
        const noDataDiv = recentResultsContainer ? recentResultsContainer.querySelector('.no-data') : null;
        if (tbody) {
            if (results.length > 0) {
                tbody.innerHTML = results.map(result => `
                    <tr>
                        <td>${result.userName || result.studentName || ''}</td>
                        <td>${result.examTitle || ''}</td>
                        <td>${result.submittedAt ? new Date(result.submittedAt).toLocaleString('vi-VN') : ''}</td>
                        <td><strong>${this.calculateScore ? this.calculateScore(result) : (result.score || 0)}%</strong></td>
                    </tr>
                `).join('');
                if (noDataDiv) noDataDiv.style.display = 'none';
            } else {
                tbody.innerHTML = '';
                if (noDataDiv) noDataDiv.style.display = '';
            }
        }
    }

    calculateScore(result) {
        // Use shared score calculator if available
        if (window.ScoreCalculator) {
            return window.ScoreCalculator.calculateScore(result);
        }

        // Fallback to local implementation
        if (!result.examQuestions || !result.answers) return 0;

        let correct = 0;
        const total = result.examQuestions.length;

        result.examQuestions.forEach((question, index) => {
            // Try multiple answer formats
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

    editExam(examId) {
        console.log('Edit exam:', examId);
        // TODO: Implement exam editing
        alert('Chức năng chỉnh sửa bài thi sẽ được phát triển trong giai đoạn tiếp theo');
    }

    viewResults(examId) {
        console.log('View results for exam:', examId);
        // TODO: Implement results viewing
        alert('Chức năng xem kết quả chi tiết sẽ được phát triển trong giai đoạn tiếp theo');
    }

    createNewExam() {
        console.log('Create new exam');
        // TODO: Implement exam creation
        alert('Chức năng tạo bài thi mới sẽ được phát triển trong giai đoạn tiếp theo');
    }

    bindEvents() {
        console.log('Teacher dashboard events bound');
    }
}

window.TeacherDashboard = TeacherDashboard;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app?.currentRole === 'teacher') {
        new TeacherDashboard();
    }
});

// Also initialize if loaded dynamically
if (window.app?.currentRole === 'teacher') {
    new TeacherDashboard();
}
