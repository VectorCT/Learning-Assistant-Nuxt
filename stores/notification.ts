import { defineStore } from 'pinia'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

interface NotificationState {
  notifications: Notification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: []
  }),
  
  actions: {
    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', timeout = 5000) {
      const id = Date.now().toString()
      const notification: Notification = { id, message, type, timeout }
      
      this.notifications.push(notification)
      
      if (timeout > 0) {
        setTimeout(() => {
          this.remove(id)
        }, timeout)
      }
      
      return id
    },
    
    showSuccess(message: string, timeout = 5000) {
      return this.show(message, 'success', timeout)
    },
    
    showError(message: string, timeout = 7000) {
      return this.show(message, 'error', timeout)
    },
    
    showWarning(message: string, timeout = 5000) {
      return this.show(message, 'warning', timeout)
    },
    
    showInfo(message: string, timeout = 5000) {
      return this.show(message, 'info', timeout)
    },
    
    remove(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },
    
    clear() {
      this.notifications = []
    }
  }
})
