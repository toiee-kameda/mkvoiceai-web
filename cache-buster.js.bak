// キャッシュバスター - 自動的にCSS/JSファイルにタイムスタンプを追加
(function() {
    'use strict';
    
    // デプロイ時のタイムスタンプ（手動更新またはビルド時に自動設定）
    const DEPLOY_VERSION = '20241219-01';
    
    // 現在の日時ベースのバージョン（開発時用）
    const CACHE_BUSTER = Date.now();
    
    // 本番環境ではDEPLOY_VERSION、開発環境ではCACHE_BUSTERを使用
    const version = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname.includes('dev') ? 
                   CACHE_BUSTER : DEPLOY_VERSION;
    
    // すべてのlink要素（CSS）にバージョンを追加
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('?v=') && !href.startsWith('http')) {
            link.setAttribute('href', `${href}?v=${version}`);
        }
    });
    
    // すべてのscript要素（JS）にバージョンを追加
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('?v=') && !src.startsWith('http')) {
            script.setAttribute('src', `${src}?v=${version}`);
        }
    });
    
    console.log(`Cache buster applied: v=${version}`);
})();