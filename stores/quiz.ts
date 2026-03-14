import { defineStore } from 'pinia'
import { parseOptions } from './questions'

interface QuizState {
  currentChapterId: string | null
  questionIds: string[]
  answers: Record<string, string[]>
  result: any | null
  currentQuestionIndex: number
  isSubmitting: boolean
  isComplete: boolean
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    currentChapterId: null,
    questionIds: [],
    answers: {},
    result: null,
    currentQuestionIndex: 0,
    isSubmitting: false,
    isComplete: false
  }),
  
  getters: {
    currentQuestions: (state) => {
      const questionsStore = useQuestionsStore()
      return state.questionIds
        .map(id => questionsStore.getById(id))
        .filter(Boolean)
    },
    
    allAnswered: (state) => {
      return state.questionIds.every(id => 
        state.answers[id] && state.answers[id].length > 0
      )
    },
    
    progressPercentage: (state) => {
      if (state.questionIds.length === 0) return 0
      const answered = Object.keys(state.answers).filter(
        id => state.answers[id] && state.answers[id].length > 0
      ).length
      return (answered / state.questionIds.length) * 100
    }
  },
  
  actions: {
    async startQuiz(chapterId: string) {
      const api = useApi()
      
      try {
        const rawQuestions = await api.getQuizByChapter(chapterId)
        
        // Map questions to extract options from answers
        const questions = rawQuestions.map((q: any) => {
          const answer = q.answers?.[0] || q.answer || {}
          let options = answer.options || q.options || []
          
          options = parseOptions(options)
          
          // Generate options for TrueFalse
          if (answer.answerType === 'TrueFalse' && (!options || options.length === 0)) {
            options = ['True', 'False']
          }
          
          return {
            ...q,
            options: Array.isArray(options) ? options : [],
            maxSelections: q.maxSelections || 1,
            pointValue: q.pointValue || q.points || 1,
            answerType: answer.answerType || q.answerType || 'MultipleChoice'
          }
        })
        
        this.currentChapterId = chapterId
        this.questionIds = questions.map((q: any) => q.id)
        this.answers = {}
        this.result = null
        this.currentQuestionIndex = 0
        this.isComplete = false
        
        // Store questions in questions store
        const questionsStore = useQuestionsStore()
        questionsStore.setQuestions(questions, chapterId)
        
        return questions
      } catch (error) {
        throw error
      }
    },
    
    setAnswer(questionId: string, selectedOptions: string[]) {
      this.answers[questionId] = selectedOptions
    },
    
    async submitQuiz() {
      if (!this.currentChapterId) {
        throw new Error('No active quiz')
      }
      
      this.isSubmitting = true
      
      try {
        const api = useApi()
        const submission = {
          chapterId: this.currentChapterId,
          answers: this.questionIds.map(id => ({
            questionId: id,
            selectedOptions: this.answers[id] || []
          }))
        }
        
        const result = await api.submitQuiz(submission)
        this.result = result
        this.isComplete = true
        return result
      } catch (error) {
        throw error
      } finally {
        this.isSubmitting = false
      }
    },
    
    resetQuiz() {
      this.$reset()
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex < this.questionIds.length - 1) {
        this.currentQuestionIndex++
      }
    },
    
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
      }
    }
  }
})
