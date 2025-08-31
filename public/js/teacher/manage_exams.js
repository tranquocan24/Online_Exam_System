// teacher/manage_exams.js - Quản lý đề thi

class ManageExams {
    constructor() {
        this.exams = [];
        this.filteredExams = [];
        this.selectedExams = new Set();
        this.currentUser = null;
        this.currentExamId = null;
        this.init();
    }

    init() {
        console.log('Manage Exams initialized');
        this.currentUser = window.app?.currentUser;
        
        if (!this.currentUser || this.currentUser.role !== 'teacher') {
            console.error('Unauthorized access');
            return;
        }

        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Filter events
        const subjectFilter = document.getElementById('subjectFilter');
        const statusFilter = document.getElementById('statusFilter');
        const sortBy = document.getElementById('sortBy');
        const searchInput = document.getElementById('searchExams');

        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (sortBy) {
            sortBy.addEventListener('change', () => this.applyFilters());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }

        // Modal actions
        this.bindModalActions();
    }

    bindModalActions() {
        const actions = [
            { id: 'editExamBtn', handler: () => this.editExam() },
            { id: 'duplicateExamBtn', handler: () => this.duplicateExam() },
            { id: 'viewResultsBtn', handler: () => this.viewResults() },
            { id: 'exportExamBtn', handler: () => this.exportExam() },
            { id: 'publishExamBtn', handler: () => this.publishExam() },
            { id: 'archiveExamBtn', handler: () => this.archiveExam() },
            { id: 'deleteExamBtn', handler: () => this.deleteExam() }
        ];

        actions.forEach(action => {
            const btn = document.getElementById(action.id);
            if (btn) {
                btn.addEventListener('click', action.handler);
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Load exams
            const examsResponse = await fetch('/api/questions');
            if (examsResponse.ok) {
                const questionsData = await examsResponse.json();
                this.exams = questionsData.exams.filter(exam => 
                    exam.createdBy === this.currentUser.id
                );
            } else {
                throw new Error('Failed to load exams');
            }
            
            // Load results for statistics
            const resultsResponse = await fetch('/api/results');
            if (resultsResponse.ok) {
                this.results = await resultsResponse.json();
            } else {
                this.results = [];
            }
            
            this.updateStatistics();
            
            // Ensure default sort is set to newest first
            const sortBy = document.getElementById('sortBy');
            if (sortBy && !sortBy.value) {
                sortBy.value = 'created-desc';
            }
            
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
        } finally {
            this.showLoading(false);
        }
    }

    async refreshData() {
        await this.loadData();
        this.showMessage('Đã cập nhật danh sách đề thi!', 'success');
    }

    updateStatistics() {
        const totalExams = this.exams.length;
        const publishedExams = this.exams.filter(exam => !exam.isDraft).length;
        const draftExams = this.exams.filter(exam => exam.isDraft).length;
        
        // Count total submissions for teacher's exams
        const examIds = this.exams.map(exam => exam.id);
        const totalSubmissions = this.results.filter(result => 
            examIds.includes(result.examId)
        ).length;

        document.getElementById('totalExams').textContent = totalExams;
        document.getElementById('publishedExams').textContent = publishedExams;
        document.getElementById('draftExams').textContent = draftExams;
        document.getElementById('totalSubmissions').textContent = totalSubmissions;
    }

    applyFilters(advancedOptions = {}) {
        const subjectFilter = document.getElementById('subjectFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'created-desc';
        const searchTerm = document.getElementById('searchExams')?.value.toLowerCase() || '';

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
                const searchText = `${exam.title} ${exam.description || ''} ${exam.subject}`.toLowerCase();
                if (!searchText.includes(searchTerm)) {
                    return false;
                }
            }

            // Advanced filters
            if (advancedOptions.dateFrom || advancedOptions.dateTo) {
                const examDate = new Date(exam.createdAt);
                if (advancedOptions.dateFrom && examDate < new Date(advancedOptions.dateFrom)) {
                    return false;
                }
                if (advancedOptions.dateTo && examDate > new Date(advancedOptions.dateTo)) {
                    return false;
                }
            }

            // Questions count filter
            const questionCount = exam.questions?.length || 0;
            if (advancedOptions.questionsMin !== null && questionCount < advancedOptions.questionsMin) {
                return false;
            }
            if (advancedOptions.questionsMax !== null && questionCount > advancedOptions.questionsMax) {
                return false;
            }

            // Duration filter
            if (advancedOptions.durationMin !== null && exam.duration < advancedOptions.durationMin) {
                return false;
            }
            if (advancedOptions.durationMax !== null && exam.duration > advancedOptions.durationMax) {
                return false;
            }

            // Submissions count filter
            const submissionsCount = this.getExamSubmissions(exam.id);
            if (advancedOptions.submissionsMin !== null && submissionsCount < advancedOptions.submissionsMin) {
                return false;
            }
            if (advancedOptions.submissionsMax !== null && submissionsCount > advancedOptions.submissionsMax) {
                return false;
            }

            return true;
        });

        // Apply sorting
        this.sortExams(sortBy);
        this.renderExams();
    }

