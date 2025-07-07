// teacher/create_exam.js - Tạo đề thi mới

class CreateExam {
    constructor() {
        this.questions = [];
        this.questionCounter = 0;
        this.currentUser = null;
        this.isDraft = false;
        this.autoSaveInterval = null;
        
        // Make instance globally accessible
        window.createExam = this;
        
        this.init();
    }

    init() {
        console.log('Create Exam initialized');
        this.currentUser = window.app?.currentUser || JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!this.currentUser || this.currentUser.role !== 'teacher') {
            console.error('Unauthorized access');
            return;
        }

        // Delay binding events to ensure DOM is ready
        setTimeout(() => {
            this.bindEvents();
            this.setupAutoSave();
            
            // Add first question by default
            setTimeout(() => {
                this.addQuestion();
            }, 200);
        }, 100);
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('createExamForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        } else {
            console.error('createExamForm not found');
        }

        // Add question button
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addQuestion();
            });
        } else {
            console.error('addQuestionBtn not found');
        }

        // Save as draft button
        const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
        if (saveAsDraftBtn) {
            saveAsDraftBtn.addEventListener('click', () => this.saveAsDraft());
        }

        // Import questions button
        const importBtn = document.getElementById('importQuestionsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importQuestions());
        }

        // Auto-save on form changes
        const examForm = document.getElementById('createExamForm');
        if (examForm) {
            examForm.addEventListener('input', () => {
                this.markAsModified();
            });
        }
    }

    setupAutoSave() {
        // Auto-save every 2 minutes
        this.autoSaveInterval = setInterval(() => {
            if (this.isModified) {
                this.autoSave();
            }
        }, 2 * 60 * 1000);
    }

    addQuestion(questionData = null) {
        try {
            this.questionCounter++;
            const questionId = `q_${Date.now()}_${this.questionCounter}`;
            
            const template = document.getElementById('questionTemplate');
            if (!template) {
                console.error('Question template not found');
                return;
            }
            
            const questionElement = template.content.cloneNode(true);
            
            // Set question number and ID
            const questionItem = questionElement.querySelector('.question-item');
            if (!questionItem) {
                console.error('Question item not found in template');
                return;
            }
            
            questionItem.setAttribute('data-question-id', questionId);
            const numberElement = questionElement.querySelector('.number');
            if (numberElement) {
                numberElement.textContent = this.questionCounter;
            }
            
            // Setup question type change handler
            const typeSelect = questionElement.querySelector('.question-type-select');
            if (typeSelect) {
                typeSelect.addEventListener('change', (e) => {
                    this.changeQuestionType(e.target.closest('.question-item'), e.target.value);
                });
            }
            
            // Add initial options for multiple choice
            this.setupQuestionOptions(questionItem);
            
            // Insert question
            const container = document.getElementById('questionsContainer');
            if (!container) {
                console.error('Questions container not found');
                return;
            }
            
            container.appendChild(questionElement);
            
            // Hide empty state
            const emptyState = document.getElementById('emptyQuestions');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Update questions array
            const questionObj = {
                id: questionId,
                type: 'multiple-choice',
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                points: 1,
                explanation: ''
            };
            
            if (questionData) {
                Object.assign(questionObj, questionData);
                this.populateQuestionData(questionItem, questionData);
            }
            
            this.questions.push(questionObj);
            this.updateQuestionNumbers();
            
            // Mark form as modified
            this.markAsModified();
            
            // Focus on question text
            setTimeout(() => {
                questionItem.querySelector('.question-text').focus();
            }, 100);
            
        } catch (error) {
            console.error('Error adding question:', error);
        }
    }

    setupQuestionOptions(questionContainer) {
        const optionsContainer = questionContainer.querySelector('.options-container');
        
        // Add 4 default options
        for (let i = 0; i < 4; i++) {
            this.addOptionToQuestion(questionContainer, '', i === 0);
        }
    }

    addOptionToQuestion(questionContainer, text = '', isCorrect = false) {
        const template = document.getElementById('optionTemplate');
        const optionElement = template.content.cloneNode(true);
        
        const optionInput = optionElement.querySelector('.option-text');
        const correctRadio = optionElement.querySelector('.correct-indicator');
        
        optionInput.value = text;
        if (isCorrect) {
            correctRadio.checked = true;
        }
        
        // Make radio buttons unique within this question
        const questionId = questionContainer.getAttribute('data-question-id');
        correctRadio.name = `correct-${questionId}`;
        
        const optionsContainer = questionContainer.querySelector('.options-container');
        optionsContainer.appendChild(optionElement);
        
        this.markAsModified();
    }

    addOption(button) {
        const questionContainer = button.closest('.question-item');
        this.addOptionToQuestion(questionContainer);
    }

    removeOption(button) {
        const optionItem = button.closest('.option-item');
        const questionContainer = button.closest('.question-item');
        const optionsContainer = questionContainer.querySelector('.options-container');
        
        // Don't allow removing if only 2 options left
        if (optionsContainer.children.length <= 2) {
            this.showMessage('Phải có ít nhất 2 đáp án', 'warning');
            return;
        }
        
        optionItem.remove();
        this.markAsModified();
    }

    changeQuestionType(questionContainer, newType) {
        const multipleChoiceOptions = questionContainer.querySelector('.multiple-choice-options');
        const textOptions = questionContainer.querySelector('.text-options');
        
        if (newType === 'text') {
            multipleChoiceOptions.style.display = 'none';
            textOptions.style.display = 'block';
        } else {
            multipleChoiceOptions.style.display = 'block';
            textOptions.style.display = 'none';
            
            // Update radio button behavior for multiple-select
            const radios = questionContainer.querySelectorAll('.correct-indicator');
            if (newType === 'multiple-select') {
                radios.forEach(radio => {
                    radio.type = 'checkbox';
                });
            } else {
                radios.forEach(radio => {
                    radio.type = 'radio';
                });
            }
        }
        
        this.markAsModified();
    }

    deleteQuestion(button) {
        const questionItem = button.closest('.question-item');
        const questionId = questionItem.getAttribute('data-question-id');
        
        if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
            questionItem.remove();
            
            // Remove from questions array
            this.questions = this.questions.filter(q => q.id !== questionId);
            
            this.updateQuestionNumbers();
            this.markAsModified();
            
            // Show empty state if no questions
            if (this.questions.length === 0) {
                document.getElementById('emptyQuestions').style.display = 'block';
            }
        }
    }

    duplicateQuestion(button) {
        const questionItem = button.closest('.question-item');
        const questionData = this.extractQuestionData(questionItem);
        
        if (questionData) {
            this.addQuestion(questionData);
        }
    }

    moveQuestionUp(button) {
        const questionItem = button.closest('.question-item');
        const prevSibling = questionItem.previousElementSibling;
        
        if (prevSibling) {
            questionItem.parentNode.insertBefore(questionItem, prevSibling);
            this.updateQuestionNumbers();
            this.markAsModified();
        }
    }

    moveQuestionDown(button) {
        const questionItem = button.closest('.question-item');
        const nextSibling = questionItem.nextElementSibling;
        
        if (nextSibling) {
            questionItem.parentNode.insertBefore(nextSibling, questionItem);
            this.updateQuestionNumbers();
            this.markAsModified();
        }
    }

    updateQuestionNumbers() {
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach((item, index) => {
            item.querySelector('.number').textContent = index + 1;
        });
    }

    extractQuestionData(questionContainer) {
        const questionId = questionContainer.getAttribute('data-question-id');
        const type = questionContainer.querySelector('.question-type-select').value;
        const questionText = questionContainer.querySelector('.question-text').value;
        const points = parseFloat(questionContainer.querySelector('.question-points').value) || 1;
        const explanation = questionContainer.querySelector('.question-explanation').value;
        
        let questionData = {
            id: questionId,
            type: type,
            question: questionText,
            points: points,
            explanation: explanation
        };
        
        if (type === 'text') {
            questionData.correctAnswer = questionContainer.querySelector('.correct-text-answer').value;
            questionData.caseSensitive = questionContainer.querySelector('.case-sensitive').checked;
        } else {
            // Multiple choice or multiple select
            const options = [];
            const optionInputs = questionContainer.querySelectorAll('.option-text');
            optionInputs.forEach(input => {
                options.push(input.value);
            });
            
            questionData.options = options;
            
            if (type === 'multiple-choice') {
                const correctRadio = questionContainer.querySelector('.correct-indicator:checked');
                const correctIndex = Array.from(questionContainer.querySelectorAll('.correct-indicator')).indexOf(correctRadio);
                questionData.correctAnswer = correctIndex;
            } else {
                // multiple-select
                const correctCheckboxes = questionContainer.querySelectorAll('.correct-indicator:checked');
                const correctIndices = Array.from(correctCheckboxes).map(checkbox => 
                    Array.from(questionContainer.querySelectorAll('.correct-indicator')).indexOf(checkbox)
                );
                questionData.correctAnswer = correctIndices;
            }
        }
        
        return questionData;
    }

    populateQuestionData(questionContainer, questionData) {
        questionContainer.querySelector('.question-type-select').value = questionData.type;
        questionContainer.querySelector('.question-text').value = questionData.question || '';
        questionContainer.querySelector('.question-points').value = questionData.points || 1;
        questionContainer.querySelector('.question-explanation').value = questionData.explanation || '';
        
        // Trigger type change to show correct options
        this.changeQuestionType(questionContainer, questionData.type);
        
        if (questionData.type === 'text') {
            questionContainer.querySelector('.correct-text-answer').value = questionData.correctAnswer || '';
            if (questionData.caseSensitive) {
                questionContainer.querySelector('.case-sensitive').checked = true;
            }
        } else {
            // Clear existing options and add new ones
            const optionsContainer = questionContainer.querySelector('.options-container');
            optionsContainer.innerHTML = '';
            
            questionData.options.forEach((option, index) => {
                const isCorrect = questionData.type === 'multiple-choice' 
                    ? index === questionData.correctAnswer
                    : questionData.correctAnswer.includes(index);
                this.addOptionToQuestion(questionContainer, option, isCorrect);
            });
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            const examData = this.collectFormData();
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(examData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showMessage('Tạo bài thi thành công!', 'success');
                
                // Clear auto-save
                this.clearAutoSave();
                
                // Redirect to manage exams
                setTimeout(() => {
                    window.app.loadPage('manage_exams');
                }, 1500);
            } else {
                throw new Error('Failed to create exam');
            }
            
        } catch (error) {
            console.error('Error creating exam:', error);
            this.showMessage('Có lỗi xảy ra khi tạo bài thi. Vui lòng thử lại.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    collectFormData() {
        const form = document.getElementById('createExamForm');
        const formData = new FormData(form);
        
        const examData = {
            title: formData.get('title'),
            subject: formData.get('subject'),
            description: formData.get('description'),
            duration: parseInt(formData.get('duration')),
            maxAttempts: parseInt(formData.get('maxAttempts')) || 1,
            shuffleQuestions: formData.has('shuffleQuestions'),
            shuffleAnswers: formData.has('shuffleAnswers'),
            showResults: formData.has('showResults'),
            allowReview: formData.has('allowReview'),
            createdBy: this.currentUser.id,
            questions: []
        };
        
        // Collect questions data
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(questionContainer => {
            const questionData = this.extractQuestionData(questionContainer);
            if (questionData.question.trim()) {
                examData.questions.push(questionData);
            }
        });
        
        return examData;
    }

    validateForm() {
        const examData = this.collectFormData();
        
        // Basic validation
        if (!examData.title.trim()) {
            this.showMessage('Vui lòng nhập tiêu đề bài thi', 'error');
            return false;
        }
        
        if (!examData.subject) {
            this.showMessage('Vui lòng chọn môn học', 'error');
            return false;
        }
        
        if (examData.questions.length === 0) {
            this.showMessage('Bài thi phải có ít nhất 1 câu hỏi', 'error');
            return false;
        }
        
        // Validate each question
        for (let i = 0; i < examData.questions.length; i++) {
            const question = examData.questions[i];
            
            if (!question.question.trim()) {
                this.showMessage(`Câu hỏi ${i + 1} không được để trống`, 'error');
                return false;
            }
            
            if (question.type === 'text') {
                if (!question.correctAnswer.trim()) {
                    this.showMessage(`Câu hỏi ${i + 1} phải có đáp án đúng`, 'error');
                    return false;
                }
            } else {
                // Multiple choice validation
                if (question.options.some(opt => !opt.trim())) {
                    this.showMessage(`Câu hỏi ${i + 1} có đáp án trống`, 'error');
                    return false;
                }
                
                if (question.type === 'multiple-choice' && question.correctAnswer === -1) {
                    this.showMessage(`Câu hỏi ${i + 1} phải chọn đáp án đúng`, 'error');
                    return false;
                }
                
                if (question.type === 'multiple-select' && question.correctAnswer.length === 0) {
                    this.showMessage(`Câu hỏi ${i + 1} phải chọn ít nhất 1 đáp án đúng`, 'error');
                    return false;
                }
            }
        }
        
        return true;
    }

    async saveAsDraft() {
        try {
            this.isDraft = true;
            const examData = this.collectFormData();
            examData.isDraft = true;
            
            // Save to localStorage as backup
            localStorage.setItem('exam_draft', JSON.stringify(examData));
            
            this.showMessage('Đã lưu nháp', 'success');
            this.isModified = false;
            
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showMessage('Có lỗi khi lưu nháp', 'error');
        }
    }

    async autoSave() {
        if (!this.isModified) return;
        
        try {
            const examData = this.collectFormData();
            localStorage.setItem('exam_autosave', JSON.stringify({
                ...examData,
                autoSavedAt: new Date().toISOString()
            }));
            
            this.showSaveProgress();
            this.isModified = false;
            
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    loadDraft() {
        const draft = localStorage.getItem('exam_draft');
        if (draft) {
            try {
                const examData = JSON.parse(draft);
                this.populateForm(examData);
                this.showMessage('Đã tải nháp đã lưu', 'info');
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    importQuestions() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.csv';
        fileInput.onchange = (e) => this.handleFileImport(e);
        fileInput.click();
    }

    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.questions && Array.isArray(data.questions)) {
                    data.questions.forEach(questionData => {
                        this.addQuestion(questionData);
                    });
                    this.showMessage(`Đã import ${data.questions.length} câu hỏi`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showMessage('File không đúng định dạng', 'error');
            }
        };
        reader.readAsText(file);
    }

    markAsModified() {
        this.isModified = true;
    }

    showLoading(show) {
        const progress = document.getElementById('saveProgress');
        if (progress) {
            progress.style.display = show ? 'flex' : 'none';
        }
    }

    showSaveProgress() {
        const progress = document.getElementById('saveProgress');
        if (progress) {
            progress.style.display = 'flex';
            setTimeout(() => {
                progress.style.display = 'none';
            }, 1000);
        }
    }

    clearAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        localStorage.removeItem('exam_autosave');
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
        }, 4000);
    }

    reset() {
        console.log('Resetting create exam form...');
        this.questions = [];
        this.questionCounter = 0;
        this.isDraft = false;
        
        // Reset form fields
        const form = document.getElementById('examForm');
        if (form) {
            form.reset();
        }
        
        // Clear questions container
        const questionsContainer = document.getElementById('questionsContainer');
        if (questionsContainer) {
            questionsContainer.innerHTML = '';
        }
        
        // Add first question again
        setTimeout(() => {
            this.addQuestion();
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app?.currentRole === 'teacher') {
        window.createExam = new CreateExam();
    }
});

// Also initialize if loaded dynamically
if (window.app?.currentRole === 'teacher') {
    window.createExam = new CreateExam();
}
