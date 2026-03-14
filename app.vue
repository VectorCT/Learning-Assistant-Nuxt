<template>
  <v-app>
    <!-- Skip to main content link for keyboard navigation -->
    <a href="#main-content" class="skip-link">
      Skip to main content
    </a>

    <!-- Sidebar Navigation (rendered first for proper layout) -->
    <AppSidebar v-if="!isAuthPage" ref="sidebarRef" />

    <!-- App Header (will automatically position next to sidebar) -->
    <AppHeader v-if="!isAuthPage" @toggle-sidebar="toggleSidebar" />

    <!-- Main Content Area with Swipe Support -->
    <v-main 
      id="main-content" 
      ref="mainContent"
      class="main-content" 
      role="main" 
      tabindex="-1"
    >
      <v-container fluid class="pa-0">
        <NuxtPage />
      </v-container>
    </v-main>

    <!-- Global Notifications -->
    <GlobalNotifications />
  </v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

const route = useRoute()
const { mobile } = useDisplay()
const sidebarRef = ref()
const mainContent = ref<HTMLElement | null>(null)

// Hide sidebar and header on auth pages
const isAuthPage = computed(() => {
  const authPages = ['/login', '/register']
  return authPages.includes(route.path)
})

const toggleSidebar = () => {
  sidebarRef.value?.toggleDrawer()
}

// Enhanced swipe gesture support for mobile with better performance
onMounted(async () => {
  await nextTick()
  
  const element = mainContent.value
  if (!element || !(element instanceof HTMLElement)) return

  let touchStartX = 0
  let touchStartY = 0
  let touchEndX = 0
  let touchEndY = 0
  let isSwiping = false

  const handleTouchStart = (e: TouchEvent) => {
    // Only handle swipes on mobile
    if (!mobile.value) return

    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    isSwiping = false
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!mobile.value) return

    touchEndX = e.touches[0].clientX
    touchEndY = e.touches[0].clientY
    
    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    
    // Detect if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping = true
    }
  }

  const handleTouchEnd = () => {
    if (!mobile.value || !isSwiping) {
      // Reset values
      touchStartX = 0
      touchStartY = 0
      touchEndX = 0
      touchEndY = 0
      isSwiping = false
      return
    }

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const minSwipeDistance = 60 // Increased for more intentional swipes
    const edgeThreshold = 60 // Increased edge detection area

    // Check if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe from left edge to open sidebar
      if (deltaX > minSwipeDistance && touchStartX < edgeThreshold) {
        if (!sidebarRef.value?.drawer) {
          sidebarRef.value?.toggleDrawer()
        }
      }
      // Swipe left to close sidebar (when sidebar is open)
      else if (deltaX < -minSwipeDistance && sidebarRef.value?.drawer) {
        sidebarRef.value?.toggleDrawer()
      }
    }

    // Reset values
    touchStartX = 0
    touchStartY = 0
    touchEndX = 0
    touchEndY = 0
    isSwiping = false
  }
  
  // Use passive listeners for better scroll performance
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchmove', handleTouchMove, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })

  // Cleanup
  onUnmounted(() => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  })
})
</script>

<style scoped lang="scss">
// Prevent white flash before Vuetify initializes
// The inline script in nuxt.config sets app-dark/app-light class on <html>
:global(html.app-dark) {
  background-color: #0F172A !important;
  color: #E2E8F0;
}

:global(html.app-light) {
  background-color: #F8FAFC !important;
  color: #1E293B;
}

// Ensure v-app spans full viewport height
:deep(.v-application) {
  min-height: 100vh;
  height: 100%;
}

// Main content area styling with mobile optimizations
.main-content {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-background));
  
  // Ensure proper spacing and responsive behavior
  :deep(.v-container) {
    max-width: 100%;
    height: 100%;
  }
  
  // Mobile performance optimizations
  @media (max-width: 767px) {
    // Hardware acceleration for smooth interactions
    will-change: transform;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    
    // Optimize touch scrolling
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    
    // Prevent layout thrashing
    contain: layout style;
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .main-content {
    // Mobile: Full width content
    :deep(.v-container) {
      padding: 0;
    }
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    // Tablet: Comfortable padding
    :deep(.v-container) {
      padding: 16px;
    }
  }
}

@media (min-width: 1024px) {
  .main-content {
    // Desktop: Standard padding
    :deep(.v-container) {
      padding: 24px;
    }
  }
}

// Smooth transitions for layout changes with hardware acceleration
.v-main {
  transition: padding 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 767px) {
    // Mobile performance optimization
    will-change: padding;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}

// Ensure content is accessible and properly positioned
:deep(.v-main__wrap) {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  @media (max-width: 767px) {
    // Optimize rendering on mobile
    contain: layout style;
  }
}
</style>
