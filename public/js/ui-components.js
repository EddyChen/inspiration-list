// UI Components for Inspiration List application

// Toast notification system
class ToastManager {
    constructor() {
        this.container = DOM.$('#toast-container');
        this.toasts = new Map();
        this.nextId = 1;
    }

    show(message, type = 'info', duration = 5000) {
        const id = this.nextId++;
        const toast = this.createToast(id, message, type);
        
        this.container.appendChild(toast);
        this.toasts.set(id, toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        // Add click to dismiss
        toast.addEventListener('click', () => this.remove(id));

        return id;
    }

    createToast(id, message, type) {
        const toast = DOM.createElement('div', {
            className: `toast ${type}`,
            'data-toast-id': id
        });

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${StringUtils.escapeHtml(message)}</span>
            </div>
        `;

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    remove(id) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(id);
            }, 300);
        }
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 8000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    clear() {
        this.toasts.forEach((toast, id) => this.remove(id));
    }
}

// Modal manager
class ModalManager {
    constructor() {
        this.modal = DOM.$('#detail-modal');
        this.overlay = DOM.$('#modal-overlay');
        this.modalBody = DOM.$('#modal-body');
        this.closeBtn = DOM.$('#modal-close');
        this.modalCloseBtn = DOM.$('#modal-close-btn');
        this.deleteBtn = DOM.$('#delete-btn');
        
        this.currentInspiration = null;
        this.onDelete = null;

        this.bindEvents();
    }

    bindEvents() {
        // Close modal events
        [this.overlay, this.closeBtn, this.modalCloseBtn].forEach(element => {
            element.addEventListener('click', () => this.hide());
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });

        // Delete button
        this.deleteBtn.addEventListener('click', () => {
            if (this.currentInspiration && this.onDelete) {
                this.onDelete(this.currentInspiration.id);
            }
        });
    }

    show(inspiration) {
        this.currentInspiration = inspiration;
        this.renderContent(inspiration);
        DOM.show(this.modal, 'flex');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        DOM.hide(this.modal);
        document.body.style.overflow = '';
        this.currentInspiration = null;
    }

    isVisible() {
        return this.modal.style.display !== 'none';
    }

    renderContent(inspiration) {
        const content = `
            <div class="inspiration-detail">
                <div class="detail-section">
                    <h4>原始想法</h4>
                    <div class="detail-text">${StringUtils.escapeHtml(inspiration.originalText)}</div>
                </div>
                
                <div class="detail-section">
                    <h4>AI摘要</h4>
                    <div class="detail-text">${StringUtils.escapeHtml(inspiration.enhancedContent.summary)}</div>
                </div>
                
                <div class="detail-section">
                    <h4>详细分析</h4>
                    <div class="detail-text">${StringUtils.escapeHtml(inspiration.enhancedContent.details)}</div>
                </div>
                
                <div class="detail-section">
                    <h4>建议</h4>
                    <ul class="suggestion-list">
                        ${inspiration.enhancedContent.suggestions.map(suggestion => 
                            `<li>${StringUtils.escapeHtml(suggestion)}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4>标签和分类</h4>
                    <div class="detail-tags">
                        <span class="detail-category">${StringUtils.escapeHtml(inspiration.enhancedContent.category)}</span>
                        ${inspiration.enhancedContent.tags.map(tag => 
                            `<span class="detail-tag">${StringUtils.escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>创建信息</h4>
                    <div class="detail-meta">
                        <p><strong>创建时间：</strong>${DateUtils.formatDate(inspiration.createdAt)}</p>
                        <p><strong>字数：</strong>${inspiration.metadata ? inspiration.metadata.wordCount : StringUtils.wordCount(inspiration.originalText)} 字</p>
                    </div>
                </div>
            </div>
        `;

        this.modalBody.innerHTML = content;
    }
}

// Inspiration card component
class InspirationCard {
    static create(inspiration, onClick = null, onView = null) {
        const card = DOM.createElement('div', {
            className: 'inspiration-card',
            'data-id': inspiration.id
        });

        const formattedDate = DateUtils.formatRelativeTime(inspiration.createdAt);
        const truncatedText = StringUtils.truncate(inspiration.originalText, 100);
        const truncatedSummary = StringUtils.truncate(inspiration.summary, 120);

        card.innerHTML = `
            <div class="card-header">
                <span class="card-category">${StringUtils.escapeHtml(inspiration.category)}</span>
                <span class="card-date">${formattedDate}</span>
            </div>
            <div class="card-content">
                <div class="card-title">${StringUtils.escapeHtml(truncatedText)}</div>
                <div class="card-summary">${StringUtils.escapeHtml(truncatedSummary)}</div>
            </div>
            <div class="card-tags">
                ${inspiration.tags.slice(0, 3).map(tag => 
                    `<span class="card-tag">${StringUtils.escapeHtml(tag)}</span>`
                ).join('')}
                ${inspiration.tags.length > 3 ? `<span class="card-tag">+${inspiration.tags.length - 3}</span>` : ''}
            </div>
        `;

        // Click handlers
        if (onClick) {
            card.addEventListener('click', () => onClick(inspiration));
        }

        return card;
    }
}

// Loading component
class LoadingComponent {
    static create(text = '加载中...') {
        return DOM.createElement('div', {
            className: 'loading-state'
        }, [
            DOM.createElement('div', { className: 'spinner' }),
            DOM.createElement('p', { textContent: text })
        ]);
    }

    static show(container, text = '加载中...') {
        if (typeof container === 'string') {
            container = DOM.$(container);
        }
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(this.create(text));
        }
    }
}

// Empty state component
class EmptyStateComponent {
    static create(options = {}) {
        const {
            icon = '💭',
            title = '暂无数据',
            message = '还没有任何记录',
            actionText = null,
            onAction = null
        } = options;

        const container = DOM.createElement('div', {
            className: 'empty-state'
        });

        container.innerHTML = `
            <div class="empty-icon">${icon}</div>
            <h3>${StringUtils.escapeHtml(title)}</h3>
            <p>${StringUtils.escapeHtml(message)}</p>
        `;

        if (actionText && onAction) {
            const actionBtn = DOM.createElement('button', {
                className: 'btn btn-primary',
                textContent: actionText
            });
            actionBtn.addEventListener('click', onAction);
            container.appendChild(actionBtn);
        }

        return container;
    }

    static show(container, options = {}) {
        if (typeof container === 'string') {
            container = DOM.$(container);
        }
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(this.create(options));
        }
    }
}

// Pagination component
class PaginationComponent {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? DOM.$(container) : container;
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasNext = false;
        this.hasPrev = false;
        this.onPageChange = options.onPageChange || null;
        
        this.prevBtn = DOM.$('#prev-page');
        this.nextBtn = DOM.$('#next-page');
        this.pageInfo = DOM.$('#pagination-info');

        this.bindEvents();
    }

    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                if (this.hasPrev) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                if (this.hasNext) {
                    this.goToPage(this.currentPage + 1);
                }
            });
        }
    }

    update(pagination) {
        this.currentPage = pagination.currentPage;
        this.totalPages = pagination.totalPages;
        this.hasNext = pagination.hasNext;
        this.hasPrev = pagination.hasPrev;

        this.render();
    }

    render() {
        if (this.pageInfo) {
            this.pageInfo.textContent = `第 ${this.currentPage} 页，共 ${this.totalPages} 页`;
        }

        if (this.prevBtn) {
            this.prevBtn.disabled = !this.hasPrev;
        }

        if (this.nextBtn) {
            this.nextBtn.disabled = !this.hasNext;
        }

        // Show/hide pagination based on total pages
        const shouldShow = this.totalPages > 1;
        if (this.container) {
            DOM[shouldShow ? 'show' : 'hide'](this.container);
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            if (this.onPageChange) {
                this.onPageChange(page);
            }
        }
    }

    reset() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasNext = false;
        this.hasPrev = false;
        this.render();
    }
}

// Search component
class SearchComponent {
    constructor(options = {}) {
        this.searchInput = DOM.$('#search-input');
        this.searchBtn = DOM.$('#search-btn');
        this.categoryFilter = DOM.$('#category-filter');
        
        this.onSearch = options.onSearch || null;
        this.onFilter = options.onFilter || null;
        this.debounceDelay = options.debounceDelay || 500;

        this.bindEvents();
    }

    bindEvents() {
        if (this.searchInput) {
            const debouncedSearch = EventUtils.debounce(() => {
                this.performSearch();
            }, this.debounceDelay);

            this.searchInput.addEventListener('input', debouncedSearch);
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => {
                this.performFilter();
            });
        }
    }

    performSearch() {
        if (this.onSearch && this.searchInput) {
            const query = this.searchInput.value.trim();
            this.onSearch(query);
        }
    }

    performFilter() {
        if (this.onFilter && this.categoryFilter) {
            const category = this.categoryFilter.value;
            this.onFilter(category);
        }
    }

    getSearchQuery() {
        return this.searchInput ? this.searchInput.value.trim() : '';
    }

    getSelectedCategory() {
        return this.categoryFilter ? this.categoryFilter.value : 'all';
    }

    clear() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        if (this.categoryFilter) {
            this.categoryFilter.value = 'all';
        }
    }
}

// Error boundary component
class ErrorBoundary {
    constructor() {
        this.errorElement = DOM.$('#error-boundary');
        this.errorMessage = DOM.$('#error-message');
        this.hasError = false;

        this.setupGlobalErrorHandlers();
    }

    setupGlobalErrorHandlers() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showError('应用发生意外错误，请刷新页面重试');
        });

        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
            this.showError('应用发生意外错误，请刷新页面重试');
        });
    }

    showError(message = '应用发生意外错误，请刷新页面重试') {
        if (this.hasError) return; // Prevent infinite error loops

        this.hasError = true;
        
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
        }
        
        if (this.errorElement) {
            DOM.show(this.errorElement, 'flex');
        }
    }

    hideError() {
        this.hasError = false;
        if (this.errorElement) {
            DOM.hide(this.errorElement);
        }
    }

    reset() {
        this.hideError();
    }
}

// Create global instances
const toast = new ToastManager();
const modal = new ModalManager();
const errorBoundary = new ErrorBoundary();

// Export components
window.ToastManager = ToastManager;
window.ModalManager = ModalManager;
window.InspirationCard = InspirationCard;
window.LoadingComponent = LoadingComponent;
window.EmptyStateComponent = EmptyStateComponent;
window.PaginationComponent = PaginationComponent;
window.SearchComponent = SearchComponent;
window.ErrorBoundary = ErrorBoundary;

// Export global instances
window.toast = toast;
window.modal = modal;
window.errorBoundary = errorBoundary;