import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'レゾナンス：無限号列車 相場チェッカー',
    short_name: '相場チェッカー',
    description: 'レゾナンス：無限号列車のゲーム内の取引品の相場をチェックできるサイトです。',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'any',
    categories: ['utilities', 'games'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'アプリケーションのホーム画面',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '640x1136',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'アプリケーションのホーム画面（モバイル）',
      },
    ],
  }
}