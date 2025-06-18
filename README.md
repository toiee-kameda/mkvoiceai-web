# Text-to-Speech Web Service

Google Text-to-Speech APIを使用して、テキストを音声に変換し、MP3ファイルとしてダウンロードできるWebサービスです。

## 🎯 主な機能

- **テキスト入力**: 最大5,000文字のテキストを音声に変換
- **音声設定**: 声の種類、ピッチ、スピードを調整可能
- **MP3ダウンロード**: 生成された音声をMP3ファイルとしてダウンロード
- **APIキー管理**: ユーザー自身のGoogle Cloud APIキーを暗号化して保存
- **レスポンシブデザイン**: デスクトップ・モバイル対応

## 🚀 ローカルでの使用方法

### 1. ファイルのダウンロード

このリポジトリの全ファイルをダウンロードするか、以下のファイルをダウンロードしてください：

- `index.html`
- `script.js`
- `styles.css`
- `crypto-js.min.js`

### 2. ローカルで起動

**方法1: 直接開く**
```bash
# ダウンロードしたフォルダでindex.htmlをダブルクリック
# または、ブラウザでindex.htmlを開く
```

**方法2: ローカルサーバーを使用（推奨）**
```bash
# Python 3の場合
python -m http.server 8000

# Python 2の場合
python -m SimpleHTTPServer 8000

# Node.jsの場合（http-serverがインストール済み）
npx http-server

# その後、ブラウザで http://localhost:8000 にアクセス
```

### 3. Google Cloud APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. Text-to-Speech APIを有効化
4. 認証情報からAPIキーを作成
5. 必要に応じてAPIキーにText-to-Speech APIの制限を設定

### 4. 使用開始

1. ブラウザでアプリケーションを開く
2. APIキー設定セクションでGoogle Cloud APIキーを入力・保存
3. テキストを入力
4. 音声設定を調整
5. 「音声を生成」ボタンをクリック
6. 生成完了後、MP3ファイルをダウンロード

## 🌐 オンラインでの利用

### Netlifyでのデプロイ

1. GitHubリポジトリを作成してコードをプッシュ
2. [Netlify](https://www.netlify.com/)でアカウント作成
3. 「New site from Git」でリポジトリを連携
4. 自動デプロイが完了すると、HTTPSでアクセス可能

### その他のホスティングサービス

- **Vercel**: ゼロ設定でのデプロイ
- **GitHub Pages**: GitHubリポジトリから直接ホスティング
- **Firebase Hosting**: Googleのホスティングサービス

## 🔧 技術仕様

### フロントエンド
- **言語**: Vanilla JavaScript (ES6+)
- **UI**: HTML5 + CSS3
- **暗号化**: CryptoJS
- **API**: Google Cloud Text-to-Speech API

### 対応ブラウザ
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### 音声設定
- **言語**: 日本語
- **音声タイプ**: Standard / WaveNet（高品質）
- **性別**: 男性・女性の選択肢
- **ピッチ**: -20 ～ +20
- **スピード**: 0.25x ～ 4.0x

## 🔒 セキュリティ

- APIキーはブラウザのlocalStorageに暗号化して保存
- HTTPS環境での使用を推奨
- クライアントサイドのみで動作（サーバーにデータ送信なし）

## 💰 料金について

- **アプリケーション**: 無料
- **Google Cloud Text-to-Speech API**: 従量課金制
  - 毎月100万文字まで無料
  - 超過分は文字数に応じて課金

## 🎨 カスタマイズ

### 音声の追加
`script.js`の`voice-select`オプションを編集して、他の言語や音声を追加できます：

```javascript
// 例: 英語音声の追加
<option value="en-US-Wavenet-D">English (Female)</option>
<option value="en-US-Wavenet-A">English (Male)</option>
```

### スタイルの変更
`styles.css`を編集してデザインをカスタマイズできます。

## 🐛 トラブルシューティング

### よくある問題

**APIキーエラー**
- APIキーが正しく入力されているか確認
- Google Cloud ConsoleでText-to-Speech APIが有効になっているか確認
- APIキーの制限設定を確認

**音声が生成されない**
- インターネット接続を確認
- ブラウザの開発者ツールでエラーメッセージを確認
- 文字数制限（5,000文字）を超えていないか確認

**ファイルがダウンロードできない**
- ブラウザのポップアップブロッカーを確認
- ダウンロード許可設定を確認

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

バグレポートや機能提案はIssuesでお気軽にお知らせください。

---

**注意**: このアプリケーションを使用する際は、Google Cloud Platformの利用規約とText-to-Speech APIの制限事項をご確認ください。