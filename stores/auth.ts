import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  email: string
  roles: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),
  
  getters: {
    isAdmin: (state) => {
      return state.user?.roles?.includes('admin') || false
    },
    
    displayName: (state) => {
      return state.user?.username || 'Guest'
    }
  },
  
  actions: {
    async login(credentials: { username: string; password: string }) {
      this.loading = true
      this.error = null
      
      try {
        // MOCK: Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // MOCK: Get stored users or use default
        const storedUsers = process.client ? localStorage.getItem('mock_users') : null
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        // MOCK: Find user by username
        const user = users.find((u: any) => u.username === credentials.username)
        
        if (!user || user.password !== credentials.password) {
          throw new Error('Invalid credentials')
        }
        
        // MOCK: Create response
        const response = {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles || ['user']
          },
          token: `mock_token_${user.id}_${Date.now()}`
        }
        
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        
        // Store token in localStorage
        if (process.client) {
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('mock_current_user', JSON.stringify(response.user))
        }
        
        return response
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('mock_current_user')
      }
    },
    
    async restoreSession() {
      if (!process.client) return false
      
      const token = localStorage.getItem('auth_token')
      if (!token) return false
      
      try {
        // MOCK: Restore user from localStorage
        const storedUser = localStorage.getItem('mock_current_user')
        if (!storedUser) {
          this.logout()
          return false
        }
        
        const user = JSON.parse(storedUser)
        this.token = token
        this.user = user
        this.isAuthenticated = true
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },
    
    async register(userData: { username: string; email: string; password: string }) {
      this.loading = true
      this.error = null
      
      try {
        // MOCK: Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        if (!process.client) return
        
        // MOCK: Get stored users or initialize
        const storedUsers = localStorage.getItem('mock_users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        // MOCK: Check if username or email already exists
        if (users.some((u: any) => u.username === userData.username)) {
          throw new Error('Username already exists')
        }
        if (users.some((u: any) => u.email === userData.email)) {
          throw new Error('Email already exists')
        }
        
        // MOCK: Create new user
        const newUser = {
          id: `user_${Date.now()}`,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          roles: ['user'],
          createdAt: new Date().toISOString()
        }
        
        users.push(newUser)
        localStorage.setItem('mock_users', JSON.stringify(users))
        
        return { success: true }
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
