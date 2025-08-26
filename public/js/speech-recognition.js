class VoiceSpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.language = 'zh-CN';
        this.continuous = true;
        this.interimResults = true;
        this.maxAlternatives = 1;
        this.isInitialized = false;
        
        // Callbacks
        this.onResult = null;
        this.onFinalResult = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
        
        // Don't initialize synchronously to avoid potential circular references
        // Initialization will be done asynchronously via initialize() method
    }

    async initialize() {
        if (this.isInitialized) {
            return Promise.resolve(true); // Already initialized
        }
        
        try {
            // Check for browser support directly without calling static method
            const NativeSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!NativeSpeechRecognition) {
                throw new Error('您的浏览器不支持语音识别功能');
            }

            // Create the native speech recognition instance
            this.recognition = new NativeSpeechRecognition();
            this.setupRecognitionSettings();
            this.setupEventHandlers();
            this.isInitialized = true;
            
            return Promise.resolve(true);
        } catch (error) {
            console.error('Speech recognition initialization failed:', error);
            if (this.onError) {
                this.onError(error);
            }
            return Promise.reject(error);
        }
    }

    initializeRecognition() {
        if (this.isInitialized) {
            return true; // Already initialized
        }
        
        try {
            // Check for browser support directly without calling static method
            const NativeSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!NativeSpeechRecognition) {
                throw new Error('您的浏览器不支持语音识别功能');
            }

            // Create the native speech recognition instance
            this.recognition = new NativeSpeechRecognition();
            this.setupRecognitionSettings();
            this.setupEventHandlers();
            this.isInitialized = true;
            
            return true;
        } catch (error) {
            console.error('Speech recognition initialization failed:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    }

    setupRecognitionSettings() {
        if (!this.recognition) return;

        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = this.maxAlternatives;
    }

    setupEventHandlers() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
            if (this.onStart) {
                this.onStart();
            }
        };

        this.recognition.onresult = (event) => {
            this.handleResults(event);
        };

        this.recognition.onerror = (event) => {
            this.handleError(event);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');
            if (this.onEnd) {
                this.onEnd();
            }
        };

        // Handle speech start and end events
        this.recognition.onspeechstart = () => {
            console.log('Speech detected');
        };

        this.recognition.onspeechend = () => {
            console.log('Speech ended');
        };

        this.recognition.onnomatch = () => {
            console.log('No speech was recognised');
        };
    }

    handleResults(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update stored transcripts
        if (finalTranscript) {
            this.finalTranscript += finalTranscript;
        }
        this.interimTranscript = interimTranscript;

        // Trigger callbacks
        if (this.onResult) {
            this.onResult({
                finalTranscript: this.finalTranscript,
                interimTranscript: this.interimTranscript,
                fullTranscript: this.finalTranscript + this.interimTranscript
            });
        }

        if (finalTranscript && this.onFinalResult) {
            this.onFinalResult(this.finalTranscript);
        }
    }

    handleError(event) {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = '语音识别出现错误';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = '没有检测到语音，请重试';
                break;
            case 'audio-capture':
                errorMessage = '无法捕获音频，请检查麦克风';
                break;
            case 'not-allowed':
                errorMessage = '语音识别权限被拒绝';
                break;
            case 'network':
                errorMessage = '网络错误，请检查网络连接';
                break;
            case 'service-not-allowed':
                errorMessage = '语音识别服务不可用';
                break;
            case 'bad-grammar':
                errorMessage = '语法错误';
                break;
            case 'language-not-supported':
                errorMessage = '不支持当前语言';
                break;
            default:
                errorMessage = `语音识别错误: ${event.error}`;
        }

        if (this.onError) {
            this.onError(new Error(errorMessage));
        }
    }

    start() {
        if (!this.isInitialized) {
            console.warn('Speech recognition not initialized yet, retrying...');
            this.initializeRecognition();
        }
        
        if (!this.recognition) {
            const error = new Error('语音识别未初始化');
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }

        if (this.isListening) {
            console.warn('Speech recognition is already running');
            return false;
        }

        try {
            // Reset transcripts
            this.finalTranscript = '';
            this.interimTranscript = '';
            
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            if (this.onError) {
                this.onError(new Error('启动语音识别失败'));
            }
            return false;
        }
    }

    stop() {
        if (!this.recognition || !this.isListening) {
            return false;
        }

        try {
            this.recognition.stop();
            return true;
        } catch (error) {
            console.error('Failed to stop speech recognition:', error);
            return false;
        }
    }

    abort() {
        if (!this.recognition) {
            return false;
        }

        try {
            this.recognition.abort();
            this.isListening = false;
            return true;
        } catch (error) {
            console.error('Failed to abort speech recognition:', error);
            return false;
        }
    }

    // Configuration methods
    setLanguage(language) {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    setContinuous(continuous) {
        this.continuous = continuous;
        if (this.recognition) {
            this.recognition.continuous = continuous;
        }
    }

    setInterimResults(interimResults) {
        this.interimResults = interimResults;
        if (this.recognition) {
            this.recognition.interimResults = interimResults;
        }
    }

    // Get current state
    getState() {
        return {
            isListening: this.isListening,
            finalTranscript: this.finalTranscript,
            interimTranscript: this.interimTranscript,
            fullTranscript: this.finalTranscript + this.interimTranscript,
            language: this.language,
            continuous: this.continuous,
            interimResults: this.interimResults
        };
    }

    // Clear transcripts
    clearTranscripts() {
        this.finalTranscript = '';
        this.interimTranscript = '';
    }

    // Static method to check browser support
    static isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    // Static method to get supported languages
    static getSupportedLanguages() {
        return [
            { code: 'zh-CN', name: '中文（普通话）' },
            { code: 'zh-TW', name: '中文（繁体）' },
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'ja-JP', name: '日本語' },
            { code: 'ko-KR', name: '한국어' },
            { code: 'es-ES', name: 'Español' },
            { code: 'fr-FR', name: 'Français' },
            { code: 'de-DE', name: 'Deutsch' },
            { code: 'it-IT', name: 'Italiano' },
            { code: 'pt-BR', name: 'Português (Brasil)' },
            { code: 'ru-RU', name: 'Русский' }
        ];
    }
}

// Helper class for processing speech recognition results
class SpeechProcessor {
    static processText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[。！？，；：]/g, (match) => match + ' ') // Add space after Chinese punctuation
            .replace(/\s+([。！？，；：])/g, '$1') // Remove space before punctuation
            .trim();
    }

    static addPunctuation(text) {
        if (!text) return text;

        // Simple punctuation rules for Chinese
        let processed = text.trim();
        
        // Add period at the end if no punctuation
        if (!/[。！？]$/.test(processed)) {
            processed += '。';
        }

        return processed;
    }

    static splitSentences(text) {
        if (!text) return [];

        return text
            .split(/[。！？]+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);
    }
}

// Export for use in other modules
window.VoiceSpeechRecognition = VoiceSpeechRecognition;
window.SpeechProcessor = SpeechProcessor;