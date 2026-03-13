import { defineStore } from 'pinia'

interface Chapter {
  id: string
  title: string
  subjectId: string
  chapterNumber: number
  sections?: any[]
  questions?: any[]
}

interface ChaptersState {
  entities: Record<string, Chapter>
  ids: string[]
  loading: boolean
  error: string | null
  lastFetch: number | null
  bySubject: Record<string, string[]>
}

const CACHE_TTL = 5 * 60 * 1000

export const useChaptersStore = defineStore('chapters', {
  state: (): ChaptersState => ({
    entities: {},
    ids: [],
    loading: false,
    error: null,
    lastFetch: null,
    bySubject: {}
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getBySubject: (state) => (subjectId: string) => {
      const chapterIds = state.bySubject[subjectId] || []
      return chapterIds.map(id => state.entities[id]).filter(Boolean)
    },
    
    isStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > CACHE_TTL
    }
  },
  
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const chapters = await api.getChapters()
        
        // Map API response to expected format
        const mapped = chapters.map((c: any) => ({
          id: c.chapterId || c.id,
          title: c.chapterTitle || c.title,
          subjectId: c.subjectId,
          chapterNumber: c.chapterNumber,
          sections: c.sections,
          questions: c.questions,
          description: c.description,
          termId: c.termId
        }))
        
        this.setChapters(mapped)
        return mapped
      } catch (error: any) {
        this.error = error.message
        throw error
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
        const response = await api.getChapter(id)
        
        // Map API response to expected format
        const chapter = {
          id: response.chapterId || response.id,
          title: response.chapterTitle || response.title,
          subjectId: response.subjectId,
          chapterNumber: response.chapterNumber,
          sections: response.sections,
          questions: response.questions,
          description: response.description,
          termId: response.termId
        }
        
        this.entities[chapter.id] = chapter
        if (!this.ids.includes(chapter.id)) {
          this.ids.push(chapter.id)
        }
        this.lastFetch = Date.now()
        return chapter
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchBySubject(subjectId: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        
        // Try multiple endpoints
        let chapters
        try {
          // Try /Subjects/{id}/chapters first
          chapters = await api.getChaptersBySubject(subjectId)
        } catch (e1) {
          try {
            // Fallback to getting all chapters and filtering
            const allChapters = await api.getChapters()
            chapters = allChapters.filter((c: any) => c.subjectId === subjectId)
          } catch (e2) {
            chapters = []
          }
        }
        
        // Handle if chapters is wrapped in an array
        if (Array.isArray(chapters) && chapters.length > 0 && Array.isArray(chapters[0])) {
          chapters = chapters[0]
        }
        
        // Map API response to expected format
        const mapped = chapters.map((c: any) => ({
          id: c.chapterId || c.id,
          title: c.chapterTitle || c.title,
          subjectId: c.subjectId,
          chapterNumber: c.chapterNumber,
          sections: c.sections,
          questions: c.questions,
          description: c.description,
          termId: c.termId
        }))
        
        this.setChapters(mapped, subjectId)
        return mapped
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createChapter(data: any) {
      try {
        const api = useApi()
        const chapter = await api.createChapter(data)
        this.entities[chapter.id] = chapter
        this.ids.push(chapter.id)
        this.invalidate()
        return chapter
      } catch (error: any) {
        throw error
      }
    },
    
    async updateChapter(id: string, data: any) {
      try {
        const api = useApi()
        const chapter = await api.updateChapter(id, data)
        this.entities[id] = chapter
        this.invalidate()
        return chapter
      } catch (error: any) {
        throw error
      }
    },
    
    async deleteChapter(id: string) {
      try {
        const api = useApi()
        await api.deleteChapter(id)
        delete this.entities[id]
        this.ids = this.ids.filter(i => i !== id)
        this.invalidate()
      } catch (error: any) {
        throw error
      }
    },
    
    setChapters(chapters: Chapter[], subjectId?: string) {
      const chapterIds: string[] = []
      
      for (const chapter of chapters) {
        this.entities[chapter.id] = chapter
        chapterIds.push(chapter.id)
        
        if (!this.ids.includes(chapter.id)) {
          this.ids.push(chapter.id)
        }
      }
      
      if (subjectId) {
        this.bySubject[subjectId] = chapterIds
      }
      
      this.lastFetch = Date.now()
    },
    
    invalidate() {
      this.lastFetch = null
    }
  }
})
