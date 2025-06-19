class TextToSpeechApp {
    constructor() {
        this.apiKey = '';
        this.deviceFingerprint = null;
        this.cryptoKey = null;
        this.sessionTimeout = 7 * 24 * 60 * 60 * 1000; // 7日間
        this.initializeSecurity()
            .then(() => {
                this.initializeElements();
                this.bindEvents();
                this.enhanceApiKeyInputSecurity();
                this.loadSavedApiKey();
                this.loadVoiceSettings();
                this.checkApiKeyStatus();
                this.startSessionMonitoring();
            })
            .catch(error => {
                console.error('Security initialization failed:', error);
                this.initializeElements();
                this.bindEvents();
                this.checkApiKeyStatus();
            });
    }

    initializeElements() {
        this.apiKeyInput = document.getElementById('api-key');
        this.toggleApiKeyBtn = document.getElementById('toggle-api-key');
        this.saveApiKeyBtn = document.getElementById('save-api-key');
        this.apiKeyStatus = document.getElementById('api-key-status');
        this.textInput = document.getElementById('text-input');
        this.charCount = document.getElementById('char-count');
        this.voiceSelect = document.getElementById('voice-select');
        this.pitchRange = document.getElementById('pitch-range');
        this.pitchValue = document.getElementById('pitch-value');
        this.speedRange = document.getElementById('speed-range');
        this.speedValue = document.getElementById('speed-value');
        this.generateBtn = document.getElementById('generate-btn');
        this.progressContainer = document.getElementById('progress-container');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.downloadSection = document.getElementById('download-section');
        this.downloadBtn = document.getElementById('download-btn');
        this.errorMessage = document.getElementById('error-message');
        this.previewBtn = document.getElementById('preview-btn');
        this.previewSection = document.getElementById('preview-section');
        this.previewAudio = document.getElementById('preview-audio');
    }

    bindEvents() {
        this.toggleApiKeyBtn.addEventListener('click', () => this.toggleApiKeyVisibility());
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.textInput.addEventListener('input', () => this.updateCharacterCount());
        this.pitchRange.addEventListener('input', () => {
            this.updatePitchValue();
            this.saveVoiceSettings();
        });
        this.speedRange.addEventListener('input', () => {
            this.updateSpeedValue();
            this.saveVoiceSettings();
        });
        this.previewBtn.addEventListener('click', () => this.generatePreview());
        this.generateBtn.addEventListener('click', () => this.generateSpeech());
        this.downloadBtn.addEventListener('click', () => this.downloadAudio());
        
        this.voiceSelect.addEventListener('change', () => this.saveVoiceSettings());
        this.apiKeyInput.addEventListener('input', () => this.checkApiKeyStatus());
        this.textInput.addEventListener('input', () => this.checkGenerateButtonState());
    }

    toggleApiKeyVisibility() {
        const input = this.apiKeyInput;
        const button = this.toggleApiKeyBtn;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '非表示';
        } else {
            input.type = 'password';
            button.textContent = '表示';
        }
    }

    // セキュリティ初期化
    async initializeSecurity() {
        try {
            // デバイス固有のフィンガープリントを生成
            this.deviceFingerprint = await this.generateDeviceFingerprint();
            
            // Web Crypto APIで暗号化キーを生成
            this.cryptoKey = await this.generateCryptoKey();
            
            console.log('Security initialized successfully');
        } catch (error) {
            console.error('Failed to initialize security:', error);
            throw error;
        }
    }

    // デバイス固有のフィンガープリントを生成
    async generateDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            navigator.hardwareConcurrency || 4,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.deviceMemory || 4,
            navigator.maxTouchPoints || 0
        ];

        // Canvas fingerprinting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint text 123', 2, 2);
        components.push(canvas.toDataURL());

        // Web Audio fingerprinting
        if (window.AudioContext || window.webkitAudioContext) {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const analyser = audioCtx.createAnalyser();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 10000;
            gainNode.gain.value = 0;
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            components.push(Array.from(dataArray).join(''));
            
            oscillator.start();
            oscillator.stop();
            audioCtx.close();
        }

        const fingerprintString = components.join('|');
        
        // SHA-256ハッシュを生成
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprintString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    // Web Crypto APIで暗号化キーを生成
    async generateCryptoKey() {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.deviceFingerprint + 'tts-secure-2024'),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        const salt = new TextEncoder().encode('tts-salt-2024');
        
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Web Crypto APIで暗号化
    async encryptData(data) {
        if (!this.cryptoKey) {
            throw new Error('Crypto key not initialized');
        }

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
        
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            this.cryptoKey,
            dataBuffer
        );

        // IVと暗号化データを結合
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);
        
        // Base64エンコード
        return btoa(String.fromCharCode(...combined));
    }

    // Web Crypto APIで復号化
    async decryptData(encryptedData) {
        if (!this.cryptoKey) {
            throw new Error('Crypto key not initialized');
        }

        try {
            // Base64デコード
            const combined = new Uint8Array(
                atob(encryptedData)
                    .split('')
                    .map(char => char.charCodeAt(0))
            );
            
            const iv = combined.slice(0, 12);
            const encryptedBuffer = combined.slice(12);
            
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.cryptoKey,
                encryptedBuffer
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Decryption failed:', error);
            return '';
        }
    }

    // セッション管理とタイムアウト
    startSessionMonitoring() {
        // 定期的にセッションをチェック
        setInterval(() => {
            this.checkSessionExpiry();
        }, 60000); // 1分ごとにチェック

        // ページ離脱時にセッション情報を更新
        window.addEventListener('beforeunload', () => {
            this.updateLastActivity();
        });

        // ユーザーアクティビティを監視（アクセスするたびに7日間延長）
        ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, true);
        });

        // ページ読み込み時もアクティビティとして記録
        this.updateLastActivity();
    }

    updateLastActivity() {
        localStorage.setItem('tts-last-activity', Date.now().toString());
    }

    checkSessionExpiry() {
        const lastActivity = localStorage.getItem('tts-last-activity');
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > this.sessionTimeout) {
                this.clearSecureData();
                this.showApiKeyStatus('セキュリティのため、APIキーが自動削除されました（7日間無操作）', 'warning');
            } else if (timeSinceLastActivity > this.sessionTimeout - (24 * 60 * 60 * 1000)) {
                // 削除まで24時間を切った場合の警告
                const remainingDays = Math.ceil((this.sessionTimeout - timeSinceLastActivity) / (24 * 60 * 60 * 1000));
                this.showApiKeyStatus(`APIキーは${remainingDays}日後に自動削除されます`, 'warning');
            }
        }
    }

    clearSecureData() {
        localStorage.removeItem('tts-api-key');
        localStorage.removeItem('tts-last-activity');
        this.apiKey = '';
        this.apiKeyInput.value = '';
        this.checkGenerateButtonState();
    }

    async saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showApiKeyStatus('APIキーを入力してください', 'error');
            return;
        }

        if (!this.validateApiKey(apiKey)) {
            this.showApiKeyStatus('無効なAPIキー形式です', 'error');
            return;
        }

        try {
            const encryptedKey = await this.encryptData(apiKey);
            localStorage.setItem('tts-api-key', encryptedKey);
            this.apiKey = apiKey;
            this.updateLastActivity(); // セッション開始
            this.showApiKeyStatus('APIキーが安全に保存されました', 'success');
            this.checkGenerateButtonState();
        } catch (error) {
            console.error('API key encryption failed:', error);
            this.showApiKeyStatus('APIキーの保存に失敗しました', 'error');
        }
    }

    async loadSavedApiKey() {
        try {
            const encryptedKey = localStorage.getItem('tts-api-key');
            if (encryptedKey) {
                const decryptedKey = await this.decryptData(encryptedKey);
                if (decryptedKey) {
                    this.apiKey = decryptedKey;
                    this.apiKeyInput.value = decryptedKey;
                    this.showApiKeyStatus('保存されたAPIキーを読み込みました', 'success');
                } else {
                    // 復号化に失敗した場合、古いデータを削除
                    localStorage.removeItem('tts-api-key');
                    this.showApiKeyStatus('APIキーの復号化に失敗しました。再入力してください。', 'warning');
                }
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
            // エラーの場合も古いデータを削除
            localStorage.removeItem('tts-api-key');
            this.showApiKeyStatus('APIキーの読み込みに失敗しました。再入力してください。', 'error');
        }
    }

    validateApiKey(apiKey) {
        // Google Cloud APIキーの形式をより厳密にチェック
        const googleApiKeyPattern = /^AIza[0-9A-Za-z_-]{35}$/;
        return googleApiKeyPattern.test(apiKey);
    }

    // APIキー入力の追加セキュリティ対策
    enhanceApiKeyInputSecurity() {
        // APIキー入力フィールドの自動補完を無効化
        this.apiKeyInput.setAttribute('autocomplete', 'off');
        this.apiKeyInput.setAttribute('spellcheck', 'false');
        
        // コピー&ペーストの制限は厳しすぎるため、警告のみ表示
        this.apiKeyInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.showApiKeyStatus('ペーストされたデータのセキュリティにご注意ください', 'warning');
            }, 100);
        });

        // APIキー入力時の視覚的フィードバック
        this.apiKeyInput.addEventListener('input', () => {
            const value = this.apiKeyInput.value.trim();
            if (value.length > 0) {
                if (this.validateApiKey(value)) {
                    this.apiKeyInput.style.borderColor = '#22c55e';
                } else {
                    this.apiKeyInput.style.borderColor = '#ef4444';
                }
            } else {
                this.apiKeyInput.style.borderColor = '#e2e8f0';
            }
        });
    }

    showApiKeyStatus(message, type) {
        this.apiKeyStatus.textContent = message;
        this.apiKeyStatus.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.apiKeyStatus.textContent = '';
            this.apiKeyStatus.className = 'status-message';
        }, 5000);
    }

    checkApiKeyStatus() {
        const hasApiKey = this.apiKey || this.apiKeyInput.value.trim();
        this.checkGenerateButtonState();
    }

    saveVoiceSettings() {
        const settings = {
            voice: this.voiceSelect.value,
            pitch: this.pitchRange.value,
            speed: this.speedRange.value
        };
        
        try {
            localStorage.setItem('tts-voice-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save voice settings:', error);
        }
    }

    loadVoiceSettings() {
        try {
            const savedSettings = localStorage.getItem('tts-voice-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                if (settings.voice) {
                    this.voiceSelect.value = settings.voice;
                }
                if (settings.pitch !== undefined) {
                    this.pitchRange.value = settings.pitch;
                    this.updatePitchValue();
                }
                if (settings.speed !== undefined) {
                    this.speedRange.value = settings.speed;
                    this.updateSpeedValue();
                }
            }
        } catch (error) {
            console.error('Failed to load voice settings:', error);
        }
    }

    updateCharacterCount() {
        const text = this.textInput.value;
        const charCount = text.length;
        const byteLength = new Blob([text]).size;
        
        this.charCount.textContent = `${charCount}文字 (${byteLength}バイト)`;
        
        const counter = this.charCount.parentElement;
        counter.classList.remove('warning', 'danger');
        
        if (charCount > 5000) {
            counter.classList.add('danger');
        } else if (charCount > 4500) {
            counter.classList.add('warning');
        }
        
        this.checkGenerateButtonState();
    }

    updatePitchValue() {
        this.pitchValue.textContent = this.pitchRange.value;
    }

    updateSpeedValue() {
        this.speedValue.textContent = this.speedRange.value;
    }

    checkGenerateButtonState() {
        const hasApiKey = this.apiKey || this.apiKeyInput.value.trim();
        const text = this.textInput.value.trim();
        const hasText = text.length > 0;
        const isValidLength = text.length <= 5000;
        
        this.generateBtn.disabled = !(hasApiKey && hasText && isValidLength);
        this.previewBtn.disabled = !(hasApiKey && hasText);
    }

    showProgress(text = '処理中...', progress = 0) {
        this.progressContainer.style.display = 'block';
        this.progressText.textContent = text;
        this.progressFill.style.width = `${progress}%`;
        this.downloadSection.style.display = 'none';
        this.hideError();
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    showDownload() {
        this.downloadSection.style.display = 'block';
        this.hideProgress();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.hideProgress();
        this.downloadSection.style.display = 'none';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    async generateSpeech() {
        const apiKey = this.apiKey || this.apiKeyInput.value.trim();
        const text = this.textInput.value.trim();
        
        if (!apiKey || !text) {
            this.showError('APIキーとテキストを入力してください');
            return;
        }

        this.generateBtn.disabled = true;
        this.showProgress('音声を生成中...', 10);

        try {
            const byteLength = new Blob([text]).size;
            
            if (byteLength <= 5000) {
                const audioData = await this.callTextToSpeechAPI(apiKey, text);
                this.showProgress('音声ファイルを準備中...', 90);
                this.currentAudioData = audioData;
            } else {
                const chunks = this.splitTextIntoChunks(text, 5000);
                const audioChunks = [];
                
                for (let i = 0; i < chunks.length; i++) {
                    const progress = 10 + (70 * (i + 1) / chunks.length);
                    this.showProgress(`音声を生成中... (${i + 1}/${chunks.length})`, progress);
                    
                    const audioData = await this.callTextToSpeechAPI(apiKey, chunks[i]);
                    audioChunks.push(audioData);
                }
                
                this.showProgress('音声ファイルを結合中...', 85);
                this.currentAudioData = await this.combineAudioChunks(audioChunks);
            }
            
            this.showProgress('完了', 100);
            
            setTimeout(() => {
                this.showDownload();
            }, 500);
            
        } catch (error) {
            console.error('Speech generation failed:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    async callTextToSpeechAPI(apiKey, text) {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
        
        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: 'ja-JP',
                name: this.voiceSelect.value,
                ssmlGender: this.getGenderFromVoice(this.voiceSelect.value)
            },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: parseFloat(this.pitchRange.value),
                speakingRate: parseFloat(this.speedRange.value)
            }
        };

        this.showProgress('APIに接続中...', 30);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        this.showProgress('音声データを受信中...', 60);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (!data.audioContent) {
            throw new Error('音声データが返されませんでした');
        }

        return data.audioContent;
    }

    getGenderFromVoice(voiceName) {
        if (voiceName.includes('-A') || voiceName.includes('-C')) {
            return 'FEMALE';
        }
        return 'MALE';
    }

    getErrorMessage(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('401') || message.includes('unauthorized')) {
            return 'APIキーが無効です。正しいAPIキーを入力してください。';
        } else if (message.includes('403') || message.includes('forbidden')) {
            return 'APIの使用が制限されています。Google Cloud Platformでプロジェクトとサービスが有効になっているか確認してください。';
        } else if (message.includes('400') || message.includes('bad request')) {
            return 'リクエストが無効です。テキストの内容を確認してください。';
        } else if (message.includes('network') || message.includes('fetch')) {
            return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else if (message.includes('quota')) {
            return 'API使用量の上限に達しました。Google Cloud Platformで使用量を確認してください。';
        }
        
        return `エラーが発生しました: ${error.message}`;
    }

    splitTextIntoChunks(text, maxBytes) {
        const chunks = [];
        let currentChunk = '';
        const sentences = text.split(/[。！？\n]/);
        
        for (let sentence of sentences) {
            if (sentence.trim() === '') continue;
            
            sentence = sentence.trim() + (sentence.match(/[。！？]/) ? '' : '。');
            const testChunk = currentChunk + (currentChunk ? '' : '') + sentence;
            
            if (new Blob([testChunk]).size <= maxBytes) {
                currentChunk = testChunk;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = sentence;
                    
                    if (new Blob([currentChunk]).size > maxBytes) {
                        const words = sentence.split('');
                        let wordChunk = '';
                        currentChunk = '';
                        
                        for (let word of words) {
                            const testWordChunk = wordChunk + word;
                            if (new Blob([testWordChunk]).size <= maxBytes) {
                                wordChunk = testWordChunk;
                            } else {
                                if (wordChunk) chunks.push(wordChunk);
                                wordChunk = word;
                            }
                        }
                        currentChunk = wordChunk;
                    }
                } else {
                    const words = sentence.split('');
                    let wordChunk = '';
                    for (let word of words) {
                        const testWordChunk = wordChunk + word;
                        if (new Blob([testWordChunk]).size <= maxBytes) {
                            wordChunk = testWordChunk;
                        } else {
                            if (wordChunk) chunks.push(wordChunk);
                            wordChunk = word;
                        }
                    }
                    if (wordChunk) currentChunk = wordChunk;
                }
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }

    async combineAudioChunks(audioChunks) {
        const audioArrays = audioChunks.map(chunk => {
            const audioBytes = atob(chunk);
            const audioArray = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                audioArray[i] = audioBytes.charCodeAt(i);
            }
            return audioArray;
        });
        
        const totalLength = audioArrays.reduce((sum, arr) => sum + arr.length, 0);
        const combined = new Uint8Array(totalLength);
        
        let offset = 0;
        for (let array of audioArrays) {
            combined.set(array, offset);
            offset += array.length;
        }
        
        // スタックオーバーフローを避けるために小さなチャンクに分割して処理
        let binaryString = '';
        const chunkSize = 8192; // 8KB毎に処理
        for (let i = 0; i < combined.length; i += chunkSize) {
            const chunk = combined.slice(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, chunk);
        }
        
        return btoa(binaryString);
    }

    downloadAudio() {
        if (!this.currentAudioData) {
            this.showError('ダウンロードする音声データがありません');
            return;
        }

        try {
            const audioBytes = atob(this.currentAudioData);
            const audioArray = new Uint8Array(audioBytes.length);
            
            for (let i = 0; i < audioBytes.length; i++) {
                audioArray[i] = audioBytes.charCodeAt(i);
            }

            const blob = new Blob([audioArray], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `audio-${Math.floor(Math.random() * 1000000)}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('ファイルのダウンロードに失敗しました');
        }
    }

    async generatePreview() {
        const apiKey = this.apiKey || this.apiKeyInput.value.trim();
        const fullText = this.textInput.value.trim();
        
        if (!apiKey || !fullText) {
            this.showError('APIキーとテキストを入力してください');
            return;
        }

        // 最初の60文字を取得
        const previewText = fullText.substring(0, 60);
        
        this.previewBtn.disabled = true;
        this.showProgress('プレビュー音声を生成中...', 10);

        try {
            const audioData = await this.callTextToSpeechAPI(apiKey, previewText);
            this.showProgress('プレビュー音声を準備中...', 90);
            
            // Base64データをBlobに変換
            const audioBytes = atob(audioData);
            const audioArray = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                audioArray[i] = audioBytes.charCodeAt(i);
            }
            
            const blob = new Blob([audioArray], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            
            // audio要素にセット
            this.previewAudio.src = url;
            this.previewSection.style.display = 'block';
            
            this.hideProgress();
            
        } catch (error) {
            console.error('Preview generation failed:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.previewBtn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextToSpeechApp();
});