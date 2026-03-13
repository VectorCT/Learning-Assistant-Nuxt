<template>
  <v-app-bar
    color="surface"
    elevation="1"
    density="comfortable"
    class="app-header"
    role="banner"
    aria-label="Main navigation header"
  >
    <!-- Mobile Menu Toggle (only on mobile) -->
    <template v-if="mobile" #prepend>
      <v-app-bar-nav-icon 
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle navigation menu"
      />
    </template>

    <!-- App Title/Logo -->
    <v-toolbar-title class="font-weight-bold d-flex align-center">
      <v-icon color="primary" size="28" class="mr-2" aria-hidden="true">mdi-school</v-icon>
      <span v-if="!mobile">SA Learner</span>
    </v-toolbar-title>

    <v-spacer />

    <!-- Theme Toggle Button -->
    <v-btn
      :icon="themeIcon"
      variant="text"
      @click="toggleTheme"
      :aria-label="theme.global.name.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <v-icon>{{ themeIcon }}</v-icon>
      <v-tooltip activator="parent" location="bottom">
        {{ theme.global.name.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
      </v-tooltip>
    </v-btn>

    <!-- User Avatar with Dropdown Menu -->
    <v-menu
      v-if="user"
      offset-y
      :close-on-content-click="true"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="ml-2"
          variant="text"
          :aria-label="`User menu for ${authStore.displayName}`"
        >
          <v-avatar
            :image="userAvatar"
            size="36"
            class="mr-2"
            :alt="`${authStore.displayName} avatar`"
          />
          <span v-if="!mobile" class="text-body-2">
            {{ authStore.displayName }}
          </span>
          <v-icon v-if="!mobile" size="small" class="ml-1" aria-hidden="true">
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>

      <!-- Dropdown Menu -->
      <v-list class="py-2" min-width="200" role="menu" aria-label="User account menu">
        <!-- User Info Section -->
        <v-list-item class="px-4 py-3" role="none">
          <template #prepend>
            <v-avatar :image="userAvatar" size="40" :alt="`${authStore.displayName} avatar`" />
          </template>
          <v-list-item-title class="font-weight-bold">
            {{ authStore.displayName }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ user.email }}
          </v-list-item-subtitle>
        </v-list-item>

        <v-divider class="my-2" role="separator" />

        <!-- Account Options -->
        <v-list-item
          prepend-icon="mdi-account"
          title="Profile"
          to="/profile"
          rounded="lg"
          class="mx-2"
          role="menuitem"
        />

        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          to="/settings"
          rounded="lg"
          class="mx-2"
          role="menuitem"
        />

        <v-divider v-if="isAdmin" class="my-2" role="separator" />

        <!-- Admin Link (if admin) -->
        <v-list-item
          v-if="isAdmin"
          prepend-icon="mdi-shield-crown"
          title="Admin Dashboard"
          to="/admin"
          rounded="lg"
          class="mx-2"
          role="menuitem"
        />

        <v-divider class="my-2" role="separator" />

        <!-- Logout -->
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          rounded="lg"
          class="mx-2"
          role="menuitem"
          @click="handleLogout"
        />
      </v-list>
    </v-menu>

    <!-- Login Button (if not authenticated) -->
    <v-btn
      v-else
      color="primary"
      variant="flat"
      to="/login"
      class="ml-2"
      aria-label="Login to your account"
    >
      <v-icon start aria-hidden="true">mdi-login</v-icon>
      Login
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay, useTheme } from 'vuetify'
import { useAuthStore } from '~/stores/auth'

// Emits
defineEmits<{
  'toggle-sidebar': []
}>()

// Composables
const theme = useTheme()
const { mobile } = useDisplay()
const authStore = useAuthStore()
const router = useRouter()

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

// Methods
const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'
}

const handleLogout = async () => {
  authStore.logout()
  await router.push('/login')
}
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  
  :deep(.v-toolbar__content) {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  // Ensure touch targets on mobile
  @include mobile {
    // Enhanced touch targets with smooth transitions
    :deep(.v-btn) {
      min-height: $touch-target-min;
      min-width: $touch-target-min;
      transition: all $transition-fast;
      
      // Immediate touch feedback
      &:active {
        transform: scale(0.95);
        opacity: 0.9;
      }
    }
    
    // Larger touch target for menu toggle
    :deep(.v-app-bar-nav-icon) {
      min-width: $touch-target-comfortable;
      min-height: $touch-target-comfortable;
      transition: all $transition-fast;
      
      // Enhanced touch feedback for primary action
      &:active {
        transform: scale(0.92);
        background-color: rgb(var(--v-theme-primary), 0.12);
      }
      
      // Smooth icon rotation on interaction
      .v-icon {
        transition: transform $transition-fast;
      }
      
      &:active .v-icon {
        transform: rotate(90deg);
      }
    }
    
    // Optimize avatar button for touch
    :deep(.v-avatar) {
      transition: transform $transition-fast;
    }
    
    :deep(.v-btn:active .v-avatar) {
      transform: scale(0.95);
    }
  }
}

// Enhanced hover effects for menu items
:deep(.v-list-item) {
  transition: background-color $transition-fast;
  
  &:hover {
    background-color: rgb(var(--v-theme-primary), 0.08);
  }
  
  // Touch feedback on mobile
  @include mobile {
    min-height: $touch-target-comfortable;
    padding-top: 8px;
    padding-bottom: 8px;
    
    &:active {
      background-color: rgb(var(--v-theme-primary), 0.16);
      transform: scale(0.98);
      transition: all 100ms ease-out;
    }
  }
}

// Avatar button styling with smooth transitions
:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
  transition: all $transition-fast;
}

// Optimize menu dropdown for mobile
:deep(.v-menu > .v-overlay__content) {
  @include mobile {
    // Smooth menu animation
    transition: transform $transition-base cubic-bezier(0.4, 0, 0.2, 1),
                opacity $transition-base cubic-bezier(0.4, 0, 0.2, 1);
    
    // Hardware acceleration
    will-change: transform, opacity;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    
    // Enhanced shadow for better depth perception
    box-shadow: $shadow-xl;
    
    .v-theme--dark & {
      box-shadow: $shadow-dark-xl;
    }
  }
}

// Optimize list rendering in dropdown
:deep(.v-list) {
  @include mobile {
    contain: layout style;
  }
}

</style>
