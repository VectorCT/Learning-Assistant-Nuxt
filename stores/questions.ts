import { defineStore } from 'pinia'

/**
 * Parse options from various API formats into a flat string array.
 * Handles:
 * - ["[\"A\", \"B\", \"C\"]"]  (JSON string inside array)
 * - ["A. 1956|B. 1960|C. 1976"] (pipe-delimited inside array)
 * - "[\"A\", \"B\"]" (JSON string directly)
 * - ["A", "B", "C"] (already correct)
 */
export function parseOptions(raw: any): string[] {
  if (!raw) return []

  // If it's a string, try JSON parse or pipe-split
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {}
    if (raw.includes('|')) return raw.split('|').map((s: string) => s.trim())
    return [raw]
  }

  // If it's an array with a single string element, unwrap it
  if (Array.isArray(raw) && raw.length === 1 && typeof raw[0] === 'string') {
    const inner = raw[0]
    // Try JSON parse first
    try {
      const parsed = JSON.parse(inner)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {}
    // Try pipe-delimited
    if (inner.includes('|')) return inner.split('|').map((s: string) => s.trim())
    return [inner]
  }

  // Already a proper array
  if (Array.isArray(raw)) return raw.map(String)

  return []
}

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
        return this.getByChapter(chapterId)
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
        // Extract options from answer if nested
        const answer = question.answers?.[0] || question.answer || {}
        let options = answer.options || question.options || []
        
        options = parseOptions(options)
        
        // Generate options for TrueFalse questions
        const answerType = answer.answerType || question.answerType
        if (answerType === 'TrueFalse' && (!options || options.length === 0)) {
          options = ['True', 'False']
        }
        // Ensure options is always an array
        question.options = Array.isArray(options) ? options : []
        // Default maxSelections to 1 if not set
        if (!question.maxSelections) {
          question.maxSelections = 1
        }
        if (!question.pointValue) {
          question.pointValue = question.points || 1
        }
        if (!question.answerType) {
          const answer = question.answers?.[0] || question.answer || {}
          question.answerType = answer.answerType || 'MultipleChoice'
        }
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
