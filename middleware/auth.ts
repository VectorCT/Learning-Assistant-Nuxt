export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Check if route requires admin role
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
