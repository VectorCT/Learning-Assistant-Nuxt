export function useErrorHandler() {
  const notificationStore = useNotificationStore()
  
  function handleApiError(error: any, context = '') {
    let message = 'An unexpected error occurred'
    
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          message = error.response.data?.message || 'Invalid request'
          break
        case 401:
          message = 'Authentication required'
          break
        case 403:
          message = 'Access denied'
          break
        case 404:
          message = 'Resource not found'
          break
        case 500:
          message = 'Server error. Please try again later'
          break
        default:
          message = error.response.data?.message || message
      }
    } else if (error.request) {
      // Request made but no response
      if (error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to API server. Please ensure the backend is running.'
      } else if (error.code === 'ECONNREFUSED') {
        message = 'Connection refused. The API server may not be running.'
      } else {
        message = 'Network error. Please check your connection and API server.'
      }
    } else if (error.message) {
      message = error.message
    }
    
    if (context) {
      message = `${context}: ${message}`
    }
    
    notificationStore.showError(message)
    
    return message
  }
  
  function handleSuccess(message: string) {
    notificationStore.showSuccess(message)
  }
  
  return {
    handleApiError,
    handleSuccess
  }
}
