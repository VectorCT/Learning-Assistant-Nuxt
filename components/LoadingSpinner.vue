<template>
  <div 
    :class="['loading-spinner', { 'overlay': overlay }]"
    role="status"
    :aria-label="ariaLabel"
  >
    <div class="spinner-content">
      <v-progress-circular
        :size="size"
        :width="width"
        :color="spinnerColor"
        indeterminate
        aria-hidden="true"
      />
      <p 
        v-if="message" 
        class="loading-message"
        :class="messageClass"
      >
        {{ message }}
      </p>
      <span class="sr-only">{{ ariaLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'

interface Props {
  size?: number
  width?: number
  color?: string
  message?: string
  overlay?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 64,
  width: 6,
  color: 'primary',
  message: '',
  overlay: false,
  ariaLabel: 'Loading content, please wait'
})

const theme = useTheme()

// Compute theme-aware color if using 'primary'
const spinnerColor = computed(() => {
  if (props.color === 'primary') {
    return theme.current.value.colors.primary
  }
  return props.color
})

// Compute message class based on theme
const messageClass = computed(() => ({
  'text-on-background': !props.overlay,
  'text-on-surface': props.overlay
}))
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(var(--v-theme-surface));
  opacity: 0.95;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.spinner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-message {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  max-width: 300px;
  line-height: 1.5;
}

/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Theme-aware animations */
@media (prefers-reduced-motion: no-preference) {
  .spinner-content {
    animation: fadeIn 0.3s ease-in;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Ensure proper contrast in both themes */
.theme--light .loading-spinner.overlay {
  background-color: rgba(248, 250, 252, 0.95);
}

.theme--dark .loading-spinner.overlay {
  background-color: rgba(15, 23, 42, 0.95);
}
</style>
