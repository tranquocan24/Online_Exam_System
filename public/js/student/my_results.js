// My Results functionality for students
class MyResultsManager {
    constructor() {
        this.allResults = [];
        this.filteredResults = [];
        this.currentSort = 'date-desc';
        this.eventListenersSetup = false; // Track if event listeners are setup
        this.currentPage = 'my_results'; // Track current page
        
        this.init();
    }

    async init() {
        try {
            console.log('MyResultsManager initialized');
            
            await this.loadResults();
            this.renderSummaryStats();
            this.renderResults();
            
            // Setup event listeners after DOM is ready
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);
            
            // Check if we need to highlight a specific result
            const viewResultId = localStorage.getItem('viewResultId');
            if (viewResultId) {
                localStorage.removeItem('viewResultId');
                setTimeout(() => {
                    this.highlightResult(viewResultId);
                }, 500);
            }
            
            const loadingScreen = document.getElementById('loadingScreen');
            const resultsContainer = document.getElementById('resultsContainer');
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (resultsContainer) resultsContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error initializing results:', error);
            this.showError('Có lỗi xảy ra khi tải kết quả thi');
        }
    }

    async loadResults() {
        try {
            // Get user from app or storage
            const user = window.app?.currentUser || JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('currentUser') || '{}');
            
            if (!user || !user.id) {
                throw new Error('User not found');
            }
            
            console.log('Loading results for user:', user.id);
            const response = await fetch(`/api/results?userId=${user.id}`);
            
            if (!response.ok) {
                throw new Error('Failed to load results');
            }
            
            this.allResults = await response.json();
            this.filteredResults = [...this.allResults];
            console.log('Results loaded:', this.allResults);
            
        } catch (error) {
            throw new Error('Không thể tải dữ liệu kết quả: ' + error.message);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        const scoreFilter = document.getElementById('scoreFilter');
        const timeFilter = document.getElementById('timeFilter');
        const searchFilter = document.getElementById('searchFilter');
        const sortSelect = document.getElementById('sortSelect');

        // Remove existing listeners to avoid duplicates
        if (this.eventListenersSetup) {
            console.log('Removing existing event listeners...');
            // Clone elements to remove all event listeners
            if (scoreFilter) {
                const newScoreFilter = scoreFilter.cloneNode(true);
                scoreFilter.parentNode.replaceChild(newScoreFilter, scoreFilter);
            }
            if (timeFilter) {
                const newTimeFilter = timeFilter.cloneNode(true);
                timeFilter.parentNode.replaceChild(newTimeFilter, timeFilter);
            }
            if (searchFilter) {
                const newSearchFilter = searchFilter.cloneNode(true);
                searchFilter.parentNode.replaceChild(newSearchFilter, searchFilter);
            }
            if (sortSelect) {
                const newSortSelect = sortSelect.cloneNode(true);
                sortSelect.parentNode.replaceChild(newSortSelect, sortSelect);
            }
        }

        // Get fresh references after cloning
        const freshScoreFilter = document.getElementById('scoreFilter');
        const freshTimeFilter = document.getElementById('timeFilter');
        const freshSearchFilter = document.getElementById('searchFilter');
        const freshSortSelect = document.getElementById('sortSelect');

        if (freshScoreFilter) {
            freshScoreFilter.addEventListener('change', () => {
                console.log('Score filter changed:', freshScoreFilter.value);
                this.applyFilters();
            });
            console.log('Score filter event listener bound');
        } else {
            console.warn('scoreFilter element not found');
        }
        
        if (freshTimeFilter) {
            freshTimeFilter.addEventListener('change', () => {
                console.log('Time filter changed:', freshTimeFilter.value);
                this.applyFilters();
            });
            console.log('Time filter event listener bound');
        } else {
            console.warn('timeFilter element not found');
        }
        
        if (freshSearchFilter) {
            freshSearchFilter.addEventListener('input', (e) => {
                console.log('Search filter changed:', e.target.value);
                this.debounce(() => this.applyFilters(), 300)();
            });
            console.log('Search filter event listener bound');
        } else {
            console.warn('searchFilter element not found');
        }
        
        if (freshSortSelect) {
            freshSortSelect.addEventListener('change', (e) => {
                console.log('Sort changed from', this.currentSort, 'to', e.target.value);
                this.currentSort = e.target.value;
                this.sortResults();
                this.renderResults();
            });
            console.log('Sort select event listener bound');
        } else {
            console.warn('sortSelect element not found');
        }

        // Mark that event listeners have been setup
        this.eventListenersSetup = true;
        console.log('Event listeners setup completed');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    applyFilters() {
        const scoreFilter = document.getElementById('scoreFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
        
        this.filteredResults = this.allResults.filter(result => {
            // Score filter
            if (scoreFilter !== 'all') {
                const score = this.calculateScore(result);
                if (scoreFilter === 'excellent' && score < 8) return false;
                if (scoreFilter === 'good' && (score < 6 || score >= 8)) return false;
                if (scoreFilter === 'average' && score >= 6) return false;
            }
            
            // Time filter
            if (timeFilter !== 'all') {
                const resultDate = new Date(result.submittedAt);
                const now = new Date();
                let cutoffDate;
                
                switch (timeFilter) {
                    case 'week':
                        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'quarter':
                        cutoffDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
                        break;
                }
                
                if (resultDate < cutoffDate) return false;
            }
            
            // Search filter
            if (searchTerm && !result.examTitle.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            return true;
        });
        
        this.sortResults();
        this.renderResults();
    }

    sortResults() {
        console.log('Sorting results with:', this.currentSort);
        console.log('Results to sort:', this.filteredResults.length);
        
        this.filteredResults.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.submittedAt) - new Date(a.submittedAt);
                case 'date-asc':
                    return new Date(a.submittedAt) - new Date(b.submittedAt);
                case 'score-desc':
                    return this.calculateScore(b) - this.calculateScore(a);
                case 'score-asc':
                    return this.calculateScore(a) - this.calculateScore(b);
                case 'title-asc':
                    return a.examTitle.localeCompare(b.examTitle);
                case 'title-desc':
                    return b.examTitle.localeCompare(a.examTitle);
                default:
                    console.warn('Unknown sort option:', this.currentSort);
                    return 0;
            }
        });
        
        console.log('Results sorted successfully');
    }

    calculateScore(result) {
        // Use shared score calculator if available
        if (window.ScoreCalculator) {
            return window.ScoreCalculator.calculateScore(result);
        }
        
        // Fallback to local implementation
        const { correct, total } = this.calculateCorrectAnswers(result);
        return Math.round((correct / total) * 100);
    }

    calculateCorrectAnswers(result) {
        // Use shared score calculator if available
        if (window.ScoreCalculator) {
            return window.ScoreCalculator.calculateCorrectAnswers(result);
        }
        
        // Fallback to local implementation
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
        
        return { correct, total };
    }

    isAnswerCorrect(question, userAnswer) {
        // Add null/undefined check for consistency
        if (userAnswer === null || userAnswer === undefined) {
            return false;
        }

        if (question.type === 'multiple-select') {
            if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
                return false;
            }
            const sortedUserAnswer = [...userAnswer].sort();
            const sortedCorrectAnswer = [...question.correctAnswer].sort();
            return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
        } else if (question.type === 'text') {
            return userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        } else {
            return userAnswer === question.correctAnswer;
        }
    }

    renderSummaryStats() {
        const statsContainer = document.getElementById('summaryStats');
        
        if (this.allResults.length === 0) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">0</div>
                    <div class="stat-label">Bài thi đã làm</div>
                </div>
            `;
            return;
        }
        
        const totalExams = this.allResults.length;
        const scores = this.allResults.map(result => this.calculateScore(result));
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const excellentCount = scores.filter(score => score >= 8).length;
        const recentResults = this.allResults
            .filter(result => new Date(result.submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .length;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalExams}</div>
                <div class="stat-label">Tổng bài thi</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgScore.toFixed(1)}</div>
                <div class="stat-label">Điểm trung bình</div>
            </div>
            <div class="stat-card excellent">
                <div class="stat-value">${excellentCount}</div>
                <div class="stat-label">Bài xuất sắc</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${recentResults}</div>
                <div class="stat-label">Thi trong tháng</div>
            </div>
        `;
    }

    renderResults() {
        const resultsGrid = document.getElementById('resultsGrid');
        
        if (this.filteredResults.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>Chưa có kết quả thi nào</h3>
                    <p>Bạn chưa thực hiện bài thi nào hoặc không có kết quả phù hợp với bộ lọc.</p>
                    <a href="/student.html?content=exam_list" class="action-btn btn-view">
                        Làm bài thi ngay
                    </a>
                </div>
            `;
            return;
        }
        
        resultsGrid.innerHTML = this.filteredResults.map(result => this.createResultCard(result)).join('');
        
        // Bind click events for result buttons using event delegation
        this.bindResultActions();
    }

    createResultCard(result) {
        const score = this.calculateScore(result);
        const { correct, total } = this.calculateCorrectAnswers(result);
        const percentage = Math.round((correct / total) * 100);
        
        let scoreClass = 'score-average';
        if (score >= 8) scoreClass = 'score-excellent';
        else if (score >= 6) scoreClass = 'score-good';
        
        const submittedDate = new Date(result.submittedAt);
        const formattedDate = submittedDate.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const timeSpent = this.formatTime(result.timeSpent);
        
        return `
            <div class="result-card" data-result-id="${result.id}">
                <div class="result-card-header">
                    <div class="exam-info">
                        <h4>${result.examTitle}</h4>
                        <div class="exam-meta">
                            Làm bài lúc: ${formattedDate}
                            ${result.isTimeUp ? ' • <span style="color: #e74c3c;">Hết thời gian</span>' : ''}
                        </div>
                    </div>
                    <div class="score-badge ${scoreClass}">
                        ${score.toFixed(1)} điểm
                    </div>
                </div>
                
                <div class="result-details">
                    <div class="detail-item">
                        <div class="detail-value">${correct}/${total}</div>
                        <div class="detail-label">Số câu đúng</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${percentage}%</div>
                        <div class="detail-label">Tỷ lệ đúng</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${timeSpent}</div>
                        <div class="detail-label">Thời gian</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${total}</div>
                        <div class="detail-label">Tổng câu hỏi</div>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="action-btn btn-view" data-result-id="${result.id}">
                        Xem kết quả
                    </button>
                </div>
            </div>
        `;
    }

    bindResultActions() {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) {
            console.warn('Results grid not found for binding actions');
            return;
        }

        // Remove existing event listeners by cloning the element
        const newResultsGrid = resultsGrid.cloneNode(true);
        resultsGrid.parentNode.replaceChild(newResultsGrid, resultsGrid);

        // Add event delegation to the new element
        newResultsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view')) {
                e.preventDefault();
                
                const resultId = e.target.getAttribute('data-result-id') || 
                               e.target.closest('.result-card')?.getAttribute('data-result-id');
                
                console.log('Result button clicked via delegation:', resultId);
                
                if (resultId) {
                    this.viewResult(resultId);
                } else {
                    console.error('Could not find result ID from button or parent card');
                }
            }
        });

        console.log('Result actions bound via event delegation');
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    showError(message) {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
        
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Có lỗi xảy ra</h3>
                <p>${message}</p>
                <button class="action-btn btn-view" onclick="location.reload()">
                    🔄 Thử lại
                </button>
            </div>
        `;
    }

    highlightResult(resultId) {
        console.log('Highlighting result:', resultId);
        const resultCard = document.querySelector(`[data-result-id="${resultId}"]`);
        if (resultCard) {
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            resultCard.style.transform = 'scale(1.02)';
            resultCard.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.3)';
            resultCard.style.border = '2px solid #4a90e2';
            
            // Show a success message
            this.showSuccessMessage('Bài thi đã được nộp thành công!');
            
            // Reset highlight after a few seconds
            setTimeout(() => {
                resultCard.style.transform = '';
                resultCard.style.boxShadow = '';
                resultCard.style.border = '';
            }, 3000);
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

            // Use replaceState instead of pushState to avoid multiple history entries
            const newUrl = `#result/${resultId}`;
            
            // Only push new state if we're not already on a result page
            if (!window.location.hash.startsWith('#result/')) {
                window.history.pushState({
                    page: 'result',
                    resultId: resultId,
                    fromPage: this.currentPage || 'my_results'
                }, `Result ${resultId}`, newUrl);
            } else {
                // Replace current state if already on a result page
                window.history.replaceState({
                    page: 'result',
                    resultId: resultId,
                    fromPage: this.currentPage || 'my_results'
                }, `Result ${resultId}`, newUrl);
            }

            // Update hash and load page
            window.location.hash = newUrl;
            
            // Use app navigation if available
            if (window.app && typeof window.app.loadPage === 'function') {
                console.log('Loading result page via app.loadPage...');
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

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        successDiv.textContent = message;
        
        // Add animation keyframes
        if (!document.querySelector('#success-animation-style')) {
            const style = document.createElement('style');
            style.id = 'success-animation-style';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => successDiv.remove(), 300);
        }, 3000);
    }

    async refreshData() {
        console.log('Refreshing my results data...');
        try {
            // Show loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            const resultsContainer = document.getElementById('resultsContainer');
            if (loadingScreen) loadingScreen.style.display = 'block';
            if (resultsContainer) resultsContainer.style.display = 'none';
            
            await this.loadResults();
            this.renderSummaryStats();
            this.renderResults();
            
            // Setup event listeners after rendering (critical for back navigation)
            setTimeout(() => {
                console.log('Re-binding event listeners after refresh...');
                this.setupEventListeners();
            }, 200);
            
            // Hide loading screen and show results
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (resultsContainer) resultsContainer.style.display = 'block';
            
            console.log('My results data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing my results data:', error);
            
            // Hide loading screen on error
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) loadingScreen.style.display = 'none';
            
            this.showError('Không thể tải lại dữ liệu kết quả');
        }
    }

    reset() {
        console.log('Resetting my results state...');
        
        // Reset data
        this.allResults = [];
        this.filteredResults = [];
        this.currentSort = 'date-desc';
        
        // Reset UI
        const loadingScreen = document.getElementById('loadingScreen');
        const resultsContainer = document.getElementById('resultsContainer');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'block';
        
        // Clear any existing content
        const summaryStats = document.getElementById('summaryStats');
        const resultsGrid = document.getElementById('resultsGrid');
        if (summaryStats) summaryStats.innerHTML = '';
        if (resultsGrid) resultsGrid.innerHTML = '';
        
        // Re-bind event listeners after reset (important for navigation)
        setTimeout(() => {
            console.log('Re-binding event listeners after reset...');
            this.setupEventListeners();
        }, 100);
        
        console.log('My results state reset successfully');
    }
}

// Initialize when script loads (for dynamic loading)
function initMyResults() {
    if (window.app?.currentUser) {
        console.log('Initializing MyResultsManager...');
        window.myResultsManager = new MyResultsManager();
    } else {
        console.log('User not logged in or app not ready, retrying...');
        // Retry after a short delay
        setTimeout(() => {
            if (window.app?.currentUser) {
                console.log('Initializing MyResultsManager (retry)...');
                window.myResultsManager = new MyResultsManager();
            }
        }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMyResults);
} else {
    // DOM already loaded
    initMyResults();
}
