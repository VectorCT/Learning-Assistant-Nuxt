import { defineStore } from 'pinia'

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

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    entities: {} as Record<string, Comment>,
    ids: [] as string[],
    loading: false,
    error: null as string | null,
    byForum: {} as Record<string, string[]>
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getByForum: (state) => (forumId: string) => {
      const commentIds = state.byForum[forumId] || []
      return commentIds.map(id => state.entities[id]).filter(Boolean)
    },
    
    getCommentTree: (state) => (forumId: string) => {
      const comments = state.byForum[forumId]?.map(id => state.entities[id]).filter(Boolean) || []
      // Comments already come with nested replies from API
      return comments.filter(c => !c.parentCommentId)
    }
  },
  
  actions: {
    async fetchByForum(forumId: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const comments = await api.getCommentsByForum(forumId)
        this.setComments(comments, forumId)
        
        // Update forum's comment count
        const forumsStore = useForumsStore()
        forumsStore.updateCommentCount(forumId, comments?.length || 0)
        
        return comments
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createComment(forumId: string, data: { commentText: string, parentCommentId?: string | null }) {
      try {
        const api = useApi()
        const comment = await api.createComment(forumId, data)
        
        // Flatten the comment and its replies for storage
        this.addCommentToStore(comment)
        
        // Refresh the forum comments to get updated structure
        await this.fetchByForum(forumId)
        
        return comment
      } catch (error: any) {
        throw error
      }
    },
    
    async updateComment(forumId: string, commentId: string, data: { commentText: string }) {
      try {
        const api = useApi()
        const comment = await api.updateComment(forumId, commentId, data)
        this.entities[commentId] = comment
        return comment
      } catch (error: any) {
        throw error
      }
    },
    
    async deleteComment(forumId: string, commentId: string) {
      try {
        const api = useApi()
        await api.deleteComment(forumId, commentId)
        delete this.entities[commentId]
        this.ids = this.ids.filter(i => i !== commentId)
        
        // Refresh to update the tree structure
        await this.fetchByForum(forumId)
      } catch (error: any) {
        throw error
      }
    },
    
    async addReaction(forumId: string, commentId: string, upvote: boolean, like: boolean) {
      try {
        const api = useApi()
        const reaction = await api.createReaction(forumId, commentId, { upvote, like })
        
        // Refresh the comment to get updated counts
        await this.fetchByForum(forumId)
        
        return reaction
      } catch (error: any) {
        throw error
      }
    },
    
    async removeReaction(forumId: string, commentId: string, reactionId: string) {
      try {
        const api = useApi()
        await api.deleteReaction(forumId, commentId, reactionId)
        
        // Refresh the comment to get updated counts
        await this.fetchByForum(forumId)
      } catch (error: any) {
        throw error
      }
    },
    
    setComments(comments: Comment[], forumId?: string) {
      const commentIds: string[] = []
      
      // Flatten nested structure for storage
      const flattenComments = (commentList: Comment[]) => {
        for (const comment of commentList) {
          this.entities[comment.id] = comment
          commentIds.push(comment.id)
          
          if (!this.ids.includes(comment.id)) {
            this.ids.push(comment.id)
          }
          
          // Recursively flatten replies
          if (comment.replies && comment.replies.length > 0) {
            flattenComments(comment.replies)
          }
        }
      }
      
      flattenComments(comments)
      
      if (forumId) {
        this.byForum[forumId] = commentIds
      }
    },
    
    addCommentToStore(comment: Comment) {
      this.entities[comment.id] = comment
      
      if (!this.ids.includes(comment.id)) {
        this.ids.push(comment.id)
      }
      
      // Add to forum's comment list
      if (comment.forumId && this.byForum[comment.forumId]) {
        if (!this.byForum[comment.forumId].includes(comment.id)) {
          this.byForum[comment.forumId].push(comment.id)
        }
      }
      
      // Recursively add replies
      if (comment.replies && comment.replies.length > 0) {
        for (const reply of comment.replies) {
          this.addCommentToStore(reply)
        }
      }
    },
    
    getUserReaction(commentId: string, userId: string): UserReaction | null {
      const comment = this.entities[commentId]
      if (!comment || !comment.userReactions) return null
      
      return comment.userReactions.find(r => r.userId === userId) || null
    }
  }
})
