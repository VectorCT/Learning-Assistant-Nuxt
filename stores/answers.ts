import { defineStore } from 'pinia'

const CACHE_TTL = 5 * 60 * 1000

export const useAnswersStore = defineStore('answers', {
  state: () => ({
    entities: {} as Record<string, any>,
    ids: [] as string[],
    loading: false,
    error: null as string | null,
    lastFetch: null as number | null,
    byQuestion: {} as Record<string, string[]>
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getByQuestion: (state) => (questionId: string) => {
      const answerIds = state.byQuestion[questionId] || []
      return answerIds.map(id => state.entities[id]).filter(Boolean)
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
        const answer = await api.getAnswer(id)
        this.entities[id] = answer
        if (!this.ids.includes(id)) {
          this.ids.push(id)
        }
        this.lastFetch = Date.now()
        return answer
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchByQuestion(questionId: string) {
      if (this.byQuestion[questionId] && !this.isStale) {
        return this.getByQuestion(questionId)
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const answers = await api.getAnswersByQuestion(questionId)
        this.setAnswers(answers, questionId)
        return answers
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createAnswer(data: any, questionType: 'multiple-choice' | 'true-false') {
      try {
        const api = useApi()
        const answer = questionType === 'multiple-choice' 
          ? await api.createMultipleChoiceAnswer(data)
          : await api.createTrueFalseAnswer(data)
        this.entities[answer.id] = answer
        this.ids.push(answer.id)
        this.invalidate()
        return answer
      } catch (error: any) {
        throw error
      }
    },
    
    async updateAnswer(id: string, data: any) {
      try {
        const api = useApi()
        const answer = await api.updateAnswer(id, data)
        this.entities[id] = answer
        this.invalidate()
        return answer
      } catch (error: any) {
        throw error
      }
    },
    
    async deleteAnswer(id: string) {
      try {
        const api = useApi()
        await api.deleteAnswer(id)
        delete this.entities[id]
        this.ids = this.ids.filter(i => i !== id)
        this.invalidate()
      } catch (error: any) {
        throw error
      }
    },
    
    setAnswers(answers: any[], questionId?: string) {
      const answerIds: string[] = []
      
      for (const answer of answers) {
        this.entities[answer.id] = answer
        answerIds.push(answer.id)
        
        if (!this.ids.includes(answer.id)) {
          this.ids.push(answer.id)
        }
      }
      
      if (questionId) {
        this.byQuestion[questionId] = answerIds
      }
      
      this.lastFetch = Date.now()
    },
    
    invalidate() {
      this.lastFetch = null
    },
    
    invalidateQuestion(questionId: string) {
      delete this.byQuestion[questionId]
      this.lastFetch = null
    }
  }
})
