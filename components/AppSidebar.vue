<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !mobile"
    :permanent="!mobile"
    :temporary="mobile"
    :width="260"
    :rail-width="68"
    class="app-sidebar"
    color="surface"
    role="navigation"
    aria-label="Main navigation sidebar"
  >
    <!-- Top Illustration / Brand -->
    <div class="sidebar-brand" :class="{ 'rail-mode': rail && !mobile }">
      <div class="brand-illustration">
        <v-icon size="36" color="primary">mdi-school</v-icon>
      </div>
      <transition name="fade">
        <div v-if="!rail || mobile" class="brand-text">
          <div class="brand-title">SA Learner</div>
          <div class="brand-subtitle">Your study companion</div>
        </div>
      </transition>
    </div>

    <v-divider class="mx-3 my-1" />

    <!-- Main Navigation -->
    <v-list nav class="py-1 sidebar-list" density="compact" role="menu" aria-label="Main navigation">
      <v-list-item
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.to"
        rounded="lg"
        class="sidebar-item"
        color="primary"
        role="menuitem"
        :aria-label="item.title"
        @click="handleItemClick"
      >
        <v-tooltip v-if="rail && !mobile" activator="parent" location="end">
          {{ item.title }}
        </v-tooltip>
      </v-list-item>
    </v-list>

    <v-divider class="mx-3 my-1" />

    <!-- Quick Access Section -->
    <v-list nav class="py-1 sidebar-list" density="compact" role="menu" aria-label="Quick access">
      <v-list-subheader v-if="!rail || mobile" class="section-subheader">Quick Access</v-list-subheader>
      <v-list-item
        v-for="item in quickAccessItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.to"
        rounded="lg"
        class="sidebar-item"
        color="primary"
        role="menuitem"
        :aria-label="item.title"
        @click="handleItemClick"
      >
        <v-tooltip v-if="rail && !mobile" activator="parent" location="end">
          {{ item.title }}
        </v-tooltip>
      </v-list-item>
    </v-list>

    <v-divider class="mx-3 my-1" />

    <!-- Admin Section -->
    <v-list v-if="isAdmin" nav class="py-1 sidebar-list" density="compact" role="menu" aria-label="Admin navigation">
      <v-list-subheader v-if="!rail || mobile" class="section-subheader">Admin</v-list-subheader>
      <v-list-item
        v-for="item in adminItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.to"
        rounded="lg"
        class="sidebar-item"
        color="primary"
        role="menuitem"
        :aria-label="item.title"
        @click="handleItemClick"
      >
        <v-tooltip v-if="rail && !mobile" activator="parent" location="end">
          {{ item.title }}
        </v-tooltip>
      </v-list-item>
    </v-list>

    <!-- Bottom Actions -->
    <template #append>
      <v-divider />
      <div class="pa-1 bottom-actions">
        <v-list-item
          :prepend-icon="themeIcon"
          :title="rail && !mobile ? '' : 'Toggle Theme'"
          rounded="lg"
          class="sidebar-item"
          @click="toggleTheme"
          :aria-label="theme.global.name.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          role="button"
        >
          <v-tooltip v-if="rail && !mobile" activator="parent" location="end">Toggle Theme</v-tooltip>
        </v-list-item>

        <v-list-item
          v-if="user"
          :to="'/profile'"
          :prepend-avatar="userAvatar"
          :title="rail && !mobile ? '' : authStore.displayName"
          :subtitle="rail && !mobile ? '' : user.email"
          rounded="lg"
          class="sidebar-item"
          :aria-label="`Go to ${authStore.displayName}'s profile`"
        >
          <v-tooltip v-if="rail && !mobile" activator="parent" location="end">
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

const theme = useTheme()
const { mobile } = useDisplay()
const route = useRoute()
const authStore = useAuthStore()

const drawer = ref(true)
const rail = ref(false)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)

