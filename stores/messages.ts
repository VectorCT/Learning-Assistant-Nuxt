import { defineStore } from 'pinia'

export interface Message {
  id: string
  title: string
  body: string
  type: 'info' | 'achievement' | 'reminder' | 'system'
  read: boolean
  createdAt: string
}

interface MessagesState {
  messages: Message[]
  loading: boolean
}

export const useMessagesStore = defineStore('messages', {
  state: (): MessagesState => ({
    messages: [
      {
        id: '1',
        title: 'Welcome to SA Learner!',
        body: 'Start exploring subjects, take quizzes, and track your progress.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'New Past Papers Available',
        body: '2024 past papers have been uploaded for Mathematics and Physical Sciences.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        title: 'Quiz Streak 🔥',
        body: 'You completed 3 quizzes this week. Keep it up!',
        type: 'achievement',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.messages.filter(m => !m.read).length,
    sortedMessages: (state) => [...state.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  actions: {
    markAsRead(id: string) {
      const msg = this.messages.find(m => m.id === id)
      if (msg) msg.read = true
    },

    markAllAsRead() {
      this.messages.forEach(m => m.read = true)
    },

    removeMessage(id: string) {
      this.messages = this.messages.filter(m => m.id !== id)
    }
  }
})