    sortExams(sortBy) {
        this.filteredExams.sort((a, b) => {
            switch (sortBy) {
                case 'created-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'created-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'submissions-desc':
                    const aSubmissions = this.getExamSubmissions(a.id);
                    const bSubmissions = this.getExamSubmissions(b.id);
                    return bSubmissions - aSubmissions;
                default:
                    return 0;
            }
        });
    }

    getExamStatus(exam) {
        if (exam.isDraft) return 'draft';
        if (exam.isArchived) return 'archived';
        return 'published';
    }

    getExamSubmissions(examId) {
        return this.results.filter(result => result.examId === examId).length;
    }

    renderExams() {
        const container = document.getElementById('examsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredExams.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';

        const examsHTML = this.filteredExams.map(exam => this.renderExamCard(exam)).join('');
        container.innerHTML = examsHTML;
    }

    renderExamCard(exam) {
        const status = this.getExamStatus(exam);
        const submissions = this.getExamSubmissions(exam.id);
        const createdDate = new Date(exam.createdAt).toLocaleDateString('vi-VN');
        const questionCount = exam.questions?.length || 0;
        const avgScore = this.getExamAverageScore(exam.id);

        return `
            <div class="exam-card-improved" data-exam-id="${exam.id}">
                <div class="exam-card-header">
                    <div class="exam-title">${exam.title}</div>
                    <div class="exam-subject">${exam.subject}</div>
                    <div class="exam-meta">
                        <div class="exam-status ${status}">${this.getStatusText(status)}</div>
                        <div class="exam-date">${createdDate}</div>
                    </div>
                </div>

                <div class="exam-stats">
                    <div class="exam-stat">
                        <div class="exam-stat-number">${questionCount}</div>
                        <div class="exam-stat-label">Câu hỏi</div>
                    </div>
                    <div class="exam-stat">
                        <div class="exam-stat-number">${exam.duration || 0}'</div>
                        <div class="exam-stat-label">Thời gian</div>
                    </div>
                    <div class="exam-stat">
                        <div class="exam-stat-number">${submissions}</div>
                        <div class="exam-stat-label">Lượt thi</div>
                    </div>
                </div>

                <div class="exam-actions">
                    <button onclick="manageExams.editExam('${exam.id}')" 
                            class="exam-action-btn primary" title="Chỉnh sửa">
                        ✏️ Sửa
                    </button>
                    <button onclick="manageExams.viewResults('${exam.id}')" 
                            class="exam-action-btn secondary" title="Xem kết quả">
                        📊 Kết quả
                    </button>
                    <button onclick="manageExams.showExamActions('${exam.id}')" 
                            class="exam-action-btn secondary" title="Thêm hành động">
                        ⋮
                    </button>
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            published: 'Đã xuất bản',
            draft: 'Bản nháp',
            archived: 'Đã lưu trữ'
        };
        return statusMap[status] || 'Không xác định';
    }

    getExamAverageScore(examId) {
        const examResults = this.results.filter(result => result.examId === examId);
        if (examResults.length === 0) return 0;
        
        const totalScore = examResults.reduce((sum, result) => sum + result.score, 0);
        return Math.round(totalScore / examResults.length);
    }

    showExamActions(examId) {
        this.currentExamId = examId;
        const modal = document.getElementById('examActionsModal');
        modal.style.display = 'flex';
        
        // Update modal buttons based on exam status
        const exam = this.exams.find(e => e.id === examId);
        const status = this.getExamStatus(exam);
        
        // Show/hide relevant actions
        const publishBtn = document.getElementById('publishExamBtn');
        const archiveBtn = document.getElementById('archiveExamBtn');
        
        if (status === 'draft') {
            publishBtn.style.display = 'block';
            archiveBtn.style.display = 'none';
        } else if (status === 'published') {
            publishBtn.style.display = 'none';
            archiveBtn.style.display = 'block';
        } else {
            publishBtn.style.display = 'block';
            archiveBtn.style.display = 'none';
        }
    }

    closeModal() {
        document.getElementById('examActionsModal').style.display = 'none';
        this.currentExamId = null;
    }

    toggleExamSelection(examId, selected) {
        if (selected) {
            this.selectedExams.add(examId);
        } else {
            this.selectedExams.delete(examId);
        }
        
        this.updateBulkActionsBar();
    }

    updateBulkActionsBar() {
        const bulkBar = document.getElementById('bulkActionsBar');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedExams.size > 0) {
            bulkBar.style.display = 'flex';
            selectedCount.textContent = this.selectedExams.size;
        } else {
            bulkBar.style.display = 'none';
        }
    }

    clearSelection() {
        this.selectedExams.clear();
        document.querySelectorAll('.exam-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateBulkActionsBar();
    }

    // Exam actions
    editExam(examId = this.currentExamId) {
        // TODO: Implement exam editing
        this.showMessage('Chức năng chỉnh sửa đề thi sẽ được phát triển sau', 'info');
        this.closeModal();
    }

    async duplicateExam(examId = this.currentExamId) {
        if (!examId) return;
        
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;
        
        if (confirm(`Bạn có muốn tạo bản sao của đề thi "${exam.title}"?`)) {
            try {
                const duplicatedExam = {
                    ...exam,
                    title: `${exam.title} (Bản sao)`,
                    id: undefined, // Will be generated by server
                    createdAt: undefined,
                    isDraft: true
                };
                
                const response = await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(duplicatedExam)
                });
                
                if (response.ok) {
                    this.showMessage('Đã tạo bản sao đề thi', 'success');
                    this.refreshData();
                } else {
                    throw new Error('Failed to duplicate exam');
                }
                
            } catch (error) {
                this.showMessage('Có lỗi khi tạo bản sao', 'error');
            }
        }
        
        this.closeModal();
    }

    viewResults(examId = this.currentExamId) {
        if (!examId) return;
        
        // Navigate to results view
        window.location.hash = `results/${examId}`;
        window.app.loadPage('view_results');
        
        this.closeModal();
    }

    exportExam(examId = this.currentExamId) {
        if (!examId) return;
        
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;
        
        // Create download
        const dataStr = JSON.stringify(exam, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exam.title.replace(/[^a-z0-9]/gi, '_')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Đã tải xuống đề thi', 'success');
        this.closeModal();
    }

    async publishExam(examId = this.currentExamId) {
        if (!examId) return;
        
        if (confirm('Bạn có chắc chắn muốn xuất bản đề thi này? Sinh viên sẽ có thể làm bài.')) {
            try {
                // TODO: Implement publish API
                this.showMessage('Đã xuất bản đề thi', 'success');
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xuất bản đề thi', 'error');
            }
        }
        
        this.closeModal();
    }

    async archiveExam(examId = this.currentExamId) {
        if (!examId) return;
        
        if (confirm('Bạn có chắc chắn muốn lưu trữ đề thi này? Sinh viên sẽ không thể làm bài nữa.')) {
            try {
                // TODO: Implement archive API
                this.showMessage('Đã lưu trữ đề thi', 'success');
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi lưu trữ đề thi', 'error');
            }
        }
        
        this.closeModal();
    }

    async deleteExam(examId = this.currentExamId) {
        if (!examId) return;
        
        const exam = this.exams.find(e => e.id === examId);
        if (!exam) return;
        
        if (confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN đề thi "${exam.title}"? Hành động này không thể hoàn tác.`)) {
            try {
                // TODO: Implement delete API
                this.showMessage('Đã xóa đề thi', 'success');
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xóa đề thi', 'error');
            }
        }
        