const userAvatar = computed(() => {
  const userName = authStore.displayName
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7C3AED&color=fff&bold=true`
})

const themeIcon = computed(() => {
  return theme.global.name.value === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'
})

const navigationItems = computed(() => [
  { title: 'Home', icon: 'mdi-home', to: '/' },
  { title: 'Subjects', icon: 'mdi-book-open-variant', to: '/subjects' },
  { title: 'Quizzes', icon: 'mdi-clipboard-check', to: '/quizzes' },
  { title: 'Forums', icon: 'mdi-forum', to: '/forums' },
  { title: 'Profile', icon: 'mdi-account', to: '/profile' },
])

const quickAccessItems = computed(() => [
  { title: 'Past Papers', icon: 'mdi-file-document', to: '/past-papers' },
  { title: 'Video Tutorials', icon: 'mdi-video', to: '/videos' },
  { title: 'Learn & Play', icon: 'mdi-gamepad-variant', to: '/games' },
  { title: 'Career Guidance', icon: 'mdi-compass', to: '/careers' },
  { title: 'Leaderboard', icon: 'mdi-trophy', to: '/profile' },
])

const adminItems = computed(() => [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/admin' },
  { title: 'Subjects', icon: 'mdi-book-multiple', to: '/admin/subjects' },
  { title: 'Chapters', icon: 'mdi-book-open-page-variant', to: '/admin/chapters' },
  { title: 'Forums', icon: 'mdi-forum-outline', to: '/admin/forums' },
])

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'
}

const handleItemClick = () => {
  if (mobile.value) {
    drawer.value = false
  }
}

watch(mobile, (isMobile) => {
  if (isMobile) {
    drawer.value = false
    rail.value = false
  } else {
    drawer.value = true
  }
})

watch(() => route.path, () => {
  if (mobile.value) {
    drawer.value = false
  }
})

defineExpose({
  drawer,
  rail,
  toggleDrawer: () => {
    if (mobile.value) {
      drawer.value = !drawer.value
    } else {
      rail.value = !rail.value
    }
  }
})
</script>

<style scoped lang="scss">
@import '~/assets/styles/variables.scss';
@import '~/assets/styles/mixins.scss';

.app-sidebar {
  border-right: 1px solid rgb(var(--v-theme-outline));
  height: 100vh !important;

  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--v-theme-on-surface), 0.2) transparent;
  }
}

// Brand / Illustration
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
  transition: all 0.3s ease;

  &.rail-mode {
    justify-content: center;
    padding: 16px 8px 12px;
  }
}

.brand-illustration {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-text {
  overflow: hidden;
  white-space: nowrap;
}

.brand-title {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}

.brand-subtitle {
  font-size: 0.7rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.section-subheader {
  font-size: 0.7rem !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 16px 4px !important;
  min-height: auto !important;
  color: rgb(var(--v-theme-on-surface-variant));
}

.sidebar-list {
  flex-shrink: 0;
}

.sidebar-item {
  margin: 2px 8px !important;
  min-height: 40px !important;
  padding: 4px 12px !important;

  :deep(.v-list-item__prepend .v-icon) {
    font-size: 20px !important;
    margin-right: 12px;
  }

  :deep(.v-list-item-title) {
    font-size: 0.85rem !important;
    line-height: 1.4;
  }

  :deep(.v-list-item-subtitle) {
    font-size: 0.75rem !important;
  }
}

.bottom-actions {
  flex-shrink: 0;
}

:deep(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.12);

  .v-list-item__prepend > .v-icon {
    color: rgb(var(--v-theme-primary));
  }

  .v-list-item-title {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
  }
}

:deep(.v-navigation-drawer--rail) {
  .v-list-item {
    justify-content: center;
    padding: 8px !important;
  }

  .v-list-item__prepend {
    margin-right: 0 !important;
  }
}

@include mobile {
  .app-sidebar {
    z-index: $z-modal;
  }

  :deep(.v-list-item) {
    min-height: $touch-target-comfortable;
  }
}
</style>
