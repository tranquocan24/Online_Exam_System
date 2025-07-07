// Exam functionality for students
class ExamManager {
    constructor() {
        this.examId = null;
        this.examData = null;
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.isSubmitted = false;
        this.autoSaveInterval = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('ExamManager initialized');
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check if there's an exam to load from localStorage
            const currentExam = localStorage.getItem('currentExam');
            const currentExamId = localStorage.getItem('currentExamId');
            
            if (currentExam || currentExamId) {
                await this.loadExam();
                this.setupAutoSave();
                this.startTimer();
                
                // Hide loading screen
                const loadingScreen = document.getElementById('loadingScreen');
                const examContainer = document.getElementById('examContainer');
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (examContainer) examContainer.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error initializing exam:', error);
            this.showError('Có lỗi xảy ra khi tải bài thi');
        }
    }

    async loadExam(examId = null) {
        try {
            // Use provided examId or get from URL/localStorage
            if (examId) {
                this.examId = examId;
            } else if (!this.examId) {
                // Try to get from localStorage (set by exam_list.js)
                const currentExam = localStorage.getItem('currentExam');
                const currentExamId = localStorage.getItem('currentExamId');
                
                if (currentExam) {
                    const examData = JSON.parse(currentExam);
                    this.examId = examData.examId;
                } else if (currentExamId) {
                    this.examId = currentExamId;
                } else {
                    const urlParams = new URLSearchParams(window.location.search);
                    this.examId = urlParams.get('id');
                }
            }

            if (!this.examId) {
                this.showError('Không tìm thấy ID bài thi');
                return;
            }

            console.log('Loading exam with ID:', this.examId);
            const response = await fetch(`/api/exam/${this.examId}`);
            if (!response.ok) {
                throw new Error('Failed to load exam');
            }
            
            this.examData = await response.json();
            
            // Set initial time
            this.timeRemaining = this.examData.duration * 60; // Convert minutes to seconds
            
            // Initialize answers object
            this.examData.questions.forEach((_, index) => {
                this.answers[index] = null;
            });
            
            // Render exam info
            this.renderExamInfo();
            
            // Render question navigation
            this.renderQuestionNavigation();
            
            // Show first question
            this.showQuestion(0);
            
        } catch (error) {
            throw new Error('Không thể tải dữ liệu bài thi: ' + error.message);
        }
    }

    renderExamInfo() {
        document.getElementById('examTitle').textContent = this.examData.title;
        document.getElementById('examDescription').textContent = this.examData.description;
        document.getElementById('examDuration').textContent = this.examData.duration;
        document.getElementById('examQuestionCount').textContent = this.examData.questions.length;
        document.getElementById('totalQuestions').textContent = this.examData.questions.length;
    }

    renderQuestionNavigation() {
        const navigation = document.getElementById('questionNavigation');
        navigation.innerHTML = '';
        
        this.examData.questions.forEach((_, index) => {
            const navItem = document.createElement('div');
            navItem.className = 'question-nav-item';
            navItem.textContent = index + 1;
            navItem.addEventListener('click', () => this.showQuestion(index));
            navigation.appendChild(navItem);
        });
    }

    showQuestion(index) {
        if (index < 0 || index >= this.examData.questions.length) return;
        
        this.currentQuestionIndex = index;
        const question = this.examData.questions[index];
        
        // Update question display
        document.getElementById('questionNumber').textContent = `Câu ${index + 1}`;
        document.getElementById('questionType').textContent = this.getQuestionTypeText(question.type);
        document.getElementById('questionText').textContent = question.question;
        document.getElementById('currentQuestionNumber').textContent = index + 1;
        
        // Update progress
        this.updateProgress();
        
        // Update navigation state
        this.updateNavigationState();
        
        // Render options
        this.renderQuestionOptions(question, index);
        
        // Update question card style
        this.updateQuestionCardStyle();
    }

    getQuestionTypeText(type) {
        const types = {
            'multiple-choice': 'Trắc nghiệm',
            'multiple-select': 'Nhiều lựa chọn',
            'text': 'Tự luận'
        };
        return types[type] || 'Không xác định';
    }

