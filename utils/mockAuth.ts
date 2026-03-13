// Mock authentication utilities for testing

export interface MockUser {
  id: string
  username: string
  email: string
  password: string
  roles: string[]
  createdAt: string
}

export const defaultMockUsers: MockUser[] = [
  {
    id: 'user_admin',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    roles: ['admin', 'user'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_test',
    username: 'testuser',
    email: 'test@example.com',
    password: 'test123',
    roles: ['user'],
    createdAt: new Date().toISOString()
  }
]

/**
 * Initialize mock users in localStorage
 * Call this on app initialization to seed test users
 */
export function initializeMockUsers() {
  if (!process.client) return
  
  const existingUsers = localStorage.getItem('mock_users')
  if (!existingUsers) {
    localStorage.setItem('mock_users', JSON.stringify(defaultMockUsers))
    console.log('Mock users initialized:', defaultMockUsers.map(u => ({ username: u.username, password: u.password })))
  }
}

/**
 * Reset mock users to defaults
 */
export function resetMockUsers() {
  if (!process.client) return
  
  localStorage.setItem('mock_users', JSON.stringify(defaultMockUsers))
  console.log('Mock users reset to defaults')
}

/**
 * Get all mock users (for debugging)
 */
export function getMockUsers(): MockUser[] {
  if (!process.client) return []
  
  const storedUsers = localStorage.getItem('mock_users')
  return storedUsers ? JSON.parse(storedUsers) : []
}

/**
 * Clear all mock authentication data
 */
export function clearMockAuth() {
  if (!process.client) return
  
  localStorage.removeItem('mock_users')
  localStorage.removeItem('auth_token')
  localStorage.removeItem('mock_current_user')
  console.log('Mock authentication data cleared')
}
