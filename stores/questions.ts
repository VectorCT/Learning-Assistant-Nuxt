import { defineStore } from 'pinia'

const CACHE_TTL = 5 * 60 * 1000

export const useQuestionsStore = defineStore('questions', {
  state: () => ({
    entities: {} as Record<string, any>,
    ids: [] as string[],
    loading: false,
    error: null as string | null,
    lastFetch: null as number | null,
    byChapter: {} as Record<string, string[]>
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getByChapter: (state) => (chapterId: string) => {
      const questionIds = state.byChapter[chapterId] || []
      return questionIds.map(id => state.entities[id]).filter(Boolean)
    },
    
    isStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > CACHE_TTL
    }
  },
  
  actions: {
    async fetchById(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const question = await api.getQuestion(id)
        this.entities[id] = question
        if (!this.ids.includes(id)) {
          this.ids.push(id)
        }
        this.lastFetch = Date.now()
        return question
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchByChapter(chapterId: string) {
      if (this.byChapter[chapterId] && !this.isStale) {
        return this.getByChapter(chapterId)
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const questions = await api.getQuestionsByChapter(chapterId)
        this.setQuestions(questions, chapterId)
        return questions
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createQuestion(data: any) {
      try {
        const api = useApi()
        const question = await api.createQuestion(data)
        this.entities[question.id] = question
        this.ids.push(question.id)
        this.invalidate()
        return question
      } catch (error: any) {
        throw error
      }
    },
    
    async updateQuestion(id: string, data: any) {
      try {
        const api = useApi()
        const question = await api.updateQuestion(id, data)
        this.entities[id] = question
        this.invalidate()
        return question
      } catch (error: any) {
        throw error
      }
    },
    
    async deleteQuestion(id: string) {
      try {
        const api = useApi()
        await api.deleteQuestion(id)
        delete this.entities[id]
        this.ids = this.ids.filter(i => i !== id)
        this.invalidate()
      } catch (error: any) {
        throw error
      }
    },
    
    setQuestions(questions: any[], chapterId?: string) {
      const questionIds: string[] = []
      
      for (const question of questions) {
        this.entities[question.id] = question
        questionIds.push(question.id)
        
        if (!this.ids.includes(question.id)) {
          this.ids.push(question.id)
        }
      }
      
      if (chapterId) {
        this.byChapter[chapterId] = questionIds
      }
      
      this.lastFetch = Date.now()
    },
    
    invalidate() {
      this.lastFetch = null
    },
    
    invalidateChapter(chapterId: string) {
      delete this.byChapter[chapterId]
      this.lastFetch = null
    }
  }
})
