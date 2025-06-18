class TextToSpeechApp {
    constructor() {
        this.apiKey = '';
        this.encryptionKey = 'tts-app-secure-key-2024';
        this.initializeElements();
        this.bindEvents();
        this.loadSavedApiKey();
        this.loadVoiceSettings();
        this.checkApiKeyStatus();
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

    encryptData(data) {
        return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    }

    decryptData(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            return '';
        }
    }

    saveApiKey() {
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
            const encryptedKey = this.encryptData(apiKey);
            localStorage.setItem('tts-api-key', encryptedKey);
            this.apiKey = apiKey;
            this.showApiKeyStatus('APIキーが保存されました', 'success');
            this.checkGenerateButtonState();
        } catch (error) {
            this.showApiKeyStatus('APIキーの保存に失敗しました', 'error');
        }
    }

    loadSavedApiKey() {
        try {
            const encryptedKey = localStorage.getItem('tts-api-key');
            if (encryptedKey) {
                const decryptedKey = this.decryptData(encryptedKey);
                if (decryptedKey) {
                    this.apiKey = decryptedKey;
                    this.apiKeyInput.value = decryptedKey;
                    this.showApiKeyStatus('保存されたAPIキーを読み込みました', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    validateApiKey(apiKey) {
        return apiKey.length > 10 && /^[A-Za-z0-9_-]+$/.test(apiKey);
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