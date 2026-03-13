<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbs" class="px-0" />
        
        <LoadingSpinner 
          v-if="loading" 
          message="Loading forum discussion..."
        />
        
        <v-alert v-if="error" type="error" class="mb-4" closable>
          {{ error }}
        </v-alert>
        
        <div v-if="forum && !loading">
          <!-- Main Forum Post Card with improved layout -->
          <v-card class="mb-6 forum-post-card" elevation="2">
            <v-card-text class="pa-6">
              <div class="d-flex align-start">
                <!-- User Avatar for post author -->
                <v-avatar
                  :color="getAvatarColor(forum.userId)"
                  size="56"
                  class="mr-4 flex-shrink-0"
                >
                  <span class="text-h5 font-weight-bold">
                    {{ getAvatarInitials(forum.userId) }}
                  </span>
                </v-avatar>
                
                <!-- Forum Post Content -->
                <div class="flex-grow-1">
                  <!-- Title with clear hierarchy -->
                  <h1 class="text-h4 font-weight-bold mb-3">
                    {{ forum.title }}
                  </h1>
                  
                  <!-- Description -->
                  <p class="text-body-1 mb-4" style="line-height: 1.7;">
                    {{ forum.description }}
                  </p>
                  
                  <!-- Metadata -->
                  <div class="d-flex align-center flex-wrap gap-4">
                    <div class="d-flex align-center text-body-2 text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-account</v-icon>
                      <span class="font-weight-medium">{{ forum.userId }}</span>
                    </div>
                    
                    <div class="d-flex align-center text-body-2 text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                      <span>{{ formatTimeAgo(forum.createdAt) }}</span>
                    </div>
                    
                    <div class="d-flex align-center text-body-2 text-medium-emphasis">
                      <v-icon size="small" class="mr-1">mdi-comment-outline</v-icon>
                      <span>{{ commentTree.length }} {{ commentTree.length === 1 ? 'comment' : 'comments' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Comments Section with clear visual separation -->
          <div class="comments-section">
            <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">
              <v-icon class="mr-2">mdi-comment-multiple-outline</v-icon>
              Comments
            </h2>
            
            <CommentForm
              v-if="authStore.isAuthenticated"
              :forum-id="forumId"
              @submit="handleCommentSubmit"
              class="mb-6"
            />
            
            <v-alert v-else type="info" class="mb-6" variant="tonal">
              Please <NuxtLink to="/login" class="text-primary font-weight-bold">login</NuxtLink> to post comments
            </v-alert>
            
            <CommentList
              v-if="commentTree.length > 0"
              :comments="commentTree"
              :forum-id="forumId"
              :can-moderate="authStore.isAdmin"
              @submit="handleCommentSubmit"
              @edit="handleCommentEdit"
              @delete="handleCommentDelete"
              @react="handleCommentReact"
            />
            
            <v-card v-else class="text-center py-12" elevation="0" variant="tonal">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-comment-outline</v-icon>
              <p class="text-h6 text-medium-emphasis mb-2">No comments yet</p>
              <p class="text-body-2 text-medium-emphasis">Be the first to share your thoughts!</p>
            </v-card>
          </div>
        </div>
        
        <EmptyState
          v-if="!loading && !error && !forum"
          icon="mdi-forum-outline"
          title="Forum not found"
          description="The forum you're looking for doesn't exist or has been removed"
          action-text="Browse Forums"
          action-icon="mdi-arrow-left"
          @action="$router.push('/forums')"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const forumsStore = useForumsStore()
const commentsStore = useCommentsStore()
const authStore = useAuthStore()
const { handleApiError, handleSuccess } = useErrorHandler()

const forumId = route.params.id as string
const forum = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { title: 'Home', to: '/' },
  { title: 'Forums', to: '/forums' },
  { title: forum.value?.title || 'Forum', disabled: true }
])

const commentTree = computed(() => {
  return commentsStore.getCommentTree(forumId)
})

onMounted(async () => {
  loading.value = true
  try {
    forum.value = await forumsStore.fetchById(forumId)
    if (forum.value) {
      await commentsStore.fetchByForum(forumId)
    }
  } catch (err: any) {
    error.value = handleApiError(err, 'Failed to load forum')
  } finally {
    loading.value = false
  }
})

async function handleCommentSubmit(data: any) {
  try {
    await commentsStore.createComment(forumId, data)
    handleSuccess('Comment posted successfully!')
  } catch (err: any) {
    handleApiError(err, 'Failed to post comment')
  }
}

async function handleCommentEdit(comment: any) {
  // TODO: Implement edit functionality with dialog
  console.log('Edit comment:', comment)
}

async function handleCommentDelete(comment: any) {
  if (!confirm('Are you sure you want to delete this comment?')) return
  
  try {
    await commentsStore.deleteComment(forumId, comment.id)
    handleSuccess('Comment deleted successfully!')
  } catch (err: any) {
    handleApiError(err, 'Failed to delete comment')
  }
}

async function handleCommentReact(comment: any, type: 'upvote' | 'like') {
  if (!authStore.isAuthenticated) {
    handleApiError({ message: 'Please login to react to comments' }, '')
    return
  }
  
  try {
    const userReaction = commentsStore.getUserReaction(comment.id, authStore.user?.id || '')
    
    if (userReaction) {
      // User already reacted, toggle or remove
      const newUpvote = type === 'upvote' ? !userReaction.upvote : userReaction.upvote
      const newLike = type === 'like' ? !userReaction.like : userReaction.like
      
      // If both are false, remove the reaction
      if (!newUpvote && !newLike) {
        await commentsStore.removeReaction(forumId, comment.id, userReaction.id)
      } else {
        // Update reaction (delete and create new)
        await commentsStore.removeReaction(forumId, comment.id, userReaction.id)
        await commentsStore.addReaction(forumId, comment.id, newUpvote, newLike)
      }
    } else {
      // Create new reaction
      const upvote = type === 'upvote'
      const like = type === 'like'
      await commentsStore.addReaction(forumId, comment.id, upvote, like)
    }
  } catch (err: any) {
    handleApiError(err, 'Failed to update reaction')
  }
}

// Human-readable timestamp formatting
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`
  
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

// Generate avatar initials from userId
function getAvatarInitials(userId: string): string {
  if (!userId || userId === 'unknown') return '?'
  
  // If userId is a number or UUID, use first two characters
  if (/^\d+$/.test(userId) || /^[0-9a-f-]+$/i.test(userId)) {
    return userId.substring(0, 2).toUpperCase()
  }
  
  // If userId is a name, use initials
  const parts = userId.split(/[\s_-]+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  
  return userId.substring(0, 2).toUpperCase()
}

// Generate consistent color for avatar based on userId
function getAvatarColor(userId: string): string {
  const colors = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
    'purple',
    'indigo',
    'teal',
    'cyan',
    'pink',
    'deep-purple'
  ]
  
  // Generate a hash from userId
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use hash to select a color
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script>


<style scoped>
.forum-post-card {
  border-radius: 12px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.comments-section {
  margin-top: 2rem;
}

.gap-4 {
  gap: 1rem;
}
</style>
