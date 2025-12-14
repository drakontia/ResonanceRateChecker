'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstaller() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // iOS判定
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    // スタンドアロンモード判定
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )

    // Service Workerの登録
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      }).catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
    }

    // beforeinstallpromptイベントのハンドラー
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      
      // ユーザーが前回インストールを拒否していなければプロンプトを表示
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        // 少し遅延させてユーザー体験を向上
        setTimeout(() => {
          setShowPrompt(true)
        }, 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // アプリがインストールされた時のイベント
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem('pwa-install-dismissed')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // ネイティブのインストールプロンプトを表示
    deferredPrompt.prompt()

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // プロンプトを非表示
    setShowPrompt(false)
    setDeferredPrompt(null)

    // 拒否された場合は記録
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // すでにインストール済みの場合は何も表示しない
  if (isStandalone) {
    return null
  }

  // iOS向けの手動インストール手順
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm">アプリをインストール</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          このアプリをホーム画面に追加するには、共有ボタン
          <span className="inline-block mx-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </span>
          をタップして、「ホーム画面に追加」を選択してください。
        </p>
      </div>
    )
  }

  // Androidやデスクトップ向けのインストールプロンプト
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm">アプリをインストール</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
          このアプリをデバイスにインストールして、より快適に利用できます。
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
          >
            インストール
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            後で
          </button>
        </div>
      </div>
    )
  }

  return null
}
