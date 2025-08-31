// student/exam_list.js - Danh sách bài thi cho sinh viên

class ExamList {
    constructor() {
        this.exams = [];
        this.userResults = [];
        this.filteredExams = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('Exam List initialized');
        this.currentUser = window.app?.currentUser;

        if (!this.currentUser) {
            console.error('User not logged in');
            return;
        }

        this.bindEvents();
        await this.loadData();
        this.renderExams();
    }

    bindEvents() {
        // Filter events
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchExam');

        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => this.applyFilters());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshExams');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    async loadData() {
        try {
            console.log('Loading exam data...');
            this.showLoading(true);
            // Load exams list
            console.log('Fetching exams from /api/exams...');
            const examsResponse = await fetch(`/api/exams?userId=${this.currentUser.id}`);
            if (examsResponse.ok) {
                this.exams = await examsResponse.json();
                console.log('Exams loaded:', this.exams);
            } else {
                throw new Error('Failed to load exams');
            }
            // Load user results
            console.log('Fetching user results for user:', this.currentUser.id);
            const resultsResponse = await fetch(`/api/results?userId=${this.currentUser.id}`);
            if (resultsResponse.ok) {
                this.userResults = await resultsResponse.json();
                console.log('User results loaded:', this.userResults);
            } else {
                console.warn('Could not load user results');
                this.userResults = [];
            }
            this.filteredExams = [...this.exams];
            console.log('Data loading completed successfully');
        } catch (error) {
            console.error('Error loading exam data:', error);
            this.showError('Không thể tải danh sách bài thi. Vui lòng thử lại sau.');
        } finally {
            this.showLoading(false);
        }
    }

    async refreshData() {
        console.log('Refreshing exam list data...');
        await this.loadData();
        this.applyFilters();
        this.showMessage('Đã cập nhật danh sách bài thi!', 'success');
    }

    applyFilters() {
        const subjectFilter = document.getElementById('subjectFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const searchTerm = document.getElementById('searchExam')?.value.toLowerCase() || '';

        this.filteredExams = this.exams.filter(exam => {
            // Subject filter
            if (subjectFilter && exam.subject !== subjectFilter) {
                return false;
            }

            // Status filter
            if (statusFilter) {
                const examStatus = this.getExamStatus(exam);
                if (examStatus !== statusFilter) {
                    return false;
                }
            }

            // Search filter
            if (searchTerm) {
                const searchText = `${exam.title} ${exam.description} ${exam.subject}`.toLowerCase();
                if (!searchText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        // Sort exams by creation date (newest first)
        this.filteredExams.sort((a, b) => {
            const dateA = new Date(a.createdAt || '2025-01-01');
            const dateB = new Date(b.createdAt || '2025-01-01');
            return dateB - dateA; // Newest first
        });

        this.renderExams();
    }

    getExamStatus(exam) {
        const userResult = this.userResults.find(result => result.examId === exam.id);

        if (userResult) {
            return 'completed';
        }

        // Check if exam has deadline (you can add deadline to exam data if needed)
        // For now, assume all exams are available
        return 'available';
    }

    renderExams() {
        console.log('renderExams called, filtered exams:', this.filteredExams);
        const container = document.getElementById('exam-grid');
        console.log('Container found:', container);

        if (!container) {
            console.error('exam-grid container not found!');
            return;
        }

        if (this.filteredExams.length === 0) {
            console.log('No exams to display, showing empty state');
            container.style.display = 'none';
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        console.log('Rendering', this.filteredExams.length, 'exams');
        container.style.display = 'grid';
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        const examsHTML = this.filteredExams.map(exam => this.renderExamCard(exam)).join('');
        container.innerHTML = examsHTML;
        console.log('Exams rendered successfully');
    }

    renderExamCard(exam) {
        const status = this.getExamStatus(exam);
        const userResult = this.userResults.find(result => result.examId === exam.id);
        const score = userResult ? this.calculateScore(userResult) : null;

        const statusConfig = {
            available: {
                class: 'status-available',
                text: 'Có thể làm',
                icon: '✅'
            },
            completed: {
                class: 'status-completed',
                text: 'Đã hoàn thành',
                icon: '🎯'
            },
            expired: {
                class: 'status-expired',
                text: 'Hết hạn',
                icon: '⏰'
            }
        };

        const config = statusConfig[status];

        return `
            <div class="exam-card ${config.class}">
                <div class="exam-header">
                    <h3 class="exam-title">${exam.title}</h3>
                    <div class="exam-status">
                        <span class="status-icon">${config.icon}</span>
                        <span class="status-text">${config.text}</span>
                    </div>
                </div>
                
                <div class="exam-info">
                    <p class="exam-description">${exam.description}</p>
                    <div class="exam-meta">
                        <div class="meta-item">
                            <span class="meta-label">Môn học:</span>
                            <span class="meta-value">${exam.subject}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Thời gian:</span>
                            <span class="meta-value">${exam.duration} phút</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Số câu:</span>
                            <span class="meta-value">${exam.questionCount} câu</span>
                        </div>
                        ${score !== null ? `
                            <div class="meta-item">
                                <span class="meta-label">Điểm:</span>
                                <span class="meta-value score">${score}%</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="exam-actions">
                    ${status === 'available' ? `
                        <button onclick="window.examList?.startExam('${exam.id}')" class="btn btn-primary">
                            <span class="btn-icon">🚀</span>
                            Bắt đầu thi
                        </button>
                    ` : ''}
                    
                    ${status === 'completed' ? `
                        <button onclick="window.examList?.viewResult('${userResult.id}')" class="btn btn-secondary">
                            <span class="btn-icon">📊</span>
                            Xem kết quả
                        </button>
                        <button onclick="window.examList?.retakeExam('${exam.id}')" class="btn btn-outline">
                            <span class="btn-icon">🔄</span>
                            Thi lại
                        </button>
                    ` : ''}
                    
                    <button onclick="window.examList?.previewExam('${exam.id}')" class="btn btn-outline">
                        <span class="btn-icon">👁️</span>
                        Xem thông tin
                    </button>
                </div>
            </div>
        `;
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

    startExam(examId) {
        console.log('startExam called with examId:', examId);

        if (confirm('Bạn có chắc chắn muốn bắt đầu bài thi này? Thời gian sẽ được tính từ khi bạn xác nhận.')) {
            console.log('User confirmed, starting exam...');

            // Store exam start time and ID
            const startTime = new Date().toISOString();
            localStorage.setItem('currentExam', JSON.stringify({
                examId: examId,
                startTime: startTime
            }));
            localStorage.setItem('currentExamId', examId);

            // Navigate to exam page using app's loadPage method
            if (window.app && typeof window.app.loadPage === 'function') {
                console.log('Loading exam page via app.loadPage...');
                window.app.loadPage('exam');

                // Pass exam ID to exam page after a short delay
                setTimeout(() => {
                    if (window.examController && typeof window.examController.loadExam === 'function') {
                        console.log('Loading exam via examController...');
                        window.examController.loadExam(examId);
                    } else {
                        console.log('examController not available yet, will be loaded by exam.js');
                    }
                }, 300);
            } else {
                console.error('window.app.loadPage not available');
                alert('Không thể chuyển đến trang thi. Vui lòng thử lại.');
            }
        }
    }

    viewResult(resultId) {
        console.log('viewResult called with resultId:', resultId);

        if (!resultId) {
            console.error('No result ID provided');
            alert('Không tìm thấy kết quả thi. Vui lòng thử lại.');
            return;
        }

        try {
            // Store result ID for the result page
            localStorage.setItem('selectedResultId', resultId);

            // Navigate to result page
            window.location.hash = `result/${resultId}`;

            // Use app navigation if available
            if (window.app && typeof window.app.loadPage === 'function') {
                window.app.loadPage('result');
            } else {
                console.warn('App navigation not available, using direct navigation');
                // Direct navigation fallback
                window.location.href = `student.html#result/${resultId}`;
            }

            console.log('Navigation to result page initiated');
        } catch (error) {
            console.error('Error navigating to result page:', error);
            alert('Có lỗi khi mở trang kết quả. Vui lòng thử lại.');
        }
    }

    retakeExam(examId) {
        if (confirm('Bạn có muốn thi lại bài này? Kết quả cũ sẽ được giữ lại để bạn so sánh.')) {
            this.startExam(examId);
        }
    }

    previewExam(examId) {
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;

        // Show exam preview modal
        this.showExamPreview(exam);
    }

    showExamPreview(exam) {
        const modal = document.createElement('div');
        modal.className = 'modal exam-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${exam.title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="exam-preview">
                        <div class="preview-section">
                            <h4>Thông tin bài thi</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <strong>Môn học:</strong> ${exam.subject}
                                </div>
                                <div class="info-item">
                                    <strong>Thời gian:</strong> ${exam.duration} phút
                                </div>
                                <div class="info-item">
                                    <strong>Số câu hỏi:</strong> ${exam.questionCount} câu
                                </div>
                                <div class="info-item">
                                    <strong>Tạo bởi:</strong> ${exam.createdBy}
                                </div>
                            </div>
                        </div>
                        
                        <div class="preview-section">
                            <h4>Mô tả</h4>
                            <p>${exam.description}</p>
                        </div>
                        
                        <div class="preview-section">
                            <h4>Hướng dẫn</h4>
                            <ul class="instructions">
                                <li>Đọc kỹ đề bài trước khi trả lời</li>
                                <li>Bài thi có thể được lưu tự động trong quá trình làm</li>
                                <li>Bạn có thể quay lại các câu đã làm để kiểm tra</li>
                                <li>Nộp bài trước khi hết thời gian</li>
                                <li>Sau khi nộp bài, bạn có thể xem kết quả ngay lập tức</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">
                        Đóng
                    </button>
                    <button onclick="window.examList?.startExam('${exam.id}'); this.closest('.modal').remove();" class="btn btn-primary">
                        Bắt đầu thi
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles if not already added
        if (!document.querySelector('.modal-styles')) {
            const style = document.createElement('style');
            style.className = 'modal-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                .modal-body {
                    padding: 20px;
                }
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 15px 0;
                }
                .info-item {
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }
                .preview-section {
                    margin-bottom: 25px;
                }
                .preview-section h4 {
                    color: #2d3748;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 5px;
                }
                .instructions {
                    margin: 0;
                    padding-left: 20px;
                }
                .instructions li {
                    margin-bottom: 8px;
                    line-height: 1.5;
                }
            `;
            document.head.appendChild(style);
        }
    }

    clearFilters() {
        document.getElementById('subjectFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('searchExam').value = '';
        this.applyFilters();
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loading-exams');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        const container = document.getElementById('exam-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <h3>Lỗi tải dữ liệu</h3>
                    <p>${message}</p>
                    <button onclick="window.examList?.refreshData()" class="btn btn-primary">
                        Thử lại
                    </button>
                </div>
            `;
        }
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#48bb78' : '#667eea'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize when script loads (for dynamic loading)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExamList);
} else {
    // DOM already loaded
    initExamList();
}

function initExamList() {
    if (window.app?.currentRole === 'student') {
        console.log('Initializing ExamList...');
        // Only create new instance if not already created
        if (!window.examList) {
            window.examList = new ExamList();
        } else {
            // If already exists, just refresh data
            console.log('ExamList already exists, refreshing data...');
            window.examList.refreshData();
        }
    } else {
        console.log('Not student role or app not ready, retrying...');
        // Retry after a short delay
        setTimeout(() => {
            if (window.app?.currentRole === 'student') {
                console.log('Initializing ExamList (retry)...');
                if (!window.examList) {
                    window.examList = new ExamList();
                }
            }
        }, 100);
    }
}
