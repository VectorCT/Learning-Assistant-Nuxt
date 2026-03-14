<template>
  <v-app-bar
    color="surface"
    elevation="1"
    density="comfortable"
    class="app-header"
    role="banner"
    aria-label="Main navigation header"
  >
    <!-- Sidebar Toggle (Desktop) - Replaces mobile menu toggle -->
    <template #prepend>
      <v-btn
        icon
        @click="handleToggleSidebar"
        :aria-label="'Toggle navigation menu'"
        class="sidebar-toggle-btn"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </template>

    <!-- App Title/Logo -->
    <v-toolbar-title class="font-weight-bold d-flex align-center">
      <v-icon color="primary" size="28" class="mr-2" aria-hidden="true">mdi-school</v-icon>
      <span>SA Learner</span>
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

    <!-- Notification Bell with Message Tray -->
    <v-menu
      v-if="user"
      v-model="notifMenu"
      :close-on-content-click="false"
      location="bottom end"
      offset="8"
      max-width="380"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="text"
          class="ml-1"
          aria-label="Notifications"
        >
          <v-badge
            v-if="messagesStore.unreadCount > 0"
            :content="messagesStore.unreadCount"
            color="error"
            floating
          >
            <v-icon>mdi-bell</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell-outline</v-icon>
          <v-tooltip activator="parent" location="bottom">
            {{ messagesStore.unreadCount > 0 ? `${messagesStore.unreadCount} new notifications` : 'No new notifications' }}
          </v-tooltip>
        </v-btn>
      </template>

      <!-- Notification Tray -->
      <v-card min-width="320" max-width="380" class="notification-tray">
        <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
          <span class="text-subtitle-1 font-weight-bold">Notifications</span>
          <v-btn
            v-if="messagesStore.unreadCount > 0"
            variant="text"
            size="small"
            color="primary"
            @click="messagesStore.markAllAsRead()"
          >
            Mark all read
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-list
          v-if="messagesStore.sortedMessages.length > 0"
          class="py-0 notification-list"
          lines="three"
        >
          <template v-for="(msg, i) in messagesStore.sortedMessages" :key="msg.id">
            <v-list-item
              :class="{ 'unread-message': !msg.read }"
              class="px-4 py-2"
              @click="messagesStore.markAsRead(msg.id)"
            >
              <template #prepend>
                <v-icon
                  :color="getMessageIconColor(msg.type)"
                  size="24"
                  class="mr-3"
                >
                  {{ getMessageIcon(msg.type) }}
                </v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ msg.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption mt-1" style="white-space: normal;">
                {{ msg.body }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption mt-1" style="opacity: 0.6;">
                {{ formatTimeAgo(msg.createdAt) }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  icon
                  variant="text"
                  size="x-small"
                  @click.stop="messagesStore.removeMessage(msg.id)"
                  aria-label="Dismiss notification"
                >
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="i < messagesStore.sortedMessages.length - 1" />
          </template>
        </v-list>

        <div v-else class="pa-6 text-center">
          <v-icon size="40" color="secondary" class="mb-2">mdi-bell-check-outline</v-icon>
          <p class="text-body-2 text-medium-emphasis">You're all caught up</p>
        </div>
      </v-card>
    </v-menu>

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
import { useMessagesStore } from '~/stores/messages'

// Emits
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

// Composables
const theme = useTheme()
const { mobile } = useDisplay()
const authStore = useAuthStore()
const messagesStore = useMessagesStore()
const router = useRouter()

// State
const notifMenu = ref(false)

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

const handleToggleSidebar = () => {
  emit('toggle-sidebar')
}

const handleLogout = async () => {
  authStore.logout()
  await router.push('/login')
}

// Notification helpers
const getMessageIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'mdi-information',
    achievement: 'mdi-trophy',
    reminder: 'mdi-clock-alert',
    system: 'mdi-cog'
  }
  return icons[type] || 'mdi-bell'
}

const getMessageIconColor = (type: string) => {
  const colors: Record<string, string> = {
    info: 'info',
    achievement: 'warning',
    reminder: 'error',
    system: 'primary'
  }
  return colors[type] || 'secondary'
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-outline));
  
  :deep(.v-toolbar__content) {
    padding-left: 8px;
    padding-right: 16px;
  }
  
  .sidebar-toggle-btn {
    margin-right: 8px;
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
    .sidebar-toggle-btn {
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

// Notification tray styles
.notification-tray {
  .notification-list {
    max-height: 360px;
    overflow-y: auto;
  }

  .unread-message {
    background-color: rgb(var(--v-theme-primary), 0.06);
  }
}

</style>
