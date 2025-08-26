class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.maxRecordingTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.mimeType = 'audio/webm'; // Store mimeType separately
        
        // Audio visualization
        this.audioContext = null;
        this.analyser = null;
        this.animationId = null;
        
        this.onRecordingStart = null;
        this.onRecordingStop = null;
        this.onDataAvailable = null;
        this.onError = null;
        this.onTimeUpdate = null;
    }

    async initialize() {
        try {
            // Check if browser supports MediaRecorder
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持语音录制功能');
            }

            if (!window.MediaRecorder) {
                throw new Error('您的浏览器不支持MediaRecorder API');
            }

            return true;
        } catch (error) {
            console.error('Voice recorder initialization failed:', error);
            if (this.onError) {
                this.onError(error);
            }
            return false;
        }
    }

    async requestPermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });
            
            // Test that we got the stream and then stop it
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            let errorMessage = '无法访问麦克风';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = '请允许访问麦克风权限';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '未找到麦克风设备';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '麦克风被其他应用占用';
            }
            
            if (this.onError) {
                this.onError(new Error(errorMessage));
            }
            return false;
        }
    }

    async startRecording() {
        try {
            if (this.isRecording) {
                console.warn('Recording is already in progress');
                return false;
            }

            // Get media stream
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            // Initialize audio visualization
            this.initializeAudioVisualization();

            // Create MediaRecorder
            const options = { mimeType: 'audio/webm' };
            
            // Fallback for browsers that don't support webm
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'audio/wav';
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options.mimeType = '';
                    }
                }
            }

            this.mediaRecorder = new MediaRecorder(this.stream, options.mimeType ? options : {});
            // Store the mimeType for later use
            this.mimeType = this.mediaRecorder.mimeType || options.mimeType || 'audio/webm';
            this.audioChunks = [];

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                if (this.onError) {
                    this.onError(new Error('录制过程中发生错误'));
                }
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            this.startTime = Date.now();

            // Start timer
            this.startTimer();

            // Start audio visualization
            this.startVisualization();

            // Auto-stop after max recording time
            setTimeout(() => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            }, this.maxRecordingTime);

            if (this.onRecordingStart) {
                this.onRecordingStart();
            }

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.cleanup();
            
            let errorMessage = '录制启动失败';
            if (error.name === 'NotAllowedError') {
                errorMessage = '请允许访问麦克风权限';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '未找到麦克风设备';
            }
            
            if (this.onError) {
                this.onError(new Error(errorMessage));
            }
            return false;
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            return false;
        }

        this.isRecording = false;
        this.mediaRecorder.stop();
        this.stopTimer();
        this.stopVisualization();
        
        return true;
    }

    handleRecordingStop() {
        const recordingDuration = Date.now() - this.startTime;
        
        if (this.audioChunks.length === 0) {
            if (this.onError) {
                this.onError(new Error('录制失败，未捕获到音频数据'));
            }
            this.cleanup();
            return;
        }

        // Create audio blob using stored mimeType
        const audioBlob = new Blob(this.audioChunks, { 
            type: this.mimeType
        });

        // Convert to base64 for API upload
        this.blobToBase64(audioBlob).then(base64Data => {
            if (this.onRecordingStop) {
                this.onRecordingStop({
                    audioBlob,
                    base64Data,
                    duration: recordingDuration,
                    mimeType: this.mimeType
                });
            }
        }).catch(error => {
            console.error('Failed to convert audio to base64:', error);
            if (this.onError) {
                this.onError(new Error('音频处理失败'));
            }
        });

        this.cleanup();
    }

    initializeAudioVisualization() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            
            this.analyser.fftSize = 256;
        } catch (error) {
            console.warn('Audio visualization not available:', error);
        }
    }

    startVisualization() {
        if (!this.analyser) return;

        const visualize = () => {
            if (!this.isRecording) return;

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(dataArray);

            // Calculate average volume
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            // Update wave animation based on volume
            this.updateWaveAnimation(average);

            this.animationId = requestAnimationFrame(visualize);
        };

        visualize();
    }

    updateWaveAnimation(volume) {
        const waves = document.querySelectorAll('.wave');
        const intensity = Math.min(volume / 50, 2); // Normalize and cap intensity
        
        waves.forEach((wave, index) => {
            const height = Math.max(20, intensity * (30 + Math.random() * 40));
            wave.style.height = `${height}px`;
        });
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Reset wave animation
        const waves = document.querySelectorAll('.wave');
        waves.forEach(wave => {
            wave.style.height = '20px';
        });
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isRecording) return;
            
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.onTimeUpdate) {
                this.onTimeUpdate(timeString, elapsed);
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    cleanup() {
        // Stop all tracks
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        // Clear references
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.analyser = null;
        this.audioContext = null;
        
        this.stopTimer();
        this.stopVisualization();
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                // Remove the data URL prefix to get just the base64 data
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Utility method to create audio URL for playback
    createAudioURL(audioBlob) {
        return URL.createObjectURL(audioBlob);
    }

    // Get recording capabilities
    static getCapabilities() {
        const capabilities = {
            mediaRecorder: !!window.MediaRecorder,
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioContext: !!(window.AudioContext || window.webkitAudioContext)
        };

        capabilities.isSupported = capabilities.mediaRecorder && capabilities.getUserMedia;
        return capabilities;
    }
}

// Export for use in other modules
window.VoiceRecorder = VoiceRecorder;