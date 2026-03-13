/**
 * Composable for PWA functionality
 * Handles installation prompts, update notifications, and offline status
 */

import { ref, onMounted, onUnmounted } from 'vue'

export function usePWAStatus() {
  // Check if running on client side
  const isClient = typeof window !== 'undefined'
  
  const isOnline = ref(isClient ? navigator.onLine : true)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const needsUpdate = ref(false)
  const deferredPrompt = ref<any>(null)

  /**
   * Check if app is installed
   */
  function checkInstallation() {
    if (!isClient) return
    
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    isInstalled.value = isStandalone || isIOSStandalone
  }

  /**
   * Handle online/offline status changes
   */
  function updateOnlineStatus() {
    if (!isClient) return
    
    isOnline.value = navigator.onLine
    
    if (isOnline.value) {
      // Process any queued submissions when coming back online
      const { processQueue } = useBackgroundSync()
      processQueue().then(result => {
        if (result.processed > 0) {
          console.log(`Synced ${result.processed} queued submissions`)
        }
      })
    }
  }

  /**
   * Handle beforeinstallprompt event
   */
  function handleBeforeInstallPrompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    
    // Stash the event so it can be triggered later
    deferredPrompt.value = e
    isInstallable.value = true
  }

  /**
   * Show install prompt
   */
  async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt.value) {
      return false
    }

    // Show the install prompt
    deferredPrompt.value.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice

    // Clear the deferred prompt
    deferredPrompt.value = null
    isInstallable.value = false

    return outcome === 'accepted'
  }

  /**
   * Handle app installed event
   */
  function handleAppInstalled() {
    isInstalled.value = true
    isInstallable.value = false
    deferredPrompt.value = null
  }

  /**
   * Check for service worker updates
   */
  async function checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }

  /**
   * Handle service worker updates
   */
  function handleControllerChange() {
    needsUpdate.value = true
  }

  /**
   * Reload to apply updates
   */
  function reloadForUpdate() {
    window.location.reload()
  }

  /**
   * Initialize PWA functionality
   */
  function initialize() {
    if (!isClient) return () => {}
    
    checkInstallation()
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    }

    // Check for updates periodically (every 30 minutes)
    const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000)

    // Cleanup function
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
      
      clearInterval(updateInterval)
    }
  }

  onMounted(() => {
    const cleanup = initialize()
    
    onUnmounted(() => {
      cleanup()
    })
  })

  return {
    isOnline,
    isInstallable,
    isInstalled,
    needsUpdate,
    promptInstall,
    reloadForUpdate,
    checkForUpdates
  }
}
