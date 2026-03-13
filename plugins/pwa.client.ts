/**
 * PWA initialization plugin
 * Runs only on client side to set up service worker and background sync
 */

export default defineNuxtPlugin(() => {
  // Initialize PWA functionality
  if (process.client) {
    // Register service worker update handler
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          console.log('Background sync completed:', event.data)
        }
      })
    }

    // Process any pending submissions on app start
    const { processQueue, hasPendingSubmissions } = useBackgroundSync()
    
    if (navigator.onLine && hasPendingSubmissions()) {
      processQueue().then(result => {
        if (result.processed > 0) {
          console.log(`Processed ${result.processed} pending submissions on startup`)
        }
      }).catch(error => {
        console.error('Failed to process pending submissions:', error)
      })
    }

    // Listen for online event to process queue
    window.addEventListener('online', () => {
      if (hasPendingSubmissions()) {
        processQueue().then(result => {
          if (result.processed > 0) {
            console.log(`Processed ${result.processed} pending submissions after coming online`)
          }
        }).catch(error => {
          console.error('Failed to process pending submissions:', error)
        })
      }
    })
  }
})
