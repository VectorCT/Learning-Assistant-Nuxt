import axios, { type AxiosInstance } from 'axios'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()
  
  const baseURL = config.public.apiBaseUrl as string
  
  // Create axios instance
  const client: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // Request interceptor: add auth token
  client.interceptors.request.use(
    (config) => {
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
  
  // Response interceptor: handle errors
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        authStore.logout()
        router.push('/login')
      }
      return Promise.reject(error)
    }
  )
  
  return {
    // Subjects
    getSubjects: () => client.get('/Subjects'),
    getSubject: (id: string) => client.get(`/Subjects/${id}`),
    getSubjectsByGrade: (gradeId: string) => client.get(`/Subjects/Grade?gradeId=${gradeId}`),
    getSubjectsByYear: (yearId: string) => client.get(`/Subjects/Year?yearId=${yearId}`),
    
    // Chapters
    getChapters: () => client.get('/Chapters'),
    getChapter: (id: string) => client.get(`/Chapters/${id}`),
    getChaptersBySubject: (subjectId: string) => client.get(`/Chapters/by-subject/${subjectId}`),
    createChapter: (data: any) => client.post('/Chapters', data),
    updateChapter: (id: string, data: any) => client.put(`/Chapters/${id}`, data),
    deleteChapter: (id: string) => client.delete(`/Chapters/${id}`),
    
    // Chapter Sections
    getChapterSection: (id: string) => client.get(`/ChapterSections/${id}`),
    
    // Questions
    getQuestion: (id: string) => client.get(`/Questions/${id}`),
    getQuestionsByChapter: (chapterId: string) => client.get(`/Questions/by-chapter/${chapterId}`),
    createQuestion: (data: any) => client.post('/Questions', data),
    updateQuestion: (id: string, data: any) => client.put(`/Questions/${id}`, data),
    deleteQuestion: (id: string) => client.delete(`/Questions/${id}`),
    
    // Answers
    getAnswer: (id: string) => client.get(`/Answers/${id}`),
    getAnswersByQuestion: (questionId: string) => client.get(`/Answers/by-question/${questionId}`),
    createMultipleChoiceAnswer: (data: any) => client.post('/Answers/multiple-choice', data),
    createTrueFalseAnswer: (data: any) => client.post('/Answers/true-false', data),
    updateAnswer: (id: string, data: any) => client.put(`/Answers/${id}`, data),
    deleteAnswer: (id: string) => client.delete(`/Answers/${id}`),
    
    // Quiz
    getQuizByChapter: (chapterId: string) => client.get(`/Quiz/by-chapter/${chapterId}`),
    submitQuiz: (submission: any) => client.post('/Quiz/submit', submission),
    
    // Forums
    getForums: () => client.get('/Forums'),
    getForum: (id: string) => client.get(`/Forums/${id}`),
    createForum: (data: any) => client.post('/Forums', data),
    updateForum: (id: string, data: any) => client.put(`/Forums/${id}`, data),
    deleteForum: (id: string) => client.delete(`/Forums/${id}`),
    
    // Comments
    getCommentsByForum: (forumId: string) => client.get(`/Forums/${forumId}/comments`),
    getComment: (forumId: string, commentId: string) => client.get(`/Forums/${forumId}/comments/${commentId}`),
    createComment: (forumId: string, data: any) => client.post(`/Forums/${forumId}/comments`, data),
    updateComment: (forumId: string, commentId: string, data: any) => client.put(`/Forums/${forumId}/comments/${commentId}`, data),
    deleteComment: (forumId: string, commentId: string) => client.delete(`/Forums/${forumId}/comments/${commentId}`),
    
    // Reactions
    createReaction: (forumId: string, commentId: string, data: any) => client.post(`/Forums/${forumId}/comments/${commentId}/reactions`, data),
    getUserReactions: (forumId: string, commentId: string, userId: string) => client.get(`/Forums/${forumId}/comments/${commentId}/reactions/${userId}`),
    deleteReaction: (forumId: string, commentId: string, reactionId: string) => client.delete(`/Forums/${forumId}/comments/${commentId}/reactions/${reactionId}`),
    
    // Past Papers
    getPastPapers: (subjectId: string) => client.get(`/PastPapers/${subjectId}`),
    
    // File Upload
    uploadFile: (formData: FormData) => client.post('/Upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
    // Auth
    login: (credentials: any) => client.post('/Auth/login', credentials),
    register: (userData: any) => client.post('/Auth/register', userData),
    verifyToken: (token: string) => client.get('/Auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    getCurrentUser: () => client.get('/Auth/me'),
    changePassword: (data: any) => client.post('/Auth/change-password', data),
    
    // User Profile
    getUserQuizHistory: () => client.get('/User/quiz-history'),
    getUserForumActivity: () => client.get('/User/forum-activity')
  }
}
