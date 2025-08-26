// Main application controller for Inspiration List

class InspirationApp {
    constructor() {
        this.currentView = 'record';
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {
            search: '',
            category: 'all'
        };
        
        // Core modules
        this.voiceRecorder = null;
        this.speechRecognition = null;
        this.pagination = null;
        this.search = null;
        
        // UI elements
        this.recordBtn = DOM.$('#record-btn');
        this.retryBtn = DOM.$('#retry-btn');
        this.saveBtn = DOM.$('#save-btn');
        this.newRecordBtn = DOM.$('#new-record-btn');
        this.viewListBtn = DOM.$('#view-list-btn');
        this.inspirationList = DOM.$('#inspiration-list');
        this.recordStatus = DOM.$('#record-status');
        this.recordTimer = DOM.$('#record-timer');
        this.transcriptionText = DOM.$('#transcription-text');
        
        // State
        this.currentRecording = null;
        this.currentTranscription = '';
        this.isProcessing = false;
        this.inspirations = [];
        
        this.init();
    }

    async init() {
        try {
            // Initialize modules
            await this.initializeModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeComponents();
            
            // Check capabilities
            this.checkCapabilities();
            
            // Load initial data if on list view
            if (this.currentView === 'list') {
                await this.loadInspirations();
            }
            
            console.log('Inspiration List app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            toast.error('应用初始化失败，请刷新页面重试');
        }
    }

    async initializeModules() {
        // Initialize voice recorder
        this.voiceRecorder = new VoiceRecorder();
        const voiceSupported = await this.voiceRecorder.initialize();
        
        if (voiceSupported) {
            this.setupVoiceRecorderCallbacks();
        }

        // Initialize speech recognition - check support directly
        try {
            const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
            if (hasSpeechSupport) {
                this.speechRecognition = new VoiceSpeechRecognition();
                // Wait for asynchronous initialization
                await this.speechRecognition.initialize();
                this.setupSpeechRecognitionCallbacks();
            }
        } catch (error) {
            console.warn('Speech recognition initialization failed:', error);
        }
    }

    setupVoiceRecorderCallbacks() {
        this.voiceRecorder.onRecordingStart = () => {
            this.updateRecordingState('recording');
            DOM.addClass(this.recordBtn, 'recording');
            this.recordBtn.querySelector('.record-text').textContent = '停止录制';
            DOM.$('#record-status .status-text').textContent = '正在录制...';
        };

        this.voiceRecorder.onRecordingStop = (data) => {
            this.currentRecording = data;
            this.updateRecordingState('processing');
            this.processRecording();
        };

        this.voiceRecorder.onTimeUpdate = (timeString, elapsed) => {
            if (this.recordTimer) {
                this.recordTimer.textContent = timeString;
            }
        };

        this.voiceRecorder.onError = (error) => {
            this.updateRecordingState('idle');
            toast.error(error.message);
        };
    }

    setupSpeechRecognitionCallbacks() {
        this.speechRecognition.onResult = (result) => {
            if (this.transcriptionText) {
                const displayText = result.finalTranscript + 
                    (result.interimTranscript ? `<span class="interim">${result.interimTranscript}</span>` : '');
                this.transcriptionText.innerHTML = displayText;
            }
        };

        this.speechRecognition.onFinalResult = (transcript) => {
            this.currentTranscription = SpeechProcessor.processText(transcript);
            this.showTranscriptionResult();
        };

        this.speechRecognition.onError = (error) => {
            console.error('Speech recognition error:', error);
            toast.warning('语音识别失败，请手动输入文字或重新录制');
            this.showTranscriptionResult();
        };

        this.speechRecognition.onEnd = () => {
            console.log('Speech recognition ended');
        };
    }

    setupEventListeners() {
        // Navigation
        DOM.$$('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Recording controls
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => {
                this.toggleRecording();
            });
        }

        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => {
                this.retryRecording();
            });
        }

        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.saveInspiration();
            });
        }

        if (this.newRecordBtn) {
            this.newRecordBtn.addEventListener('click', () => {
                this.startNewRecording();
            });
        }

        if (this.viewListBtn) {
            this.viewListBtn.addEventListener('click', () => {
                this.switchView('list');
            });
        }

        // Modal delete handler
        modal.onDelete = (id) => {
            this.deleteInspiration(id);
        };
    }

    initializeComponents() {
        // Initialize pagination
        this.pagination = new PaginationComponent('#pagination', {
            onPageChange: (page) => {
                this.currentPage = page;
                this.loadInspirations();
            }
        });

        // Initialize search
        this.search = new SearchComponent({
            onSearch: (query) => {
                this.currentFilters.search = query;
                this.currentPage = 1;
                this.loadInspirations();
            },
            onFilter: (category) => {
                this.currentFilters.category = category;
                this.currentPage = 1;
                this.loadInspirations();
            }
        });
    }

    checkCapabilities() {
        const capabilities = VoiceRecorder.getCapabilities();
        
        if (!capabilities.isSupported) {
            toast.warning('您的浏览器不支持语音录制功能，请使用现代浏览器');
            this.recordBtn.disabled = true;
        }

        // Check speech recognition support directly
        const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        if (!hasSpeechSupport) {
            toast.warning('您的浏览器不支持语音识别功能，需要手动输入文字');
        }
    }

    async toggleRecording() {
        if (!this.voiceRecorder) return;

        if (this.voiceRecorder.isRecording) {
            this.voiceRecorder.stopRecording();
        } else {
            // Request permissions first
            const hasPermission = await this.voiceRecorder.requestPermissions();
            if (hasPermission) {
                const started = await this.voiceRecorder.startRecording();
                if (started && this.speechRecognition) {
                    // Start speech recognition alongside recording
                    this.speechRecognition.start();
                }
            }
        }
    }

    processRecording() {
        if (this.speechRecognition && this.speechRecognition.isListening) {
            this.speechRecognition.stop();
        }

        // If we have transcription, show it; otherwise show manual input
        if (this.currentTranscription) {
            this.showTranscriptionResult();
        } else {
            setTimeout(() => {
                this.showTranscriptionResult();
            }, 2000); // Wait a bit for speech recognition to complete
        }
    }

    showTranscriptionResult() {
        DOM.hide('#processing-section');
        
        if (this.transcriptionText) {
            this.transcriptionText.innerHTML = this.currentTranscription || '未能识别到语音内容，请手动输入...';
        }
        
        DOM.show('#transcription-section');
        this.updateRecordingState('transcribed');
    }

    async saveInspiration() {
        const text = this.currentTranscription || this.transcriptionText.textContent.trim();
        
        if (!text || text === '未能识别到语音内容，请手动输入...') {
            toast.error('请输入有效的文字内容');
            return;
        }

        this.updateRecordingState('saving');
        DOM.hide('#transcription-section');
        DOM.show('#processing-section');

        try {
            const inspiration = await apiClient.createInspiration(text, this.currentRecording?.base64Data);
            
            DOM.hide('#processing-section');
            this.showResult(inspiration);
            toast.success('灵感保存成功！');
            
        } catch (error) {
            console.error('Failed to save inspiration:', error);
            DOM.hide('#processing-section');
            DOM.show('#transcription-section');
            this.updateRecordingState('transcribed');
            toast.error(error.message || '保存失败，请重试');
        }
    }

    showResult(inspiration) {
        const resultContent = DOM.$('#result-content');
        if (resultContent) {
            resultContent.innerHTML = `
                <div class="result-item">
                    <h4>AI摘要</h4>
                    <p>${StringUtils.escapeHtml(inspiration.enhancedContent.summary)}</p>
                </div>
                <div class="result-item">
                    <h4>详细分析</h4>
                    <p>${StringUtils.escapeHtml(inspiration.enhancedContent.details)}</p>
                </div>
                <div class="result-item result-suggestions">
                    <h4>建议</h4>
                    <ul>
                        ${inspiration.enhancedContent.suggestions.map(suggestion => 
                            `<li>${StringUtils.escapeHtml(suggestion)}</li>`
                        ).join('')}
                    </ul>
                </div>
                <div class="result-item">
                    <h4>标签和分类</h4>
                    <div class="result-tags">
                        <span class="tag category-tag">${StringUtils.escapeHtml(inspiration.enhancedContent.category)}</span>
                        ${inspiration.enhancedContent.tags.map(tag => 
                            `<span class="tag">${StringUtils.escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        DOM.show('#result-section');
        this.updateRecordingState('completed');
    }

    retryRecording() {
        this.resetRecordingState();
        this.currentTranscription = '';
        this.currentRecording = null;
    }

    startNewRecording() {
        this.resetRecordingState();
        this.currentTranscription = '';
        this.currentRecording = null;
    }

    switchView(view) {
        // Update navigation
        DOM.$$('.nav-btn').forEach(btn => {
            DOM.removeClass(btn, 'active');
            if (btn.dataset.view === view) {
                DOM.addClass(btn, 'active');
            }
        });

        // Update views
        DOM.$$('.view').forEach(viewEl => {
            DOM.removeClass(viewEl, 'active');
        });
        DOM.addClass(`#${view}-view`, 'active');

        this.currentView = view;

        // Load data if switching to list view
        if (view === 'list') {
            this.loadInspirations();
        }
    }

    async loadInspirations() {
        if (!this.inspirationList) return;

        LoadingComponent.show(this.inspirationList, '加载灵感列表...');

        try {
            const response = await apiClient.getInspirations({
                page: this.currentPage,
                limit: this.pageSize,
                search: this.currentFilters.search,
                category: this.currentFilters.category
            });

            this.inspirations = response.data;
            this.renderInspirationList();
            this.pagination.update(response.pagination);

        } catch (error) {
            console.error('Failed to load inspirations:', error);
            this.inspirationList.innerHTML = '';
            toast.error('加载失败，请重试');
        }
    }

    renderInspirationList() {
        if (!this.inspirationList) return;

        if (this.inspirations.length === 0) {
            EmptyStateComponent.show(this.inspirationList, {
                icon: '💭',
                title: '还没有记录任何灵感',
                message: '点击录制按钮开始记录您的第一个想法吧！',
                actionText: '开始录制',
                onAction: () => this.switchView('record')
            });
            return;
        }

        this.inspirationList.innerHTML = '';
        
        this.inspirations.forEach(inspiration => {
            const card = InspirationCard.create(inspiration, async (insp) => {
                // Load full inspiration details
                try {
                    const fullInspiration = await apiClient.getInspiration(insp.id);
                    modal.show(fullInspiration);
                } catch (error) {
                    console.error('Failed to load inspiration details:', error);
                    toast.error('加载详情失败');
                }
            });
            
            this.inspirationList.appendChild(card);
        });
    }

    async deleteInspiration(id) {
        if (!confirm('确定要删除这条灵感记录吗？')) {
            return;
        }

        try {
            await apiClient.deleteInspiration(id);
            modal.hide();
            toast.success('删除成功');
            
            // Reload current page
            await this.loadInspirations();
            
        } catch (error) {
            console.error('Failed to delete inspiration:', error);
            toast.error('删除失败，请重试');
        }
    }

    updateRecordingState(state) {
        const states = {
            idle: () => {
                DOM.removeClass(this.recordBtn, 'recording');
                this.recordBtn.querySelector('.record-text').textContent = '点击录制';
                DOM.$('#record-status .status-text').textContent = '准备录制';
                this.recordTimer.textContent = '00:00';
            },
            recording: () => {
                // Handled in voice recorder callbacks
            },
            processing: () => {
                DOM.removeClass(this.recordBtn, 'recording');
                this.recordBtn.querySelector('.record-text').textContent = '处理中...';
                DOM.$('#record-status .status-text').textContent = '正在处理录音...';
                this.recordBtn.disabled = true;
            },
            transcribed: () => {
                this.recordBtn.disabled = false;
                this.recordBtn.querySelector('.record-text').textContent = '点击录制';
                DOM.$('#record-status .status-text').textContent = '录制完成';
            },
            saving: () => {
                this.recordBtn.disabled = true;
            },
            completed: () => {
                this.recordBtn.disabled = false;
                this.recordBtn.querySelector('.record-text').textContent = '点击录制';
                DOM.$('#record-status .status-text').textContent = '保存完成';
            }
        };

        if (states[state]) {
            states[state]();
        }
    }

    resetRecordingState() {
        DOM.hide('#transcription-section');
        DOM.hide('#processing-section');
        DOM.hide('#result-section');
        
        if (this.transcriptionText) {
            this.transcriptionText.innerHTML = '';
        }
        
        this.updateRecordingState('idle');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InspirationApp();
});

// Export for debugging
window.InspirationApp = InspirationApp;