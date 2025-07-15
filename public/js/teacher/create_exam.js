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
            
            // Don't add question automatically - let user click to add
            console.log('CreateExam initialized, ready for user interaction');
        }, 100);
    }

    bindEvents() {
        console.log('Binding events for CreateExam...');
        
        // Form submission
        const form = document.getElementById('createExamForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log('Form submit event bound');
        } else {
            console.error('createExamForm not found');
        }

        // Add question button
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        if (addQuestionBtn) {
            // Remove existing listeners to prevent duplicates
            addQuestionBtn.replaceWith(addQuestionBtn.cloneNode(true));
            const newBtn = document.getElementById('addQuestionBtn');
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Add question button clicked');
                this.addQuestion();
            });
            console.log('Add question button event bound');
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

        // Import Markdown button
        const importMarkdownBtn = document.getElementById('importMarkdownBtn');
        if (importMarkdownBtn) {
            importMarkdownBtn.addEventListener('click', () => this.openMarkdownModal());
        }

        // Markdown file input
        const markdownFile = document.getElementById('markdownFile');
        if (markdownFile) {
            markdownFile.addEventListener('change', (e) => this.handleMarkdownFile(e));
        }

        // Markdown content textarea
        const markdownContent = document.getElementById('markdownContent');
        if (markdownContent) {
            markdownContent.addEventListener('input', (e) => this.previewMarkdown(e.target.value));
        }

        // Drag and drop for file upload
        const fileUploadZone = document.querySelector('.file-upload-zone');
        if (fileUploadZone) {
            fileUploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileUploadZone.addEventListener('drop', (e) => this.handleDrop(e));
            fileUploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
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
        console.log('addQuestion() called', questionData);
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
            console.log('Question added to container');
            
            // Hide empty state
            const emptyState = document.getElementById('emptyQuestions');
            if (emptyState) {
                emptyState.style.display = 'none';
                console.log('Empty state hidden');
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

    // Method to add option with container and text (for Markdown import)
    addOptionWithText(optionsContainer, text = '') {
        const template = document.getElementById('optionTemplate');
        const optionElement = template.content.cloneNode(true);
        
        const optionInput = optionElement.querySelector('.option-text');
        const correctRadio = optionElement.querySelector('.correct-indicator');
        
        optionInput.value = text;
        
        // Make radio buttons unique within this question
        const questionContainer = optionsContainer.closest('.question-item');
        const questionId = questionContainer.getAttribute('data-question-id');
        correctRadio.name = `correct-${questionId}`;
        
        optionsContainer.appendChild(optionElement);
        this.markAsModified();
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
        try {
            // Set question text
            const questionText = questionContainer.querySelector('.question-text');
            if (questionText) {
                questionText.value = questionData.text || '';
            }

            // Set question type
            const typeSelect = questionContainer.querySelector('.question-type-select');
            if (typeSelect) {
                typeSelect.value = questionData.type || 'multiple-choice';
                this.changeQuestionType(questionContainer, questionData.type || 'multiple-choice');
            }

            // Set score
            const scoreInput = questionContainer.querySelector('.question-score');
            if (scoreInput) {
                scoreInput.value = questionData.score || 1;
            }

            // Set options and correct answers
            if (questionData.options && questionData.options.length > 0) {
                const optionsContainer = questionContainer.querySelector('.options-container');
                if (optionsContainer) {
                    // Clear existing options
                    optionsContainer.innerHTML = '';
                    
                    // Add options from data
                    questionData.options.forEach((optionText, index) => {
                        this.addOptionWithText(optionsContainer, optionText);
                        
                        // Set correct answer
                        const optionElement = optionsContainer.children[index];
                        if (optionElement) {
                            const correctCheckbox = optionElement.querySelector('input[type="checkbox"], input[type="radio"]');
                            if (correctCheckbox) {
                                if (questionData.type === 'multiple-choice' && questionData.correctAnswer === index) {
                                    correctCheckbox.checked = true;
                                } else if (questionData.type === 'multiple-select' && 
                                          questionData.correctAnswers && 
                                          questionData.correctAnswers.includes(index)) {
                                    correctCheckbox.checked = true;
                                }
                            }
                        }
                    });
                }
            }

            // Set sample answer for text questions
            if (questionData.type === 'text' && questionData.sampleAnswer) {
                const sampleAnswer = questionContainer.querySelector('.sample-answer');
                if (sampleAnswer) {
                    sampleAnswer.value = questionData.sampleAnswer;
                }
            }

        } catch (error) {
            console.error('Error populating question data:', error);
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

    // Markdown Import Methods
    openMarkdownModal() {
        const modal = document.getElementById('importMarkdownModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeMarkdownModal() {
        const modal = document.getElementById('importMarkdownModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Clear file input and content
        const fileInput = document.getElementById('markdownFile');
        const contentInput = document.getElementById('markdownContent');
        const preview = document.getElementById('markdownPreview');
        
        if (fileInput) fileInput.value = '';
        if (contentInput) contentInput.value = '';
        if (preview) preview.innerHTML = '<p class="preview-placeholder">Nội dung sẽ được hiển thị ở đây sau khi chọn file hoặc dán nội dung</p>';
    }

    handleMarkdownFile(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/markdown' || file.name.endsWith('.md')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                document.getElementById('markdownContent').value = content;
                this.previewMarkdown(content);
            };
            reader.readAsText(file);
        } else {
            this.showMessage('Vui lòng chọn file Markdown (.md)', 'error');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    document.getElementById('markdownContent').value = content;
                    this.previewMarkdown(content);
                };
                reader.readAsText(file);
            } else {
                this.showMessage('Vui lòng chọn file Markdown (.md)', 'error');
            }
        }
    }

    previewMarkdown(content) {
        const preview = document.getElementById('markdownPreview');
        if (!preview) return;

        if (!content.trim()) {
            preview.innerHTML = '<p class="preview-placeholder">Nội dung sẽ được hiển thị ở đây sau khi chọn file hoặc dán nội dung</p>';
            return;
        }

        try {
            const parsed = this.parseMarkdownExam(content);
            let html = '';
            
            if (parsed.examInfo) {
                html += `<div class="exam-info">
                    <h3>Thông tin đề thi:</h3>
                    <p><strong>Tiêu đề:</strong> ${parsed.examInfo.title || 'Chưa có'}</p>
                    <p><strong>Môn học:</strong> ${parsed.examInfo.subject || 'Chưa có'}</p>
                    <p><strong>Thời gian:</strong> ${parsed.examInfo.duration || 'Chưa có'} phút</p>
                    <p><strong>Số câu hỏi:</strong> ${parsed.questions.length}</p>
                </div>`;
            }

            parsed.questions.forEach((question, index) => {
                html += `<div class="question-preview">
                    <h4>Câu ${index + 1}: ${question.type === 'multiple-choice' ? 'Trắc nghiệm đơn' : 
                         question.type === 'multiple-select' ? 'Trắc nghiệm nhiều lựa chọn' : 'Tự luận'}</h4>
                    <div class="question-meta">Điểm: ${question.score}</div>
                    <div class="question-content">${question.text}</div>`;

                if (question.options && question.options.length > 0) {
                    html += '<ul class="question-options">';
                    question.options.forEach((option, optIndex) => {
                        const isCorrect = question.type === 'multiple-choice' ? 
                            question.correctAnswer === optIndex :
                            question.correctAnswers && question.correctAnswers.includes(optIndex);
                        
                        html += `<li class="${isCorrect ? 'correct' : ''}">${option}</li>`;
                    });
                    html += '</ul>';
                }

                html += '</div>';
                if (index < parsed.questions.length - 1) {
                    html += '<div class="question-separator"></div>';
                }
            });

            preview.innerHTML = html;
        } catch (error) {
            console.error('Error parsing markdown:', error);
            preview.innerHTML = '<p class="preview-placeholder" style="color: #e53e3e;">Lỗi: Không thể phân tích nội dung Markdown. Vui lòng kiểm tra định dạng.</p>';
        }
    }

    parseMarkdownExam(content) {
        const lines = content.split('\n');
        const examInfo = {};
        const questions = [];
        let currentQuestion = null;
        let currentSection = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Parse exam info from header
            if (line.startsWith('# ')) {
                examInfo.title = line.substring(2).trim();
            } else if (line.startsWith('**Môn học:**')) {
                examInfo.subject = line.replace('**Môn học:**', '').trim();
            } else if (line.startsWith('**Thời gian:**')) {
                const timeMatch = line.match(/(\d+)\s*phút/);
                if (timeMatch) {
                    examInfo.duration = parseInt(timeMatch[1]);
                }
            } else if (line.startsWith('**Mô tả:**')) {
                examInfo.description = line.replace('**Mô tả:**', '').trim();
            }

            // Parse questions
            if (line.startsWith('## Câu ')) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    text: line.substring(line.indexOf(':') + 1).trim(),
                    type: 'multiple-choice',
                    options: [],
                    score: 1
                };
            } else if (line.startsWith('**Loại:**')) {
                const type = line.replace('**Loại:**', '').trim();
                if (currentQuestion) {
                    currentQuestion.type = type;
                }
            } else if (line.startsWith('**Điểm:**')) {
                const score = parseInt(line.replace('**Điểm:**', '').trim());
                if (currentQuestion) {
                    currentQuestion.score = score;
                }
            } else if (line.startsWith('**Đáp án:**')) {
                const answer = line.replace('**Đáp án:**', '').trim();
                if (currentQuestion) {
                    if (currentQuestion.type === 'multiple-choice') {
                        // Convert A,B,C,D to index
                        const answerIndex = answer.charCodeAt(0) - 65;
                        currentQuestion.correctAnswer = answerIndex;
                    } else if (currentQuestion.type === 'multiple-select') {
                        // Convert A,C,D to array of indices
                        const answers = answer.split(',').map(a => a.trim().charCodeAt(0) - 65);
                        currentQuestion.correctAnswers = answers;
                    } else {
                        currentQuestion.sampleAnswer = answer;
                    }
                }
            } else if (line.startsWith('- ') && currentQuestion) {
                // Parse options
                const optionText = line.substring(2).trim();
                if (optionText.match(/^[A-E]\./)) {
                    // Remove A. B. C. D. E. prefix
                    const cleanOption = optionText.substring(2).trim();
                    currentQuestion.options.push(cleanOption);
                }
            } else if (line && !line.startsWith('---') && !line.startsWith('**') && currentQuestion && currentQuestion.type === 'text') {
                // Add text content for essay questions
                if (!currentQuestion.text.includes(line)) {
                    currentQuestion.text += ' ' + line;
                }
            }
        }

        // Add last question
        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        return { examInfo, questions };
    }

    importFromMarkdown() {
        const content = document.getElementById('markdownContent').value;
        if (!content.trim()) {
            this.showMessage('Vui lòng nhập nội dung Markdown', 'error');
            return;
        }

        try {
            const parsed = this.parseMarkdownExam(content);
            
            // Update exam info
            if (parsed.examInfo) {
                const titleInput = document.getElementById('examTitle');
                const subjectInput = document.getElementById('examSubject');
                const durationInput = document.getElementById('examDuration');
                const descriptionInput = document.getElementById('examDescription');

                if (parsed.examInfo.title && titleInput) titleInput.value = parsed.examInfo.title;
                if (parsed.examInfo.subject && subjectInput) subjectInput.value = parsed.examInfo.subject;
                if (parsed.examInfo.duration && durationInput) durationInput.value = parsed.examInfo.duration;
                if (parsed.examInfo.description && descriptionInput) descriptionInput.value = parsed.examInfo.description;
            }

            // Clear existing questions
            const questionsContainer = document.getElementById('questionsContainer');
            if (questionsContainer) {
                questionsContainer.innerHTML = '';
            }
            this.questions = [];
            this.questionCounter = 0;

            // Add parsed questions
            parsed.questions.forEach(questionData => {
                this.addQuestion(questionData);
            });

            this.showMessage(`Đã import thành công ${parsed.questions.length} câu hỏi`, 'success');
            this.closeMarkdownModal();

        } catch (error) {
            console.error('Error importing markdown:', error);
            this.showMessage('Lỗi khi import: ' + error.message, 'error');
        }
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
        const form = document.getElementById('createExamForm');
        if (form) {
            form.reset();
        }
        
        // Clear questions container
        const questionsContainer = document.getElementById('questionsContainer');
        if (questionsContainer) {
            questionsContainer.innerHTML = '';
        }
        
        // Show empty state
        const emptyState = document.getElementById('emptyQuestions');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        
        // Re-bind events after reset
        setTimeout(() => {
            this.bindEvents();
        }, 100);
    }
}

// Initialize only when needed - removed duplicate initialization
if (typeof window !== 'undefined') {
    // Make class available globally for dynamic loading
    window.CreateExam = CreateExam;
}
