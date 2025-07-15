// teacher/view_results.js - Xem kết quả thi của sinh viên

class ViewResults {
    constructor() {
        this.exams = [];
        this.results = [];
        this.filteredResults = [];
        this.selectedResults = new Set();
        this.currentExam = null;
        this.currentUser = null;
        this.currentResult = null;
        this.init();
    }

    init() {
        console.log('View Results initialized');
        this.currentUser = window.app?.currentUser;
        
        if (!this.currentUser || this.currentUser.role !== 'teacher') {
            console.error('Unauthorized access');
            return;
        }

        this.bindEvents();
        this.loadExams();
    }

    bindEvents() {
        // Exam selector
        const examSelect = document.getElementById('examSelect');
        if (examSelect) {
            examSelect.addEventListener('change', (e) => this.onExamChange(e.target.value));
        }

        // Filters
        const classFilter = document.getElementById('classFilter');
        const scoreRangeFilter = document.getElementById('scoreRangeFilter');
        const studentSearch = document.getElementById('studentSearch');

        if (classFilter) {
            classFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (scoreRangeFilter) {
            scoreRangeFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (studentSearch) {
            studentSearch.addEventListener('input', () => this.applyFilters());
        }
    }

    async loadExams() {
        try {
            const response = await fetch('/api/questions');
            if (response.ok) {
                const questionsData = await response.json();
                this.exams = questionsData.exams.filter(exam => 
                    exam.createdBy === this.currentUser.id && !exam.isDraft
                );
                this.populateExamSelector();
            } else {
                throw new Error('Failed to load exams');
            }
        } catch (error) {
            console.error('Error loading exams:', error);
            this.showMessage('Không thể tải danh sách bài thi', 'error');
        }
    }

    populateExamSelector() {
        const examSelect = document.getElementById('examSelect');
        if (!examSelect) return;

        examSelect.innerHTML = '<option value="">-- Chọn bài thi --</option>';
        
        this.exams.forEach(exam => {
            const option = document.createElement('option');
            option.value = exam.id;
            option.textContent = `${exam.title} (${exam.subject})`;
            examSelect.appendChild(option);
        });
    }

    async onExamChange(examId) {
        if (!examId) {
            this.hideAllSections();
            document.getElementById('noExamSelected').style.display = 'block';
            return;
        }

        this.currentExam = this.exams.find(exam => exam.id === examId);
        if (!this.currentExam) return;

        await this.loadResults(examId);
    }

    async loadResults(examId) {
        try {
            this.showLoading(true);
            this.hideAllSections();

            const response = await fetch('/api/results');
            if (response.ok) {
                const allResults = await response.json();
                this.results = allResults.filter(result => result.examId === examId);
                
                if (this.results.length === 0) {
                    this.showEmptyState();
                } else {
                    this.processResults();
                    this.showResultsSections();
                }
            } else {
                throw new Error('Failed to load results');
            }
        } catch (error) {
            console.error('Error loading results:', error);
            this.showMessage('Không thể tải kết quả thi', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    processResults() {
        // Calculate scores for each result
        this.results.forEach(result => {
            result.calculatedScore = this.calculateScore(result);
            result.scoreGrade = this.getScoreGrade(result.calculatedScore);
        });

        // Sort by score descending
        this.results.sort((a, b) => b.calculatedScore - a.calculatedScore);
        
        this.filteredResults = [...this.results];
        this.updateOverview();
        this.populateClassFilter();
        this.renderResults();
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

    getScoreGrade(score) {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'average';
        if (score >= 60) return 'weak';
        return 'poor';
    }

    updateOverview() {
        const totalStudents = this.results.length;
        const scores = this.results.map(r => r.calculatedScore);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalStudents;
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('averageScore').textContent = `${Math.round(averageScore)}%`;
        document.getElementById('highestScore').textContent = `${highestScore}%`;
        document.getElementById('lowestScore').textContent = `${lowestScore}%`;

        this.drawScoreChart(scores);
    }

    drawScoreChart(scores) {
        const chartContainer = document.getElementById('scoreChart');
        if (!chartContainer) return;

        // Score ranges
        const ranges = [
            { range: '0-59', min: 0, max: 59 },
            { range: '60-69', min: 60, max: 69 },
            { range: '70-79', min: 70, max: 79 },
            { range: '80-89', min: 80, max: 89 },
            { range: '90-100', min: 90, max: 100 }
        ];

        // Count scores in each range
        const rangeCounts = ranges.map(range => ({
            ...range,
            count: scores.filter(score => score >= range.min && score <= range.max).length
        }));

        const maxCount = Math.max(...rangeCounts.map(r => r.count), 1); // Prevent division by zero
        const maxBarHeight = 160; // Increased maximum bar height in pixels

        // Add loading state
        chartContainer.classList.add('loading');

        // Update each bar
        setTimeout(() => {
            rangeCounts.forEach((rangeData) => {
                const barElement = chartContainer.querySelector(`[data-range="${rangeData.range}"]`);
                if (barElement) {
                    const barFill = barElement.querySelector('.bar-fill');
                    const barCount = barElement.querySelector('.bar-count');
                    
                    if (barFill && barCount) {
                        // Calculate height in pixels (minimum 12px for visibility if count > 0)
                        let barHeight = 0;
                        if (rangeData.count > 0) {
                            barHeight = Math.max((rangeData.count / maxCount) * maxBarHeight, 12);
                        }
                        
                        // Set height directly
                        barFill.style.height = `${barHeight}px`;
                        barFill.style.setProperty('--bar-height', `${barHeight}px`);
                        
                        // Update count
                        barCount.textContent = rangeData.count.toString();
                        barCount.style.opacity = '1';
                    }
                }
            });

            // Remove loading state and trigger animations
            chartContainer.classList.remove('loading');
            chartContainer.classList.add('loaded');
        }, 100);
    }

    populateClassFilter() {
        const classFilter = document.getElementById('classFilter');
        if (!classFilter) return;

        const classes = [...new Set(this.results.map(r => r.userClass || 'Không xác định'))];
        
        classFilter.innerHTML = '<option value="">Tất cả lớp</option>';
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }

    applyFilters() {
        const classFilter = document.getElementById('classFilter')?.value || '';
        const scoreRangeFilter = document.getElementById('scoreRangeFilter')?.value || '';
        const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';

        this.filteredResults = this.results.filter(result => {
            // Class filter
            if (classFilter && (result.userClass || 'Không xác định') !== classFilter) {
                return false;
            }

            // Score range filter
            if (scoreRangeFilter && result.scoreGrade !== scoreRangeFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchText = `${result.userName} ${result.userId}`.toLowerCase();
                if (!searchText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });

        this.renderResults();
    }

    renderResults() {
        const tbody = document.getElementById('resultsTableBody');
        const resultsCount = document.getElementById('resultsCount');
        
        if (!tbody) return;

        resultsCount.textContent = this.filteredResults.length;

        if (this.filteredResults.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-results">
                        Không có kết quả phù hợp với bộ lọc
                    </td>
                </tr>
            `;
            return;
        }

        const rowsHTML = this.filteredResults.map((result, index) => {
            const timeSpent = this.formatTimeSpent(result.timeSpent);
            const submitTime = new Date(result.submittedAt).toLocaleString('vi-VN');
            const scoreClass = this.getScoreClass(result.calculatedScore);

            return `
                <tr>
                    <td>
                        <input type="checkbox" class="result-checkbox" 
                               value="${result.id}" 
                               onchange="viewResults.toggleResultSelection('${result.id}', this.checked)">
                    </td>
                    <td>${index + 1}</td>
                    <td>${result.userId}</td>
                    <td>${result.userName}</td>
                    <td>${result.userClass || 'Không xác định'}</td>
                    <td class="score-cell ${scoreClass}">${result.calculatedScore}%</td>
                    <td>${timeSpent}</td>
                    <td>${submitTime}</td>
                    <td>
                        <button onclick="viewResults.viewResultDetail('${result.id}')" 
                                class="btn btn-outline btn-sm">
                            Chi tiết
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rowsHTML;
    }

    getScoreClass(score) {
        if (score >= 90) return 'score-excellent';
        if (score >= 80) return 'score-good';
        if (score >= 70) return 'score-average';
        if (score >= 60) return 'score-weak';
        return 'score-poor';
    }

    formatTimeSpent(timeSpent) {
        if (!timeSpent) return 'Không xác định';
        
        const hours = Math.floor(timeSpent / 3600);
        const minutes = Math.floor((timeSpent % 3600) / 60);
        const seconds = timeSpent % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    viewResultDetail(resultId) {
        const result = this.results.find(r => r.id === resultId);
        if (!result) return;

        this.currentResult = result;
        this.showResultDetailModal(result);
    }

    showResultDetailModal(result) {
        const modal = document.getElementById('resultDetailModal');
        
        // Populate modal header
        document.getElementById('modalStudentName').textContent = result.userName;
        document.getElementById('modalScore').textContent = `${result.calculatedScore}%`;
        document.getElementById('modalTimeSpent').textContent = this.formatTimeSpent(result.timeSpent);
        document.getElementById('modalSubmitTime').textContent = new Date(result.submittedAt).toLocaleString('vi-VN');

        // Populate detailed answers
        this.renderDetailedAnswers(result);

        modal.style.display = 'flex';
    }

    renderDetailedAnswers(result) {
        const container = document.getElementById('modalDetailedAnswers');
        if (!container || !result.examQuestions) return;

        const answersHTML = result.examQuestions.map((question, index) => {
            const userAnswer = result.answers[question.id];
            const isCorrect = this.isAnswerCorrect(question, userAnswer);
            const correctAnswerText = this.getCorrectAnswerText(question);
            const userAnswerText = this.getUserAnswerText(question, userAnswer);

            return `
                <div class="question-detail ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="question-header">
                        <span class="question-number">Câu ${index + 1}</span>
                        <span class="question-status ${isCorrect ? 'status-correct' : 'status-incorrect'}">
                            ${isCorrect ? '✅ Đúng' : '❌ Sai'}
                        </span>
                    </div>
                    
                    <div class="question-content">
                        <p class="question-text">${question.question}</p>
                        
                        <div class="answer-comparison">
                            <div class="student-answer">
                                <strong>Câu trả lời của sinh viên:</strong>
                                <p>${userAnswerText}</p>
                            </div>
                            
                            <div class="correct-answer">
                                <strong>Đáp án đúng:</strong>
                                <p>${correctAnswerText}</p>
                            </div>
                        </div>
                        
                        ${question.explanation ? `
                            <div class="explanation">
                                <strong>Giải thích:</strong>
                                <p>${question.explanation}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = answersHTML;
    }

    getCorrectAnswerText(question) {
        switch (question.type) {
            case 'multiple-choice':
                return question.options[question.correctAnswer];
            case 'multiple-select':
                return question.correctAnswer.map(index => question.options[index]).join(', ');
            case 'text':
                return question.correctAnswer;
            default:
                return 'Không xác định';
        }
    }

    getUserAnswerText(question, userAnswer) {
        if (!userAnswer) return 'Không trả lời';

        switch (question.type) {
            case 'multiple-choice':
                return question.options[userAnswer] || 'Không hợp lệ';
            case 'multiple-select':
                if (!Array.isArray(userAnswer)) return 'Không hợp lệ';
                return userAnswer.map(index => question.options[index]).join(', ');
            case 'text':
                return userAnswer;
            default:
                return 'Không xác định';
        }
    }

    closeDetailModal() {
        document.getElementById('resultDetailModal').style.display = 'none';
        this.currentResult = null;
    }

    toggleResultSelection(resultId, selected) {
        if (selected) {
            this.selectedResults.add(resultId);
        } else {
            this.selectedResults.delete(resultId);
        }
    }

    toggleSelectAll(selectAll) {
        this.selectedResults.clear();
        
        const checkboxes = document.querySelectorAll('.result-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
            if (selectAll) {
                this.selectedResults.add(checkbox.value);
            }
        });
    }

    selectAllResults() {
        document.getElementById('selectAllCheckbox').checked = true;
        this.toggleSelectAll(true);
    }

    exportResults() {
        if (this.filteredResults.length === 0) {
            this.showMessage('Không có dữ liệu để xuất', 'warning');
            return;
        }

        this.downloadCSV(this.filteredResults, `ket_qua_${this.currentExam.title}.csv`);
    }

    exportSelectedResults() {
        const selectedResultsData = this.filteredResults.filter(result => 
            this.selectedResults.has(result.id)
        );

        if (selectedResultsData.length === 0) {
            this.showMessage('Vui lòng chọn ít nhất một kết quả', 'warning');
            return;
        }

        this.downloadCSV(selectedResultsData, `ket_qua_da_chon_${this.currentExam.title}.csv`);
    }

    exportStudentResult() {
        if (!this.currentResult) return;

        // For now, download as JSON. In a real app, you might generate PDF
        const dataStr = JSON.stringify(this.currentResult, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ket_qua_${this.currentResult.userName}_${this.currentExam.title}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Đã tải xuống kết quả', 'success');
    }

    downloadCSV(data, filename) {
        const headers = ['STT', 'Mã SV', 'Họ tên', 'Lớp', 'Điểm (%)', 'Thời gian làm', 'Ngày nộp'];
        const rows = data.map((result, index) => [
            index + 1,
            result.userId,
            result.userName,
            result.userClass || 'Không xác định',
            result.calculatedScore,
            this.formatTimeSpent(result.timeSpent),
            new Date(result.submittedAt).toLocaleString('vi-VN')
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Đã xuất file CSV', 'success');
    }

    async refreshData() {
        if (this.currentExam) {
            await this.loadResults(this.currentExam.id);
            this.showMessage('Đã cập nhật dữ liệu!', 'success');
        }
    }

    hideAllSections() {
        document.getElementById('resultsOverview').style.display = 'none';
        document.getElementById('resultsFilters').style.display = 'none';
        document.getElementById('resultsTableContainer').style.display = 'none';
        document.getElementById('emptyResults').style.display = 'none';
        document.getElementById('noExamSelected').style.display = 'none';
    }

    showResultsSections() {
        document.getElementById('resultsOverview').style.display = 'block';
        document.getElementById('resultsFilters').style.display = 'block';
        document.getElementById('resultsTableContainer').style.display = 'block';
    }

    showEmptyState() {
        document.getElementById('emptyResults').style.display = 'block';
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loadingResults');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
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
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : type === 'warning' ? '#ed8936' : '#667eea'};
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app?.currentRole === 'teacher') {
        window.viewResults = new ViewResults();
    }
});

// Also initialize if loaded dynamically
if (window.app?.currentRole === 'teacher') {
    window.viewResults = new ViewResults();
}
