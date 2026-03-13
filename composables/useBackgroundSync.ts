/**
 * Composable for handling background sync of quiz submissions
 * Queues submissions when offline and syncs when connection is restored
 */

interface QueuedSubmission {
  id: string
  chapterId: string
  answers: Array<{
    questionId: string
    selectedOptions: string[]
  }>
  timestamp: number
}

const SYNC_TAG = 'quiz-submission-sync'
const QUEUE_KEY = 'pending-quiz-submissions'

export function useBackgroundSync() {
  // Check if running on client side
  const isClient = typeof window !== 'undefined'
  
  /**
   * Register background sync for quiz submissions
   */
  async function registerSync() {
    if (!isClient) return
    
    if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register(SYNC_TAG)
        console.log('Background sync registered')
      } catch (error) {
        console.error('Failed to register background sync:', error)
      }
    }
  }

  /**
   * Queue a quiz submission for background sync
   */
  async function queueQuizSubmission(submission: {
    chapterId: string
    answers: Array<{
      questionId: string
      selectedOptions: string[]
    }>
  }): Promise<string> {
    if (!isClient) {
      throw new Error('Cannot queue submissions on server side')
    }
    
    const queuedSubmission: QueuedSubmission = {
      id: crypto.randomUUID(),
      ...submission,
      timestamp: Date.now()
    }

    // Get existing queue
    const queue = getQueue()
    queue.push(queuedSubmission)

    // Save to localStorage
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))

    // Register sync
    await registerSync()

    return queuedSubmission.id
  }

  /**
   * Get queued submissions
   */
  function getQueue(): QueuedSubmission[] {
    if (!isClient) return []
    
    try {
      const queueData = localStorage.getItem(QUEUE_KEY)
      return queueData ? JSON.parse(queueData) : []
    } catch (error) {
      console.error('Failed to parse queue:', error)
      return []
    }
  }

  /**
   * Remove a submission from the queue
   */
  function removeFromQueue(submissionId: string) {
    if (!isClient) return
    
    const queue = getQueue()
    const updatedQueue = queue.filter(item => item.id !== submissionId)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue))
  }

  /**
   * Process queued submissions
   */
  async function processQueue() {
    const queue = getQueue()
    
    if (queue.length === 0) {
      return { success: true, processed: 0, failed: 0 }
    }

    const api = useApi()
    let processed = 0
    let failed = 0

    for (const submission of queue) {
      try {
        // Attempt to submit
        await api.submitQuiz({
          chapterId: submission.chapterId,
          answers: submission.answers
        })

        // Remove from queue on success
        removeFromQueue(submission.id)
        processed++
      } catch (error) {
        console.error('Failed to sync submission:', error)
        failed++
      }
    }

    return { success: failed === 0, processed, failed }
  }

  /**
   * Check if there are pending submissions
   */
  function hasPendingSubmissions(): boolean {
    return getQueue().length > 0
  }

  /**
   * Get count of pending submissions
   */
  function getPendingCount(): number {
    return getQueue().length
  }

  /**
   * Clear all queued submissions
   */
  function clearQueue() {
    if (!isClient) return
    
    localStorage.removeItem(QUEUE_KEY)
  }

  return {
    queueQuizSubmission,
    processQueue,
    hasPendingSubmissions,
    getPendingCount,
    clearQueue,
    getQueue
  }
}
