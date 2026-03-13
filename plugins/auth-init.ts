export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialize mock users for testing
  if (process.client) {
    const { initializeMockUsers } = await import('~/utils/mockAuth')
    initializeMockUsers()
    
    // Restore session on app initialization
    await authStore.restoreSession()
  }
})
