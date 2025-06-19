#!/bin/bash

# デプロイ前にバージョンを自動更新するスクリプト

# 現在の日時をバージョンとして生成
NEW_VERSION=$(date +"%Y%m%d-%H%M")

echo "新しいバージョン: $NEW_VERSION"

# index.htmlのバージョンを更新
sed -i.bak "s/\?v=[0-9]\{8\}-[0-9]\{2,4\}/\?v=$NEW_VERSION/g" index.html

# cache-buster.jsのバージョンを更新
sed -i.bak "s/const DEPLOY_VERSION = '[0-9]\{8\}-[0-9]\{2,4\}'/const DEPLOY_VERSION = '$NEW_VERSION'/g" cache-buster.js

echo "✅ バージョンを $NEW_VERSION に更新しました"
echo "📝 変更されたファイル:"
echo "   - index.html"
echo "   - cache-buster.js"
echo ""
echo "🚀 次のステップ:"
echo "   1. git add ."
echo "   2. git commit -m \"バージョン更新: $NEW_VERSION\""
echo "   3. git push"
echo "   4. Cloudflareにデプロイ"