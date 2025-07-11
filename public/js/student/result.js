// Result viewing functionality for students
class ResultViewer {
    constructor() {
        this.resultId = null;
        this.resultData = null;
        this.examData = null;

        this.init();
    }

    async init() {
        try {
            // Get result ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            this.resultId = urlParams.get('result');

            if (!this.resultId) {
                this.showError('Không tìm thấy ID kết quả thi');
                return;
            }

            // Load result data
            await this.loadResult();

            // Hide loading screen
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('resultsContainer').style.display = 'block';

        } catch (error) {
            console.error('Error initializing result viewer:', error);
            this.showError('Có lỗi xảy ra khi tải kết quả thi');
        }
    }

    async loadResult() {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const response = await fetch(`/api/result/${this.resultId}?userId=${user.id}`);

            if (!response.ok) {
                throw new Error('Failed to load result');
            }

            const data = await response.json();
            this.resultData = data.result;
            this.examData = data.exam;

            // Render result data
            this.renderResult();

        } catch (error) {
            throw new Error('Không thể tải dữ liệu kết quả: ' + error.message);
        }
    }

    renderResult() {
        // Update exam title
        document.getElementById('examTitle').textContent = this.examData.title;

        // Calculate and display scores
        const { correct, incorrect, unanswered } = this.calculateStats();
        const totalQuestions = this.examData.questions.length;
        const score = Math.round((correct / totalQuestions) * 10 * 100) / 100; // Scale to 10 points
        const percentage = Math.round((correct / totalQuestions) * 100);

        document.getElementById('scoreValue').textContent = score.toFixed(1);
        document.getElementById('percentValue').textContent = `${percentage}%`;

        // Update stats
        document.getElementById('correctCount').textContent = correct;
        document.getElementById('incorrectCount').textContent = incorrect;
        document.getElementById('unansweredCount').textContent = unanswered;
        document.getElementById('timeSpent').textContent = this.formatTime(this.resultData.timeSpent);

        // Update header color based on score
        this.updateHeaderColor(percentage);

        // Render question details
        this.renderQuestionDetails();
    }

    calculateStats() {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        this.examData.questions.forEach((question, index) => {
            const userAnswer = this.resultData.answers[index];
            const isAnswered = this.isAnswerProvided(userAnswer);

            if (!isAnswered) {
                unanswered++;
            } else if (this.isAnswerCorrect(question, userAnswer)) {
                correct++;
            } else {
                incorrect++;
            }
        });

        return { correct, incorrect, unanswered };
    }

    isAnswerProvided(answer) {
        if (Array.isArray(answer)) {
            return answer.length > 0;
        }
        return answer !== null && answer !== undefined && answer !== '';
    }

    isAnswerCorrect(question, userAnswer) {
        if (question.type === 'multiple-select') {
            if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
                return false;
            }

            // Sort both arrays for comparison
            const sortedUserAnswer = [...userAnswer].sort();
            const sortedCorrectAnswer = [...question.correctAnswer].sort();

            return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
        } else if (question.type === 'text') {
            // For text questions, we'll do a simple comparison
            // In a real system, this might involve more sophisticated text analysis
            return userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        } else {
            // Single choice
            return userAnswer === question.correctAnswer;
        }
    }

    updateHeaderColor(percentage) {
        const header = document.getElementById('resultHeader');

        if (percentage >= 80) {
            header.style.background = 'linear-gradient(135deg, #112444, #1a365d)';
        } else if (percentage >= 60) {
            header.style.background = 'linear-gradient(135deg, #2d5aa0, #1a365d)';
        } else {
            header.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        }
    }

    renderQuestionDetails() {
        const container = document.getElementById('detailsContent');
        container.innerHTML = '';

        this.examData.questions.forEach((question, index) => {
            const questionDiv = this.createQuestionElement(question, index);
            container.appendChild(questionDiv);
        });
    }

    createQuestionElement(question, index) {
        const userAnswer = this.resultData.answers[index];
        const isAnswered = this.isAnswerProvided(userAnswer);
        const isCorrect = isAnswered && this.isAnswerCorrect(question, userAnswer);

        // Determine status
        let status, statusClass;
        if (!isAnswered) {
            status = 'Chưa trả lời';
            statusClass = 'status-unanswered';
        } else if (isCorrect) {
            status = 'Đúng';
            statusClass = 'status-correct';
        } else {
            status = 'Sai';
            statusClass = 'status-incorrect';
        }

        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-result';
        questionDiv.innerHTML = `
            <div class="question-header">
                <div class="question-number">Câu ${index + 1}</div>
                <div class="question-status ${statusClass}">${status}</div>
            </div>
            <div class="question-content">
                <div class="question-text">${question.question}</div>
                ${this.renderAnswerOptions(question, userAnswer)}
            </div>
        `;

        return questionDiv;
    }

    renderAnswerOptions(question, userAnswer) {
        if (question.type === 'text') {
            return `
                <div class="text-answer">
                    <strong>Câu trả lời của bạn:</strong><br>
                    ${userAnswer || '<em>Không có câu trả lời</em>'}
                </div>
                <div class="text-answer" style="border-left-color: #27ae60;">
                    <strong>Đáp án đúng:</strong><br>
                    ${question.correctAnswer}
                </div>
            `;
        }

        let optionsHtml = '';

        question.options.forEach((option, optionIndex) => {
            let optionClass = 'answer-option';
            let isUserAnswer = false;
            let isCorrectAnswer = false;

            // Check if this is the correct answer
            if (question.type === 'multiple-select') {
                isCorrectAnswer = question.correctAnswer.includes(optionIndex);
                isUserAnswer = Array.isArray(userAnswer) && userAnswer.includes(optionIndex);
            } else {
                isCorrectAnswer = question.correctAnswer === optionIndex;
                isUserAnswer = userAnswer === optionIndex;
            }

            // Apply appropriate classes
            if (isCorrectAnswer) {
                optionClass += ' correct';
            }

            if (isUserAnswer) {
                optionClass += ' user-answer';
                if (!isCorrectAnswer) {
                    optionClass += ' incorrect';
                }
            }

            optionsHtml += `<div class="${optionClass}">${option}</div>`;
        });

        return optionsHtml;
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
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
    }
}

// Global functions for UI interactions
function toggleDetails() {
    const content = document.getElementById('detailsContent');
    const button = document.querySelector('.toggle-details');

    if (content.classList.contains('show')) {
        content.classList.remove('show');
        button.textContent = 'Xem chi tiết';
    } else {
        content.classList.add('show');
        button.textContent = 'Ẩn chi tiết';
    }
}

function printResult() {
    // Hide navigation and other non-essential elements for printing
    const actions = document.querySelector('.actions-section');
    const originalDisplay = actions.style.display;
    actions.style.display = 'none';

    window.print();

    // Restore original display
    actions.style.display = originalDisplay;
}

// Initialize result viewer when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = '/';
        return;
    }

    new ResultViewer();
});
