<template>
  <v-card class="comment-form-card" elevation="2">
    <v-card-text class="pa-4">
      <!-- Intuitive text editor with modern styling -->
      <v-textarea
        v-model="commentText"
        :label="parentCommentId ? 'Write a reply...' : 'Share your thoughts...'"
        :placeholder="parentCommentId ? 'Type your reply here' : 'What would you like to discuss?'"
        rows="4"
        auto-grow
        :disabled="loading"
        variant="outlined"
        color="primary"
        class="comment-textarea"
        hide-details="auto"
      >
        <template #prepend-inner>
          <v-icon color="primary" size="small" class="mt-1">
            mdi-comment-edit-outline
          </v-icon>
        </template>
      </v-textarea>
      
      <!-- Character count helper -->
      <div v-if="commentText.length > 0" class="text-caption text-medium-emphasis mt-2 text-right">
        {{ commentText.length }} characters
      </div>
      
      <!-- Error alert with modern styling -->
      <v-alert 
        v-if="error" 
        type="error" 
        variant="tonal"
        class="mt-3 mb-0" 
        closable
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>
      
      <!-- Action buttons with improved spacing and styling -->
      <div class="d-flex justify-space-between align-center mt-4">
        <!-- Helpful tips on the left -->
        <div class="text-caption text-medium-emphasis d-none d-sm-flex align-center">
          <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
          <span>Be respectful and constructive</span>
        </div>
        
        <!-- Action buttons on the right -->
        <div class="d-flex gap-2 ml-auto">
          <v-btn
            v-if="parentCommentId"
            variant="text"
            color="secondary"
            @click="emit('cancel')"
            :disabled="loading"
            prepend-icon="mdi-close"
          >
            Cancel
          </v-btn>
          
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!commentText.trim() || loading"
            :loading="loading"
            @click="handleSubmit"
            :prepend-icon="parentCommentId ? 'mdi-reply' : 'mdi-send'"
            elevation="0"
          >
            {{ parentCommentId ? 'Reply' : 'Post Comment' }}
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  forumId: string
  parentCommentId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  parentCommentId: null
})

const emit = defineEmits<{
  'submit': [data: any]
  'cancel': []
}>()

const { handleApiError } = useErrorHandler()

const commentText = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (!commentText.value.trim()) return
  
  loading.value = true
  error.value = null
  
  try {
    const commentData = {
      commentText: commentText.value,
      parentCommentId: props.parentCommentId
    }
    
    emit('submit', commentData)
    
    // Reset form
    commentText.value = ''
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to post comment')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';
@import '@/assets/styles/mixins.scss';

.comment-form-card {
  @include card-base;
  border-radius: $radius-lg;
  transition: all $transition-base;
  
  // Subtle focus effect when textarea is active
  &:focus-within {
    box-shadow: $shadow-lg;
    
    .v-theme--dark & {
      box-shadow: $shadow-dark-lg;
    }
  }
}

.comment-textarea {
  :deep(.v-field) {
    border-radius: $radius-md;
    transition: all $transition-base;
    
    &:hover {
      border-color: rgb(var(--v-theme-primary));
    }
  }
  
  :deep(.v-field__input) {
    font-size: 0.9375rem;
    line-height: 1.6;
    padding-top: $spacing-sm;
  }
  
  :deep(.v-field__prepend-inner) {
    padding-top: $spacing-md;
  }
}

.gap-2 {
  gap: $spacing-sm;
}

// Responsive adjustments
@include mobile {
  .comment-form-card {
    :deep(.v-card-text) {
      padding: $spacing-md !important;
    }
  }
  
  .comment-textarea {
    :deep(.v-field__input) {
      font-size: 1rem;
    }
  }
}

// Smooth button transitions
:deep(.v-btn) {
  transition: all $transition-base;
  
  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
  
  &:not(:disabled):active {
    transform: translateY(0);
  }
}
</style>
