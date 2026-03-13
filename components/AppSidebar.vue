<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !mobile"
    :permanent="!mobile"
    :temporary="mobile"
    :width="280"
    :rail-width="72"
    class="app-sidebar"
    color="surface"
    role="navigation"
    aria-label="Main navigation sidebar"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div v-if="!rail || mobile" class="d-flex align-center pa-4">
        <v-icon color="primary" size="32" aria-hidden="true">mdi-school</v-icon>
        <span class="text-h6 ml-3 font-weight-bold">SA Learner</span>
      </div>
      <div v-else class="d-flex justify-center pa-4">
        <v-icon color="primary" size="32" aria-hidden="true">mdi-school</v-icon>
      </div>
    </div>

    <v-divider role="separator" />

    <!-- Navigation Items -->
    <v-list nav class="py-2" role="menu" aria-label="Main navigation">
      <v-list-item
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.to"
        rounded="lg"
        class="mx-2 my-1"
        color="primary"
        role="menuitem"
        :aria-label="item.title"
      >
        <template v-if="item.badge" #append>
          <v-badge
            v-if="!rail || mobile"
            :content="item.badge"
            color="error"
            inline
            :aria-label="`${item.badge} unread items`"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="my-2" role="separator" />

    <!-- Admin Section (if user is admin) -->
    <v-list v-if="isAdmin" nav class="py-2" role="menu" aria-label="Admin navigation">
      <v-list-subheader v-if="!rail || mobile">Admin</v-list-subheader>
      <v-list-item
        v-for="item in adminItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.to"
        rounded="lg"
        class="mx-2 my-1"
        color="primary"
        role="menuitem"
        :aria-label="item.title"
      />
    </v-list>

    <!-- Bottom Actions -->
    <template #append>
      <v-divider role="separator" />
      <div class="pa-2">
        <!-- Theme Toggle -->
        <v-list-item
          :prepend-icon="themeIcon"
          :title="rail && !mobile ? '' : 'Toggle Theme'"
          rounded="lg"
          class="mx-2 my-1"
          @click="toggleTheme"
          :aria-label="theme.global.name.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          role="button"
        >
          <v-tooltip
            v-if="rail && !mobile"
            activator="parent"
            location="end"
          >
            Toggle Theme
          </v-tooltip>
        </v-list-item>

        <!-- Rail Toggle (Desktop Only) -->
        <v-list-item
          v-if="!mobile"
          :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          :title="rail ? '' : 'Collapse'"
          rounded="lg"
          class="mx-2 my-1"
          @click="rail = !rail"
          :aria-label="rail ? 'Expand sidebar' : 'Collapse sidebar'"
          role="button"
        >
          <v-tooltip
            v-if="rail"
            activator="parent"
            location="end"
          >
            Expand Sidebar
          </v-tooltip>
        </v-list-item>

        <!-- User Profile -->
        <v-list-item
          v-if="user"
          :to="'/profile'"
          :prepend-avatar="userAvatar"
          :title="rail && !mobile ? '' : authStore.displayName"
          :subtitle="rail && !mobile ? '' : user.email"
          rounded="lg"
          class="mx-2 my-1"
          :aria-label="`Go to ${authStore.displayName}'s profile`"
        >
          <v-tooltip
            v-if="rail && !mobile"
            activator="parent"
            location="end"
          >
            {{ authStore.displayName }}
          </v-tooltip>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import { useAuthStore } from '~/stores/auth'

// Composables
const theme = useTheme()
const { mobile } = useDisplay()
const route = useRoute()
const authStore = useAuthStore()

// State
const drawer = ref(true)
const rail = ref(false)
const drawerElement = ref<HTMLElement | null>(null)

// Computed
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

const userAvatar = computed(() => {
  const userName = authStore.displayName
  // Generate avatar from username using ui-avatars service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7C3AED&color=fff&bold=true`
})

const themeIcon = computed(() => {
  return theme.global.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'
})

// Navigation items
const navigationItems = computed(() => [
  {
    title: 'Home',
    icon: 'mdi-home',
    to: '/',
  },
  {
    title: 'Subjects',
    icon: 'mdi-book-open-variant',
    to: '/subjects',
  },
  {
    title: 'Forums',
    icon: 'mdi-forum',
    to: '/forums',
    badge: null, // Could be set to unread count
  },
  {
    title: 'Profile',
    icon: 'mdi-account',
    to: '/profile',
  },
])

const adminItems = computed(() => [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/admin',
  },
  {
    title: 'Subjects',
    icon: 'mdi-book-multiple',
    to: '/admin/subjects',
  },
  {
    title: 'Chapters',
    icon: 'mdi-book-open-page-variant',
    to: '/admin/chapters',
  },
  {
    title: 'Forums',
    icon: 'mdi-forum-outline',
    to: '/admin/forums',
  },
])

