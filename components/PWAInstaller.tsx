'use client'

import { useEffect, useState } from 'react'
import { Ellipsis, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstaller() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // iOS判定
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    // 以前に閉じていればiOS用のガイドも非表示
    const dismissedInitial = localStorage.getItem('pwa-install-dismissed')
    if (dismissedInitial) {
      setShowIOSPrompt(false)
    }

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
    setShowIOSPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // すでにインストール済みの場合は何も表示しない
  if (isStandalone) {
    return null
  }

  // iOS向けの手動インストール手順
  if (isIOS && !isStandalone && showIOSPrompt) {
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
          このアプリをホーム画面に追加するには、右下の<Ellipsis size={20} />から共有をタップして、「ホーム画面に追加」を選択してください。
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
