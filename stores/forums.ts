import { defineStore } from 'pinia'

const CACHE_TTL = 5 * 60 * 1000

export const useForumsStore = defineStore('forums', {
  state: () => ({
    entities: {} as Record<string, any>,
    ids: [] as string[],
    loading: false,
    error: null as string | null,
    lastFetch: null as number | null
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getAllSorted: (state) => {
      return state.ids
        .map(id => state.entities[id])
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    
    isStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > CACHE_TTL
    }
  },
  
  actions: {
    async fetchAll() {
      if (!this.isStale && this.ids.length > 0) {
        return this.getAllSorted
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const forums = await api.getForums()
        
        if (!forums || !Array.isArray(forums)) {
          return []
        }
        
        // Map API response to expected format
        const mapped = forums.map((f: any) => ({
          id: f.id,
          title: f.topic || f.title,
          description: f.discussionQuestion || f.description,
          userId: f.userId || 'unknown',
          createdAt: f.createdAt,
          screenshot: f.screenshot,
          subjectId: f.subjectId,
          commentCount: 0, // Will be updated when comments are loaded
          comments: []
        }))
        
        this.setForums(mapped)
        return mapped
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch forums'
        return []
      } finally {
        this.loading = false
      }
    },
    
    async fetchById(id: string) {
      if (this.entities[id] && !this.isStale) {
        return this.entities[id]
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response: any = await api.getForum(id)
        
        // Map API response to expected format
        const forum = {
          id: response.id,
          title: response.topic || response.title,
          description: response.discussionQuestion || response.description,
          userId: response.userId || 'unknown',
          createdAt: response.createdAt,
          screenshot: response.screenshot,
          subjectId: response.subjectId,
          commentCount: response.commentCount || response.comments?.length || 0,
          comments: response.comments || []
        }
        
        this.entities[forum.id] = forum
        if (!this.ids.includes(forum.id)) {
          this.ids.push(forum.id)
        }
        this.lastFetch = Date.now()
        return forum
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createForum(data: any) {
      try {
        const api = useApi()
        const response: any = await api.createForum(data)
        
        // Map the response to match our format
        const forum = {
          id: response.id,
          title: response.topic || response.title || data.title,
          description: response.discussionQuestion || response.description || data.description,
          userId: response.userId || 'unknown',
          createdAt: response.createdAt || new Date().toISOString(),
          screenshot: response.screenshot || null,
          subjectId: response.subjectId || null,
          commentCount: 0,
          comments: []
        }
        
        if (forum.id) {
          this.entities[forum.id] = forum
          this.ids.push(forum.id)
        }
        
        this.invalidate()
        return forum
      } catch (error: any) {
        throw error
      }
    },
    
    async updateForum(id: string, data: any) {
      try {
        const api = useApi()
        const forum = await api.updateForum(id, data)
        this.entities[id] = forum
        this.invalidate()
        return forum
      } catch (error: any) {
        throw error
      }
    },
    
    async deleteForum(id: string) {
      try {
        const api = useApi()
        await api.deleteForum(id)
        delete this.entities[id]
        this.ids = this.ids.filter(i => i !== id)
        this.invalidate()
      } catch (error: any) {
        throw error
      }
    },
    
    setForums(forums: any[]) {
      for (const forum of forums) {
        this.entities[forum.id] = forum
        if (!this.ids.includes(forum.id)) {
          this.ids.push(forum.id)
        }
      }
      this.lastFetch = Date.now()
    },
    
    updateCommentCount(forumId: string, count: number) {
      if (this.entities[forumId]) {
        // Create a new object to trigger reactivity
        this.entities[forumId] = {
          ...this.entities[forumId],
          commentCount: count
        }
      }
    },
    
    async fetchCommentCounts(forumIds: string[]) {
      try {
        const api = useApi()
        
        // Fetch comments for each forum and update count
        for (const forumId of forumIds) {
          try {
            const comments = await api.getCommentsByForum(forumId)
            if (this.entities[forumId]) {
              this.entities[forumId].commentCount = Array.isArray(comments) ? comments.length : 0
            }
          } catch (error) {
            // Silently fail for individual forums
            console.warn(`Failed to fetch comments for forum ${forumId}`)
          }
        }
      } catch (error: any) {
        // Don't throw, just log
        console.warn('Failed to fetch comment counts:', error)
      }
    },
    
    invalidate() {
      this.lastFetch = null
    }
  }
})
