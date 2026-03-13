<template>
  <div class="comment-list">
    <div v-for="comment in comments" :key="comment.id" class="comment-item">
      <v-card :class="['mb-3', depth > 0 ? 'ml-8' : '', 'comment-card']" elevation="1">
        <v-card-text class="pa-4">
          <div class="d-flex align-start">
            <!-- User Avatar for comment author -->
            <v-avatar
              :color="getAvatarColor(comment.userId)"
              :size="depth > 0 ? 36 : 40"
              class="mr-3 flex-shrink-0"
            >
              <span :class="depth > 0 ? 'text-body-2' : 'text-body-1'" class="font-weight-bold">
                {{ getAvatarInitials(comment.userId) }}
              </span>
            </v-avatar>
            
            <!-- Comment Content -->
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <strong class="text-body-1">{{ comment.userName || comment.userId }}</strong>
                  <span class="text-caption text-medium-emphasis ml-2">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
                
                <v-menu v-if="canModerate || isOwner(comment)">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props" />
                  </template>
                  <v-list>
                    <v-list-item @click="emit('edit', comment)">
                      <template v-slot:prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="emit('delete', comment)">
                      <template v-slot:prepend>
                        <v-icon>mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
              
              <p class="mb-3 text-body-2" style="line-height: 1.6;">{{ comment.commentText }}</p>
              
              <div class="d-flex align-center gap-2">
                <v-btn
                  size="small"
                  variant="text"
                  :prepend-icon="hasUserUpvoted(comment) ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
                  :color="hasUserUpvoted(comment) ? 'primary' : undefined"
                  @click="handleReaction(comment, 'upvote')"
                >
                  {{ comment.upvotes || 0 }}
                </v-btn>
                
                <v-btn
                  size="small"
                  variant="text"
                  :prepend-icon="hasUserLiked(comment) ? 'mdi-heart' : 'mdi-heart-outline'"
                  :color="hasUserLiked(comment) ? 'red' : undefined"
                  @click="handleReaction(comment, 'like')"
                >
                  {{ comment.likes || 0 }}
                </v-btn>
                
                <v-btn
                  v-if="authStore.isAuthenticated"
                  size="small"
                  variant="text"
                  prepend-icon="mdi-reply"
                  @click="toggleReply(comment.id)"
                >
                  Reply
                </v-btn>
                
                <span v-if="comment.replies && comment.replies.length > 0" class="text-caption text-medium-emphasis ml-2">
                  {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'reply' : 'replies' }}
                </span>
              </div>
              
              <CommentForm
                v-if="replyingTo === comment.id"
                :forum-id="forumId"
                :parent-comment-id="comment.id"
                @submit="handleReplySubmit"
                @cancel="replyingTo = null"
                class="mt-3"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <CommentList
        v-if="comment.replies && comment.replies.length > 0"
        :comments="comment.replies"
        :forum-id="forumId"
        :depth="depth + 1"
        :can-moderate="canModerate"
        @submit="emit('submit', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @react="emit('react', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UserReaction {
  id: string
  userId: string
  upvote: boolean
  like: boolean
}

interface Comment {
  id: string
  forumId: string
  userId: string
  userName: string
  commentText: string
  parentCommentId: string | null
  replies: Comment[]
  userReactions: UserReaction[]
  upvotes: number
  likes: number
  createdAt: string
}

interface Props {
  comments: Comment[]
  forumId: string
  depth?: number
  canModerate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  canModerate: false
})

const emit = defineEmits<{
  'submit': [data: any]
  'edit': [comment: Comment]
  'delete': [comment: Comment]
  'react': [comment: Comment, type: 'upvote' | 'like']
}>()

const authStore = useAuthStore()
const replyingTo = ref<string | null>(null)

function toggleReply(commentId: string) {
  replyingTo.value = replyingTo.value === commentId ? null : commentId
}

function handleReplySubmit(data: any) {
  emit('submit', data)
  replyingTo.value = null
}

function handleReaction(comment: Comment, type: 'upvote' | 'like') {
  if (!authStore.isAuthenticated) {
    // Could show a login prompt here
    return
  }
  emit('react', comment, type)
}

function isOwner(comment: Comment) {
  return authStore.user?.id === comment.userId
}

function hasUserUpvoted(comment: Comment): boolean {
  if (!authStore.user?.id || !comment.userReactions) return false
  return comment.userReactions.some(r => r.userId === authStore.user?.id && r.upvote)
}

function hasUserLiked(comment: Comment): boolean {
  if (!authStore.user?.id || !comment.userReactions) return false
  return comment.userReactions.some(r => r.userId === authStore.user?.id && r.like)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-ZA')
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
.comment-list {
  width: 100%;
}

.comment-item {
  position: relative;
}

.comment-card {
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.comment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
