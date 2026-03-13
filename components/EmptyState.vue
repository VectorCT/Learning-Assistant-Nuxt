<template>
  <div class="empty-state" role="status" :aria-label="ariaLabel">
    <div class="empty-state-content">
      <!-- Icon or illustration -->
      <div class="empty-state-icon" :class="iconColorClass">
        <v-icon 
          :icon="icon" 
          :size="iconSize"
          aria-hidden="true"
        />
      </div>

      <!-- Title -->
      <h3 class="empty-state-title">
        {{ title }}
      </h3>

      <!-- Description -->
      <p v-if="description" class="empty-state-description">
        {{ description }}
      </p>

      <!-- Action button (optional) -->
      <div v-if="actionText" class="empty-state-action">
        <v-btn
          :color="actionColor"
          :variant="actionVariant"
          :prepend-icon="actionIcon"
          @click="handleAction"
          rounded="lg"
          size="large"
        >
          {{ actionText }}
        </v-btn>
      </div>

      <!-- Secondary action (optional) -->
      <div v-if="secondaryActionText" class="empty-state-secondary">
        <v-btn
          variant="text"
          :prepend-icon="secondaryActionIcon"
          @click="handleSecondaryAction"
          color="secondary"
        >
          {{ secondaryActionText }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  iconSize?: number | string
  iconColor?: string
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
  actionColor?: string
  actionVariant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  secondaryActionText?: string
  secondaryActionIcon?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-inbox',
  iconSize: 80,
  iconColor: 'primary',
  description: '',
  actionText: '',
  actionIcon: '',
  actionColor: 'primary',
  actionVariant: 'elevated',
  secondaryActionText: '',
  secondaryActionIcon: '',
  ariaLabel: 'No content available'
})

const emit = defineEmits<{
  action: []
  secondaryAction: []
}>()

const iconColorClass = computed(() => `text-${props.iconColor}`)

const handleAction = () => {
  emit('action')
}

const handleSecondaryAction = () => {
  emit('secondaryAction')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  min-height: 400px;
  width: 100%;
}

.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  gap: 1rem;
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: rgb(var(--v-theme-surface-variant));
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  line-height: 1.3;
}

.empty-state-description {
  font-size: 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  line-height: 1.6;
  max-width: 400px;
}

.empty-state-action {
  margin-top: 0.5rem;
}

.empty-state-secondary {
  margin-top: 0.25rem;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .empty-state {
    padding: 2rem 1rem;
    min-height: 300px;
  }

  .empty-state-icon {
    width: 100px;
    height: 100px;
  }

  .empty-state-title {
    font-size: 1.25rem;
  }

  .empty-state-description {
    font-size: 0.875rem;
  }
}

/* Animation */
@media (prefers-reduced-motion: no-preference) {
  .empty-state-content {
    animation: fadeInUp 0.5s ease-out;
  }

  .empty-state-icon {
    animation: scaleIn 0.6s ease-out 0.2s both;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 0.8;
    transform: scale(1);
  }
}

/* Theme-aware styling */
.theme--light .empty-state-icon {
  background-color: rgba(124, 58, 237, 0.08);
}

.theme--dark .empty-state-icon {
  background-color: rgba(167, 139, 250, 0.12);
}
</style>
