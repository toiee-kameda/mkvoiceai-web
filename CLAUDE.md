# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Text-to-Speech Web Service

## プロジェクト概要

Google Text-to-Speech APIを使用して、テキストを音声に変換し、ダウンロード可能なWebサービスを作成します。主にSubstackライターが自分の記事を音声コンテンツ化することを想定しています。

## 主な機能

### 基本機能
- テキスト入力（最大5,000文字）
- 音声設定の選択（声の種類、ピッチ、スピード）
- 音声生成とMP3ファイルのダウンロード
- 文字数カウンター表示

### APIキー管理
- ユーザーが自分で取得したGoogle Cloud Platform APIキーを使用
- ブラウザのlocalStorageに暗号化して保存
- ユーザー登録機能は提供しない

## 技術仕様

### フロントエンド
- **技術スタック**: vanilla JavaScript + HTML + CSS
- **理由**: シンプルな要件のため、フレームワーク不要
- **UI**: 直感的で分かりやすいシンプルなデザイン

### API連携
- **使用API**: Google Cloud Text-to-Speech API
- **認証**: ユーザー提供のAPIキー
- **文字数制限**: 5,000文字（それ以上は分割して複数回実行）

### セキュリティ対策
- APIキーのlocalStorage暗号化保存
- HTTPS必須
- 適切な入力値検証
- APIキーの表示/非表示切り替え機能

## ターゲットユーザー

### 主要ターゲット
- Substackライター
- ブログ記事を音声コンテンツ化したいクリエイター
- ポッドキャスト形式での配信を検討している人

### 使用シーン
- 記事の読み上げ音声作成
- アクセシビリティ向上のための音声コンテンツ提供
- マルチメディアコンテンツの作成

## UI/UX設計

### レイアウト
1. **APIキー設定セクション**
   - APIキー入力フィールド（パスワード形式）
   - 表示/非表示切り替えボタン
   - 保存ボタン

2. **テキスト入力セクション**
   - 大きなテキストエリア
   - 文字数カウンター（5,000文字制限表示）

3. **音声設定セクション**
   - 声の種類選択（ドロップダウン）
   - ピッチ調整（スライダー）
   - スピード調整（スライダー）

4. **生成・ダウンロードセクション**
   - 音声生成ボタン
   - 進行状況表示
   - ダウンロードリンク

## 開発計画

### Phase 1: 基本構造
- HTML構造の作成
- CSS基本スタイリング
- レスポンシブデザイン対応

### Phase 2: API連携
- Google Text-to-Speech API連携実装
- APIキー管理機能
- エラーハンドリング

### Phase 3: 機能実装
- 音声生成機能
- ファイルダウンロード機能
- UI/UXの最適化

### Phase 4: セキュリティ・最適化
- セキュリティ強化
- パフォーマンス最適化
- ユーザビリティテスト

## デプロイメント

### 推奨プラットフォーム
- **Netlify** (推奨)
  - 静的サイトホスティング無料
  - 自動HTTPS
  - GitHubとの連携
  - 簡単なデプロイプロセス

### 代替選択肢
- Vercel
- GitHub Pages
- Firebase Hosting

### デプロイフロー
1. GitHubリポジトリ作成
2. コードのpush
3. Netlifyでリポジトリ連携
4. 自動デプロイ設定

## 制約事項

### 技術的制約
- 文字数制限: 5,000文字
- ブラウザベースのみ（モバイルアプリなし）
- オフライン機能なし

### ビジネス制約
- ユーザー管理機能なし
- 利用統計取得なし
- 有料プラン設定なし

## 必要なリソース

### 開発者向けドキュメント
- Google Cloud Text-to-Speech API documentation
- Web Audio API reference
- localStorage セキュリティベストプラクティス

### ユーザー向けガイド
- Google Cloud Platform APIキー取得方法
- 基本的な使用方法
- トラブルシューティング

## 成功指標

### 技術指標
- ページ読み込み速度 < 3秒
- 音声生成成功率 > 95%
- エラー発生率 < 5%

### ユーザー体験指標
- 直感的な操作性
- 明確なエラーメッセージ
- レスポンシブデザイン対応

## 注意事項

### APIキー管理
- ユーザーに適切なAPIキー管理を促すドキュメント提供
- Google Cloud Platformの使用料金についての注意喚起

### セキュリティ
- HTTPS必須環境での運用
- 定期的なセキュリティアップデート
- 適切なエラーハンドリングでAPIキー漏洩防止

---

## Development Guide

### Architecture Overview
- **Single-page application** built with vanilla JavaScript, HTML, and CSS
- **Main application class**: `TextToSpeechApp` in `script.js` handles all functionality
- **API integration**: Direct calls to Google Cloud Text-to-Speech API from the browser
- **State management**: Uses class properties and localStorage for API key persistence
- **Encryption**: Uses CryptoJS library for API key encryption in localStorage

### Key Files
- `index.html`: Main HTML structure with Japanese UI
- `script.js`: Main application logic as a single ES6 class
- `styles.css`: Complete styling with responsive design
- `crypto-js.min.js`: Third-party library for encryption

### Core Components
- **API Key Management**: Encrypted storage, validation, toggle visibility (`script.js:72-130`)
- **Text Processing**: Character counting, validation, 5000 char limit (`script.js:131-146`)
- **Voice Settings**: Voice selection, pitch/speed controls (`script.js:147-154`)
- **Audio Generation**: Google TTS API calls, progress tracking (`script.js:191-263`)
- **File Download**: Base64 to MP3 conversion and download (`script.js:290-321`)

### Development Commands
This is a static web application with no build process. Simply:
- Open `index.html` in a web browser for local development
- Use a local HTTP server for HTTPS testing: `python -m http.server 8000`
- No package.json, dependencies, or build commands required

### Testing Strategy
- Manual testing in web browsers (Chrome, Firefox, Safari)
- Test with valid Google Cloud Text-to-Speech API key
- Test responsive design on different screen sizes
- Verify HTTPS functionality for production deployment

### Security Considerations
- API keys are encrypted using CryptoJS AES before localStorage storage
- Client-side only - no server-side components
- Requires HTTPS in production for secure API calls
- Input validation for text length and API key format

このドキュメントは開発進行に応じて更新される予定です。