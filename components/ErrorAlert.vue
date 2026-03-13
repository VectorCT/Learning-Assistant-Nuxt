<template>
  <v-alert
    :type="type"
    :dismissible="dismissible"
    :class="className"
    @click:close="handleClose"
  >
    <div class="d-flex align-center justify-space-between">
      <span>{{ message }}</span>
      
      <v-btn
        v-if="retryable"
        variant="text"
        size="small"
        @click="emit('retry')"
        class="ml-4"
      >
        Retry
      </v-btn>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
interface Props {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  dismissible?: boolean
  retryable?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  dismissible: true,
  retryable: false,
  className: ''
})

const emit = defineEmits<{
  'close': []
  'retry': []
}>()

function handleClose() {
  emit('close')
}
</script>