// Methods
const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'
}

// Watch for mobile changes to reset drawer state
watch(mobile, (isMobile) => {
  if (isMobile) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
})

// Close drawer on route change (mobile only)
watch(() => route.path, () => {
  if (mobile.value) {
    drawer.value = false
  }
})

// Expose drawer control for parent components
defineExpose({
  drawer,
  toggleDrawer: () => {
    drawer.value = !drawer.value
  }
})
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

.app-sidebar {
  border-right: 1px solid rgb(var(--v-theme-outline));
  
  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
    // Hardware acceleration for smooth scrolling
    will-change: scroll-position;
    -webkit-overflow-scrolling: touch;
  }
  
  // Mobile optimizations
  @include mobile {
    // Smooth slide-in animation with hardware acceleration
    transition: transform $transition-slow cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    
    // Add touch-friendly overlay with enhanced shadow
    &.v-navigation-drawer--temporary {
      box-shadow: $shadow-2xl;
      
      .v-theme--dark & {
        box-shadow: $shadow-dark-2xl;
      }
    }
    
    // Ensure proper z-index for mobile overlay
    z-index: $z-modal;
    
    // Optimize rendering performance
    contain: layout style paint;
  }
}

.sidebar-header {
  transition: all $transition-base;
  
  // Touch-friendly header on mobile
  @include mobile {
    min-height: $touch-target-large;
    padding: $touch-spacing-md !important;
    
    // Add subtle touch feedback
    &:active {
      opacity: 0.9;
    }
  }
}

// Active route highlighting with smooth transition
:deep(.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary), 0.12);
  transition: background-color $transition-base;
  
  .v-list-item__prepend > .v-icon {
    color: rgb(var(--v-theme-primary));
    transition: color $transition-base;
  }
  
  .v-list-item-title {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    transition: color $transition-base;
  }
}

// Hover effects (desktop only to avoid sticky hover on mobile)
@include desktop {
  :deep(.v-list-item:not(.v-list-item--active):hover) {
    background-color: rgb(var(--v-theme-on-surface), 0.04);
    transition: background-color $transition-fast;
  }
}

// Enhanced touch feedback for mobile
@include mobile {
  :deep(.v-list-item) {
    // Ensure adequate touch targets
    min-height: $touch-target-comfortable;
    padding-top: $touch-spacing-sm;
    padding-bottom: $touch-spacing-sm;
    
    // Smooth transitions for all interactions
    transition: all $transition-fast;
    
    // Enhanced active/pressed state for immediate touch feedback
    &:active {
      background-color: rgb(var(--v-theme-primary), 0.16);
      transform: scale(0.98);
      transition: all 100ms ease-out;
    }
    
    // Ripple effect enhancement
    :deep(.v-ripple__container) {
      opacity: 0.2;
    }
    
    // Increase touch area with padding
    .v-list-item__prepend {
      margin-right: $touch-spacing-md;
    }
    
    // Smooth icon transitions
    .v-icon {
      transition: transform $transition-fast;
    }
    
    &:active .v-icon {
      transform: scale(0.95);
    }
  }
  
  // Larger icons on mobile for better visibility
  :deep(.v-icon) {
    font-size: 24px !important;
  }
  
  // Comfortable spacing between items
  :deep(.v-list) {
    padding: $touch-spacing-sm;
    
    .v-list-item {
      margin-bottom: $touch-spacing-xs;
      border-radius: $radius-lg;
    }
  }
  
  // Optimize list rendering
  :deep(.v-list) {
    contain: layout style;
  }
}

// Rail mode adjustments
:deep(.v-navigation-drawer--rail) {
  .v-list-item {
    justify-content: center;
  }
}

// Smooth transitions with hardware acceleration
.v-navigation-drawer {
  transition: width $transition-base cubic-bezier(0.4, 0, 0.2, 1), 
              transform $transition-slow cubic-bezier(0.4, 0, 0.2, 1);
  
  // Hardware acceleration for smooth mobile animations
  @include mobile {
    will-change: transform;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    
    // Optimize paint performance
    contain: layout style paint;
  }
}

// Enhanced scrim/overlay styling for mobile
:deep(.v-overlay__scrim) {
  @include mobile {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    transition: opacity $transition-slow cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity;
  }
}

// Ensure proper stacking context
:deep(.v-overlay) {
  @include mobile {
    z-index: $z-modal-backdrop;
  }
}

// Optimize drawer animation performance
:deep(.v-navigation-drawer__content) {
  @include mobile {
    // Prevent layout thrashing during animations
    contain: layout style paint;
    
    // Smooth scrolling
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}
</style>
