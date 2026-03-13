export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Redirect authenticated users away from login/register
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
