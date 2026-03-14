import { describe, it, expect } from 'vitest'
import { test } from '@fast-check/vitest'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Preservation Property Tests - Other Feature Card Navigation
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * IMPORTANT: These tests observe and capture the CURRENT behavior on UNFIXED code
 * for non-buggy inputs (feature cards other than "Past Papers").
 * 
 * These tests should PASS on unfixed code, confirming the baseline behavior to preserve.
 * After the fix is implemented, these tests should still PASS, ensuring no regressions.
 */

describe('Property 2: Preservation - Other Feature Card Navigation', () => {
  
  /**
   * Helper function to extract feature route from index.vue
   */
  function getFeatureRoute(featureTitle: string): string | null {
    const indexPath = join(process.cwd(), 'pages', 'index.vue')
    const indexContent = readFileSync(indexPath, 'utf-8')
    
    // Extract the script section
    const scriptMatch = indexContent.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)
    if (!scriptMatch) return null
    
    const scriptContent = scriptMatch[1]
    
    // Find the feature with the given title and extract its route
    const featurePattern = new RegExp(
      `{\\s*title:\\s*['"]${featureTitle}['"][\\s\\S]*?route:\\s*['"]([^'"]+)['"][\\s\\S]*?}`,
      'm'
    )
    const featureMatch = scriptContent.match(featurePattern)
    
    return featureMatch ? featureMatch[1] : null
  }
  
  /**
   * Unit tests for specific feature cards
   * These capture the observed behavior on unfixed code
   */
  
  it('should navigate Interactive Quizzes card to /subjects', () => {
    const route = getFeatureRoute('Interactive Quizzes')
    expect(route).toBe('/subjects')
  })
  
  it('should navigate Study Materials card to /subjects', () => {
    const route = getFeatureRoute('Study Materials')
    expect(route).toBe('/subjects')
  })
  
  it('should navigate Community Forums card to /forums', () => {
    const route = getFeatureRoute('Community Forums')
    expect(route).toBe('/forums')
  })
  
  it('should navigate Video Tutorials card to /subjects', () => {
    const route = getFeatureRoute('Video Tutorials')
    expect(route).toBe('/subjects')
  })
  
  it('should navigate Track Progress card to /profile', () => {
    const route = getFeatureRoute('Track Progress')
    expect(route).toBe('/profile')
  })
  
  /**
   * Property-based test: All non-"Past Papers" feature cards preserve their routes
   * 
   * This test generates test cases for all feature cards except "Past Papers"
   * and verifies they maintain their expected routes.
   */
  test.prop([
    fc.constantFrom(
      'Interactive Quizzes',
      'Study Materials',
      'Community Forums',
      'Video Tutorials',
      'Track Progress'
    )
  ])('should preserve navigation routes for non-Past Papers feature cards', (featureTitle) => {
    const route = getFeatureRoute(featureTitle)
    expect(route).not.toBeNull()
    
    // Define expected routes for each feature (observed behavior on unfixed code)
    const expectedRoutes: Record<string, string> = {
      'Interactive Quizzes': '/subjects',
      'Study Materials': '/subjects',
      'Community Forums': '/forums',
      'Video Tutorials': '/subjects',
      'Track Progress': '/profile'
    }
    
    expect(route).toBe(expectedRoutes[featureTitle])
  })
  
  /**
   * Property-based test: Feature cards that route to /subjects
   * 
   * This test focuses on the subset of feature cards that navigate to /subjects
   * to ensure they continue to do so after the fix.
   */
  test.prop([
    fc.constantFrom(
      'Interactive Quizzes',
      'Study Materials',
      'Video Tutorials'
    )
  ])('should preserve /subjects route for quiz and study-related features', (featureTitle) => {
    const route = getFeatureRoute(featureTitle)
    expect(route).toBe('/subjects')
  })
  
  /**
   * Property-based test: Feature cards with unique routes
   * 
   * This test verifies that feature cards with unique routes (not /subjects)
   * maintain their specific navigation targets.
   */
  test.prop([
    fc.record({
      title: fc.constantFrom('Community Forums', 'Track Progress'),
      expectedRoute: fc.constantFrom('/forums', '/profile')
    }).filter(({ title, expectedRoute }) => {
      // Match titles with their correct routes
      return (title === 'Community Forums' && expectedRoute === '/forums') ||
             (title === 'Track Progress' && expectedRoute === '/profile')
    })
  ])('should preserve unique routes for specialized features', ({ title, expectedRoute }) => {
    const route = getFeatureRoute(title)
    expect(route).toBe(expectedRoute)
  })
  
  /**
   * Test: Subjects page file exists
   * 
   * Verifies that the /subjects page continues to exist and is accessible
   * for direct navigation (Requirement 3.2)
   */
  it('should have /subjects page file for direct navigation', () => {
    const { existsSync } = require('fs')
    const subjectsPagePath = join(process.cwd(), 'pages', 'subjects', 'index.vue')
    const pageExists = existsSync(subjectsPagePath)
    
    expect(pageExists).toBe(true)
  })
  
  /**
   * Test: Subjects API method exists
   * 
   * Verifies that the subjects API endpoint method continues to exist
   * in the useApi composable (Requirement 3.3)
   */
  it('should have getSubjects method in useApi composable', () => {
    const useApiPath = join(process.cwd(), 'composables', 'useApi.ts')
    const useApiContent = readFileSync(useApiPath, 'utf-8')
    
    // Check if getSubjects method exists
    const hasGetSubjects = useApiContent.includes('getSubjects')
    
    expect(hasGetSubjects).toBe(true)
  })
  
  /**
   * Property-based test: All feature cards have valid routes
   * 
   * This test generates test cases for ALL feature cards (including Past Papers)
   * and verifies they all have defined routes (not null or empty).
   * This ensures the features array structure is maintained.
   */
  test.prop([
    fc.constantFrom(
      'Interactive Quizzes',
      'Study Materials',
      'Community Forums',
      'Past Papers',
      'Video Tutorials',
      'Track Progress'
    )
  ])('should have a defined route for every feature card', (featureTitle) => {
    const route = getFeatureRoute(featureTitle)
    
    // Every feature should have a route defined
    expect(route).not.toBeNull()
    expect(route).toBeTruthy()
    expect(route).toMatch(/^\/[a-z-]+$/)
  })
})
