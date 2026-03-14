import { describe, it, expect } from 'vitest'
import { test } from '@fast-check/vitest'
import * as fc from 'fast-check'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Bug Condition Exploration Test - Past Papers Navigation Bug
 * 
 * **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.5, 2.6**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test encodes the expected behavior and will validate the fix when it passes.
 * The test explores three aspects of the bug:
 * 1. Past Papers card should route to /past-papers (not /subjects)
 * 2. /past-papers page should exist
 * 3. Download API method should exist in useApi composable
 */

describe('Property 1: Fault Condition - Past Papers Navigation Bug', () => {
  
  it('should route Past Papers feature card to /past-papers instead of /subjects', () => {
    // Read the home page file
    const indexPath = join(process.cwd(), 'pages', 'index.vue')
    const indexContent = readFileSync(indexPath, 'utf-8')
    
    // Extract the features array from the script section
    const scriptMatch = indexContent.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)
    expect(scriptMatch).toBeTruthy()
    
    const scriptContent = scriptMatch![1]
    
    // Find the Past Papers feature object
    const pastPapersMatch = scriptContent.match(/{\s*title:\s*['"]Past Papers['"][\s\S]*?route:\s*['"]([^'"]+)['"][\s\S]*?}/m)
    expect(pastPapersMatch).toBeTruthy()
    
    const pastPapersRoute = pastPapersMatch![1]
    
    // EXPECTED BEHAVIOR: Past Papers should route to /past-papers
    // CURRENT BEHAVIOR (BUG): Past Papers routes to /subjects
    expect(pastPapersRoute).toBe('/past-papers')
  })
  
  it('should have a /past-papers page file', () => {
    // Check if the past-papers page exists
    const pastPapersPagePath = join(process.cwd(), 'pages', 'past-papers', 'index.vue')
    const pageExists = existsSync(pastPapersPagePath)
    
    // EXPECTED BEHAVIOR: /past-papers page should exist
    // CURRENT BEHAVIOR (BUG): Page does not exist
    expect(pageExists).toBe(true)
  })
  
  it('should have downloadPastPaper method in useApi composable', () => {
    // Read the useApi composable file
    const useApiPath = join(process.cwd(), 'composables', 'useApi.ts')
    const useApiContent = readFileSync(useApiPath, 'utf-8')
    
    // Check if downloadPastPaper method exists
    const hasDownloadMethod = useApiContent.includes('downloadPastPaper')
    
    // EXPECTED BEHAVIOR: downloadPastPaper method should exist
    // CURRENT BEHAVIOR (BUG): Method does not exist
    expect(hasDownloadMethod).toBe(true)
  })
  
  /**
   * Property-based test: Scoped to the concrete failing case
   * 
   * This property test generates variations of the bug condition to ensure
   * the fix handles the specific case correctly.
   */
  test.prop([fc.constant('Past Papers')])('should navigate to /past-papers when clicking Past Papers card', (featureTitle) => {
    // Read the home page file
    const indexPath = join(process.cwd(), 'pages', 'index.vue')
    const indexContent = readFileSync(indexPath, 'utf-8')
    
    // Extract the features array
    const scriptMatch = indexContent.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)
    expect(scriptMatch).toBeTruthy()
    
    const scriptContent = scriptMatch![1]
    
    // Find the feature with the given title
    const featurePattern = new RegExp(`{\\s*title:\\s*['"]${featureTitle}['"][\\s\\S]*?route:\\s*['"]([^'"]+)['"][\\s\\S]*?}`, 'm')
    const featureMatch = scriptContent.match(featurePattern)
    
    if (featureMatch) {
      const route = featureMatch[1]
      
      // For Past Papers specifically, it should route to /past-papers
      if (featureTitle === 'Past Papers') {
        expect(route).toBe('/past-papers')
      }
    }
  })
})
