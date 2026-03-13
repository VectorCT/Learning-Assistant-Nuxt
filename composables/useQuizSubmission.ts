/**
 * Composable for handling quiz submissions with offline support
 * Automatically queues submissions when offline and syncs when online
 */

import { ref } from 'vue'

interface QuizSubmission {
  chapterId: string
  answers: Array<{
    questionId: string
    selectedOptions: string[]
  }>
}

interface QuizResult {
  totalScore: number
  maxScore: number
  questionResults: Array<{
    questionId: string
    isCorrect: boolean
    awardedPoints: number
    correctOptions: string[]
  }>
}

export function useQuizSubmission() {
  const api = useApi()
  const { queueQuizSubmission, hasPendingSubmissions, getPendingCount } = useBackgroundSync()
  
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  /**
   * Submit quiz with automatic offline handling
   */
  async function submitQuiz(submission: QuizSubmission): Promise<QuizResult | null> {
    isSubmitting.value = true
    error.value = null

    try {
      // Check if online
      if (!navigator.onLine) {
        // Queue for background sync
        await queueQuizSubmission(submission)
        
        // Return null to indicate queued submission
        return null
      }

      // Try to submit online
      const result = await api.submitQuiz(submission)
      return result as QuizResult
      
    } catch (err: any) {
      // If network error, queue for later
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        try {
          await queueQuizSubmission(submission)
          error.value = 'Submission queued. Will sync when online.'
          return null
        } catch (queueError) {
          error.value = 'Failed to queue submission'
          throw queueError
        }
      }
      
      // Other errors
      error.value = err.response?.data?.message || 'Failed to submit quiz'
      throw err
      
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Check if there are pending submissions
   */
  function checkPendingSubmissions() {
    return {
      hasPending: hasPendingSubmissions(),
      count: getPendingCount()
    }
  }

  return {
    submitQuiz,
    isSubmitting,
    error,
    checkPendingSubmissions
  }
}
