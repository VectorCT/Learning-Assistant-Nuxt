<template>
  <v-card
    :class="['content-card', { 'content-card--clickable': clickable }]"
    :to="to"
    :href="href"
    @click="handleClick"
    elevation="2"
  >
    <!-- Image/Icon Section -->
    <div v-if="image || icon" class="content-card__media">
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="imageAlt || title"
        :width="400"
        :height="Math.round(400 / imageAspectRatio)"
        loading="lazy"
        preset="content"
        class="content-card__image"
        :style="{ aspectRatio: imageAspectRatio }"
      />
      <div v-else-if="icon" class="content-card__icon-wrapper">
        <v-icon :icon="icon" :color="iconColor" size="48" aria-hidden="true" />
      </div>
    </div>

    <v-card-text class="content-card__content">
      <!-- Status Badge -->
      <v-chip
        v-if="status"
        :color="statusColor"
        size="small"
        class="content-card__status mb-2"
      >
        {{ status }}
      </v-chip>

      <!-- Title -->
      <h3 class="content-card__title text-h6 mb-2">
        {{ title }}
      </h3>

      <!-- Description -->
      <p v-if="description" class="content-card__description text-body-2 mb-3">
        {{ description }}
      </p>

      <!-- Progress Bar -->
      <div v-if="progress !== undefined" class="content-card__progress mb-2">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption text-medium-emphasis">Progress</span>
          <span class="text-caption font-weight-medium">{{ progress }}%</span>
        </div>
        <v-progress-linear
          :model-value="progress"
          color="primary"
          height="6"
          rounded
        />
      </div>

      <!-- Metadata Row -->
      <div v-if="hasMetadata" class="content-card__metadata d-flex align-center gap-3 text-caption text-medium-emphasis">
        <span v-if="metadata.items" class="d-flex align-center gap-1">
          <v-icon size="16">mdi-file-document-outline</v-icon>
          {{ metadata.items }}
        </span>
        <span v-if="metadata.duration" class="d-flex align-center gap-1">
          <v-icon size="16">mdi-clock-outline</v-icon>
          {{ metadata.duration }}
        </span>
        <span v-if="metadata.date" class="d-flex align-center gap-1">
          <v-icon size="16">mdi-calendar-outline</v-icon>
          {{ metadata.date }}
        </span>
        <span v-if="metadata.author" class="d-flex align-center gap-1">
          <v-icon size="16">mdi-account-outline</v-icon>
          {{ metadata.author }}
        </span>
      </div>

      <!-- Custom Slot for Additional Content -->
      <slot name="content" />
    </v-card-text>

    <!-- Actions Slot -->
    <v-card-actions v-if="$slots.actions" class="content-card__actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Metadata {
  items?: string | number
  duration?: string
  date?: string
  author?: string
}

interface Props {
  title: string
  description?: string
  image?: string
  imageAlt?: string
  imageAspectRatio?: number
  icon?: string
  iconColor?: string
  status?: string
  statusColor?: string
  progress?: number
  metadata?: Metadata
  to?: string | object
  href?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageAspectRatio: 16 / 9,
  iconColor: 'primary',
  statusColor: 'primary',
  clickable: true,
  metadata: () => ({})
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const hasMetadata = computed(() => {
  return props.metadata && Object.keys(props.metadata).length > 0
})

function handleClick(event: MouseEvent) {
  if (props.clickable && !props.to && !props.href) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      border-color: rgb(var(--v-theme-primary));

      .content-card__title {
        color: rgb(var(--v-theme-primary));
      }

      .content-card__image {
        transform: scale(1.05);
      }
    }

    &:active {
      transform: translateY(-2px);
    }
  }

  &__media {
    position: relative;
    overflow: hidden;
    background: rgb(var(--v-theme-surface-variant));
  }

  &__image {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 160px;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__status {
    align-self: flex-start;
  }

  &__title {
    font-weight: 600;
    line-height: 1.4;
    transition: color 0.2s ease;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__description {
    color: rgb(var(--v-theme-on-surface-variant));
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  &__progress {
    margin-top: auto;
  }

  &__metadata {
    flex-wrap: wrap;
    gap: 0.75rem;

    span {
      white-space: nowrap;
    }
  }

  &__actions {
    border-top: 1px solid rgb(var(--v-theme-outline));
    padding: 0.75rem 1rem;
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .content-card {
    &__icon-wrapper {
      min-height: 120px;
      padding: 1.5rem;
    }

    &__title {
      font-size: 1rem;
    }
  }
}
</style>
