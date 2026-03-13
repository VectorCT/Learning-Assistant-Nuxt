import { defineStore } from 'pinia'

interface Subject {
  id: string
  name: string
  description: string
  gradeId: string
  yearId: string
  textbookUrl?: string
  imageUrl?: string
  chapters?: any[]
}

interface SubjectsState {
  entities: Record<string, Subject>
  ids: string[]
  loading: boolean
  error: string | null
  lastFetch: number | null
  byGrade: Record<string, string[]>
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const useSubjectsStore = defineStore('subjects', {
  state: (): SubjectsState => ({
    entities: {},
    ids: [],
    loading: false,
    error: null,
    lastFetch: null,
    byGrade: {}
  }),
  
  getters: {
    getById: (state) => (id: string) => state.entities[id],
    
    getByGrade: (state) => (gradeId: string) => {
      const subjectIds = state.byGrade[gradeId] || []
      return subjectIds.map(id => state.entities[id]).filter(Boolean)
    },
    
    isStale: (state) => {
      if (!state.lastFetch) return true
      return Date.now() - state.lastFetch > CACHE_TTL
    }
  },
  
  actions: {
    async fetchAll() {
      if (!this.isStale && this.ids.length > 0) {
        return Object.values(this.entities)
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const subjects = await api.getSubjects()
        this.setSubjects(subjects)
        return subjects
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
        let subject = await api.getSubject(id)
        
        // Handle if API returns array instead of object
        if (Array.isArray(subject)) {
          subject = subject[0]
        }
        
        this.entities[id] = subject
        if (!this.ids.includes(id)) {
          this.ids.push(id)
        }
        this.lastFetch = Date.now()
        return subject
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchByGrade(gradeId: string) {
      if (this.byGrade[gradeId] && !this.isStale) {
        return this.getByGrade(gradeId)
      }
      
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const subjects = await api.getSubjectsByGrade(gradeId)
        this.setSubjects(subjects, gradeId)
        return subjects
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    setSubjects(subjects: Subject[], gradeId?: string) {
      const subjectIds: string[] = []
      
      for (const subject of subjects) {
        this.entities[subject.id] = subject
        subjectIds.push(subject.id)
        
        if (!this.ids.includes(subject.id)) {
          this.ids.push(subject.id)
        }
      }
      
      if (gradeId) {
        this.byGrade[gradeId] = subjectIds
      }
      
      this.lastFetch = Date.now()
    },
    
    invalidate() {
      this.lastFetch = null
    }
  }
})