    renderQuestionOptions(question, questionIndex) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        if (question.type === 'text') {
            const textarea = document.createElement('textarea');
            textarea.className = 'text-input';
            textarea.placeholder = 'Nhập câu trả lời của bạn...';
            textarea.value = this.answers[questionIndex] || '';
            
            textarea.addEventListener('input', (e) => {
                this.answers[questionIndex] = e.target.value;
                this.updateProgress();
            });
            
            container.appendChild(textarea);
        } else {
            question.options.forEach((option, optionIndex) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                
                const input = document.createElement('input');
                input.type = question.type === 'multiple-select' ? 'checkbox' : 'radio';
                input.name = `question_${questionIndex}`;
                input.value = optionIndex;
                input.id = `option_${questionIndex}_${optionIndex}`;
                
                // Set current answer
                if (question.type === 'multiple-select') {
                    const selectedOptions = this.answers[questionIndex] || [];
                    input.checked = selectedOptions.includes(optionIndex);
                } else {
                    input.checked = this.answers[questionIndex] === optionIndex;
                }
                
                const label = document.createElement('label');
                label.htmlFor = input.id;
                label.className = 'option-text';
                label.textContent = option;
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                
                // Add event listener
                input.addEventListener('change', () => {
                    this.handleAnswerChange(questionIndex, optionIndex, question.type);
                });
                
                // Make entire option clickable
                optionDiv.addEventListener('click', (e) => {
                    if (e.target !== input) {
                        input.click();
                    }
                });
                
                container.appendChild(optionDiv);
            });
        }
    }

    handleAnswerChange(questionIndex, optionIndex, questionType) {
        if (questionType === 'multiple-select') {
            if (!this.answers[questionIndex]) {
                this.answers[questionIndex] = [];
            }
            
            const selectedOptions = this.answers[questionIndex];
            const index = selectedOptions.indexOf(optionIndex);
            
            if (index > -1) {
                selectedOptions.splice(index, 1);
            } else {
                selectedOptions.push(optionIndex);
            }
        } else {
            this.answers[questionIndex] = optionIndex;
        }
        
        this.updateProgress();
        this.updateQuestionCardStyle();
    }

    updateProgress() {
        const answered = Object.values(this.answers).filter(answer => {
            if (Array.isArray(answer)) {
                return answer.length > 0;
            }
            return answer !== null && answer !== undefined && answer !== '';
        }).length;
        
        document.getElementById('answeredCount').textContent = answered;
        
        const progressPercent = (answered / this.examData.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
        
        // Update question navigation
        this.updateQuestionNavigation();
    }

    updateQuestionNavigation() {
        const navItems = document.querySelectorAll('.question-nav-item');
        navItems.forEach((item, index) => {
            item.classList.remove('current', 'answered');
            
            if (index === this.currentQuestionIndex) {
                item.classList.add('current');
            }
            
            const answer = this.answers[index];
            const isAnswered = Array.isArray(answer) ? answer.length > 0 : 
                              (answer !== null && answer !== undefined && answer !== '');
            
            if (isAnswered) {
                item.classList.add('answered');
            }
        });
    }

    updateNavigationState() {
        const previousBtn = document.getElementById('previousBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        previousBtn.disabled = this.currentQuestionIndex === 0;
        
        if (this.currentQuestionIndex === this.examData.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    updateQuestionCardStyle() {
        const questionCard = document.getElementById('questionCard');
        const answer = this.answers[this.currentQuestionIndex];
        const isAnswered = Array.isArray(answer) ? answer.length > 0 : 
                          (answer !== null && answer !== undefined && answer !== '');
        
        if (isAnswered) {
            questionCard.classList.add('answered');
        } else {
            questionCard.classList.remove('answered');
        }
        
        // Update option styles
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            const input = option.querySelector('input');
            if (input && input.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.timeUp();
            } else if (this.timeRemaining <= 300) { // 5 minutes
                this.showTimeWarning();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        
        const timer = document.getElementById('timer');
        if (this.timeRemaining <= 60) { // 1 minute
            timer.classList.add('timer-critical');
        } else if (this.timeRemaining <= 300) { // 5 minutes
            timer.classList.add('timer-warning');
        }
    }

    showTimeWarning() {
        if (this.timeRemaining === 300) { // Show warning at 5 minutes
            this.showWarning('Chỉ còn 5 phút để hoàn thành bài thi!');
        } else if (this.timeRemaining === 60) { // Show warning at 1 minute
            this.showWarning('Chỉ còn 1 phút để hoàn thành bài thi!');
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        this.showWarning('Hết thời gian! Bài thi sẽ được nộp tự động.');
        setTimeout(() => {
            this.submitExam(true);
        }, 2000);
    }

    showWarning(message) {
        const banner = document.getElementById('warningBanner');
        const text = document.getElementById('warningText');
        text.textContent = message;
        banner.style.display = 'flex';
        
        setTimeout(() => {
            banner.style.display = 'none';
        }, 5000);
    }

    setupEventListeners() {
        document.getElementById('previousBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex > 0) {
                this.showQuestion(this.currentQuestionIndex - 1);
            }
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentQuestionIndex < this.examData.questions.length - 1) {
                this.showQuestion(this.currentQuestionIndex + 1);
            }
        });
        
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.confirmSubmit();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentQuestionIndex > 0) {
                this.showQuestion(this.currentQuestionIndex - 1);
            } else if (e.key === 'ArrowRight' && this.currentQuestionIndex < this.examData.questions.length - 1) {
                this.showQuestion(this.currentQuestionIndex + 1);
            }
        });
        
        // Prevent accidental page leave
        window.addEventListener('beforeunload', (e) => {
            if (!this.isSubmitted) {
                e.preventDefault();
                e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang? Dữ liệu bài thi có thể bị mất.';
            }
        });
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveProgress();
        }, 30000); // Auto-save every 30 seconds
    }

    async saveProgress() {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const progressData = {
                examId: this.examId,
                userId: user.id,
                answers: this.answers,
                currentQuestion: this.currentQuestionIndex,
                timeRemaining: this.timeRemaining,
                timestamp: new Date().toISOString()
            };
            
            await fetch('/api/exam/save-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    confirmSubmit() {
        const answered = Object.values(this.answers).filter(answer => {
            if (Array.isArray(answer)) {
                return answer.length > 0;
            }
            return answer !== null && answer !== undefined && answer !== '';
        }).length;
        
        const unanswered = this.examData.questions.length - answered;
        
        let message = `Bạn có chắc chắn muốn nộp bài?\n\n`;
        message += `Đã trả lời: ${answered}/${this.examData.questions.length} câu`;
        
        if (unanswered > 0) {
            message += `\nCòn lại ${unanswered} câu chưa trả lời.`;
        }
        
        if (confirm(message)) {
            this.submitExam();
        }
    }

    async submitExam(isTimeUp = false) {
        if (this.isSubmitted) return;
        
        try {
            console.log('Starting exam submission...');
            this.isSubmitted = true;
            clearInterval(this.timerInterval);
            clearInterval(this.autoSaveInterval);
            
            // Get user from app or sessionStorage
            const user = window.app?.currentUser || JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('currentUser') || '{}');
            
            if (!user || !user.id) {
                throw new Error('User not found');
            }
            
            console.log('User:', user);
            
            const submissionData = {
                examId: this.examId,
                userId: user.id,
                userName: user.name,
                answers: this.answers,
                timeSpent: (this.examData.duration * 60) - this.timeRemaining,
                submittedAt: new Date().toISOString(),
                isTimeUp: isTimeUp
            };
            
            console.log('Submission data:', submissionData);
            
            // Show loading
            const loadingScreen = document.getElementById('loadingScreen');
            const loadingText = document.querySelector('.loading-text');
            if (loadingScreen) loadingScreen.style.display = 'flex';
            if (loadingText) loadingText.textContent = 'Đang nộp bài...';
            
            console.log('Sending submission to API...');
            const response = await fetch('/api/exam/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`Failed to submit exam: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Submission result:', result);
            
            // Clear exam data from localStorage
            localStorage.removeItem('currentExam');
            localStorage.removeItem('currentExamId');
            
            // Navigate to results using app's loadPage method
            if (window.app && typeof window.app.loadPage === 'function') {
                localStorage.setItem('viewResultId', result.resultId);
                window.app.loadPage('my_results');
            } else {
                // Fallback to direct navigation
                window.location.href = `/student.html?content=my_results&result=${result.resultId}`;
            }
            
        } catch (error) {
            console.error('Error submitting exam:', error);
            this.isSubmitted = false;
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) loadingScreen.style.display = 'none';
            
            this.showError(`Có lỗi xảy ra khi nộp bài: ${error.message}. Vui lòng thử lại.`);
            
            // Restart timer if submission failed
            if (!isTimeUp) {
                this.startTimer();
            }
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize exam when page loads or when called dynamically
function initializeExam() {
    // Check if user is logged in
    if (!window.app?.currentUser) {
        console.error('User not logged in');
        return;
    }
    
    // Create exam controller
    window.examController = new ExamManager();
    console.log('ExamController initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExam);
} else {
    // DOM already loaded, initialize immediately
    initializeExam();
}