        this.closeModal();
    }

    // Bulk actions
    async bulkPublish() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`Xuất bản ${this.selectedExams.size} đề thi đã chọn?`)) {
            try {
                // TODO: Implement bulk publish
                this.showMessage(`Đã xuất bản ${this.selectedExams.size} đề thi`, 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xuất bản đề thi', 'error');
            }
        }
    }

    async bulkArchive() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`Lưu trữ ${this.selectedExams.size} đề thi đã chọn?`)) {
            try {
                // TODO: Implement bulk archive
                this.showMessage(`Đã lưu trữ ${this.selectedExams.size} đề thi`, 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi lưu trữ đề thi', 'error');
            }
        }
    }

    async bulkDelete() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`XÓA VĨNH VIỄN ${this.selectedExams.size} đề thi đã chọn? Hành động này không thể hoàn tác.`)) {
            try {
                // TODO: Implement bulk delete
                this.showMessage(`Đã xóa ${this.selectedExams.size} đề thi`, 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xóa đề thi', 'error');
            }
        }
    }

    // Advanced filters methods
    toggleAdvancedFilters() {
        const advancedFilters = document.getElementById('advancedFilters');
        const toggleBtn = document.querySelector('.advanced-filter-toggle');
        
        if (advancedFilters) {
            const isVisible = advancedFilters.style.display !== 'none';
            advancedFilters.style.display = isVisible ? 'none' : 'block';
            
            if (toggleBtn) {
                toggleBtn.innerHTML = isVisible 
                    ? '<span class="btn-icon">⚙️</span>Bộ lọc nâng cao'
                    : '<span class="btn-icon">▲</span>Ẩn bộ lọc';
            }
        }
    }

    applyAdvancedFilters() {
        // Get advanced filter values
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;
        const questionsMin = document.getElementById('questionsMin')?.value;
        const questionsMax = document.getElementById('questionsMax')?.value;
        const durationMin = document.getElementById('durationMin')?.value;
        const durationMax = document.getElementById('durationMax')?.value;
        const submissionsMin = document.getElementById('submissionsMin')?.value;
        const submissionsMax = document.getElementById('submissionsMax')?.value;

        // Apply filters with advanced criteria
        this.applyFilters({
            dateFrom,
            dateTo,
            questionsMin: questionsMin ? parseInt(questionsMin) : null,
            questionsMax: questionsMax ? parseInt(questionsMax) : null,
            durationMin: durationMin ? parseInt(durationMin) : null,
            durationMax: durationMax ? parseInt(durationMax) : null,
            submissionsMin: submissionsMin ? parseInt(submissionsMin) : null,
            submissionsMax: submissionsMax ? parseInt(submissionsMax) : null
        });
    }

    clearAdvancedFilters() {
        // Clear all advanced filter inputs
        const inputs = ['dateFrom', 'dateTo', 'questionsMin', 'questionsMax', 
                       'durationMin', 'durationMax', 'submissionsMin', 'submissionsMax'];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // Reapply basic filters only
        this.applyFilters();
    }

    async bulkPublish() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn xuất bản ${this.selectedExams.size} đề thi được chọn?`)) {
            try {
                for (const examId of this.selectedExams) {
                    await this.publishExam(examId);
                }
                this.showMessage('Đã xuất bản tất cả đề thi được chọn', 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xuất bản đề thi', 'error');
            }
        }
    }

    async bulkArchive() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn lưu trữ ${this.selectedExams.size} đề thi được chọn?`)) {
            try {
                for (const examId of this.selectedExams) {
                    await this.archiveExam(examId);
                }
                this.showMessage('Đã lưu trữ tất cả đề thi được chọn', 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi lưu trữ đề thi', 'error');
            }
        }
    }

    async bulkDelete() {
        if (this.selectedExams.size === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn xóa ${this.selectedExams.size} đề thi được chọn? Hành động này không thể hoàn tác.`)) {
            try {
                for (const examId of this.selectedExams) {
                    await this.deleteExam(examId);
                }
                this.showMessage('Đã xóa tất cả đề thi được chọn', 'success');
                this.clearSelection();
                this.refreshData();
            } catch (error) {
                this.showMessage('Có lỗi khi xóa đề thi', 'error');
            }
        }
    }

    showLoading(show) {
        const loadingEl = document.getElementById('loadingExams');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        const container = document.getElementById('examsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <h3>Lỗi tải dữ liệu</h3>
                    <p>${message}</p>
                    <button onclick="manageExams.refreshData()" class="btn btn-primary">
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

    // Advanced Filters Methods
    toggleAdvancedFilters() {
        const advancedFilters = document.getElementById('advancedFilters');
        if (advancedFilters.style.display === 'none') {
            advancedFilters.style.display = 'block';
        } else {
            advancedFilters.style.display = 'none';
        }
    }

    applyAdvancedFilters() {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const questionsMin = document.getElementById('questionsMin').value;
        const questionsMax = document.getElementById('questionsMax').value;
        const durationMin = document.getElementById('durationMin').value;
        const durationMax = document.getElementById('durationMax').value;
        const submissionsMin = document.getElementById('submissionsMin').value;
        const submissionsMax = document.getElementById('submissionsMax').value;

        this.applyFilters({
            dateFrom,
            dateTo,
            questionsMin: questionsMin ? parseInt(questionsMin) : null,
            questionsMax: questionsMax ? parseInt(questionsMax) : null,
            durationMin: durationMin ? parseInt(durationMin) : null,
            durationMax: durationMax ? parseInt(durationMax) : null,
            submissionsMin: submissionsMin ? parseInt(submissionsMin) : null,
            submissionsMax: submissionsMax ? parseInt(submissionsMax) : null
        });
    }

    clearAdvancedFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('questionsMin').value = '';
        document.getElementById('questionsMax').value = '';
        document.getElementById('durationMin').value = '';
        document.getElementById('durationMax').value = '';
        document.getElementById('submissionsMin').value = '';
        document.getElementById('submissionsMax').value = '';
        
        this.applyFilters();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.app?.currentRole === 'teacher') {
        window.manageExams = new ManageExams();
    }
});

// Also initialize if loaded dynamically
if (window.app?.currentRole === 'teacher') {
    window.manageExams = new ManageExams();
}
