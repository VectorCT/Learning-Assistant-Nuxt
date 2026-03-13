import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * Composable for debounced search functionality
 * 
 * @param items - Array of items to search through
 * @param searchFields - Array of field names to search in
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with searchQuery ref, filteredItems computed, and isSearching ref
 */
export function useSearch<T extends Record<string, any>>(
  items: Ref<T[]>,
  searchFields: string[],
  delay: number = 300
) {
  const searchQuery = ref('')
  const debouncedQuery = ref('')
  const isSearching = ref(false)
  let timeoutId: NodeJS.Timeout | null = null

  // Watch searchQuery and debounce updates to debouncedQuery
  watch(searchQuery, (newValue) => {
    isSearching.value = true
    
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // If search is empty, update immediately
    if (!newValue || newValue.trim() === '') {
      debouncedQuery.value = ''
      isSearching.value = false
      return
    }

    // Set new timeout for debounced update
    timeoutId = setTimeout(() => {
      debouncedQuery.value = newValue
      isSearching.value = false
    }, delay)
  })

  // Computed property for filtered items
  const filteredItems = computed(() => {
    if (!debouncedQuery.value || debouncedQuery.value.trim() === '') {
      return items.value
    }

    const query = debouncedQuery.value.toLowerCase()
    
    return items.value.filter((item) => {
      return searchFields.some((field) => {
        const value = getNestedValue(item, field)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  })

  /**
   * Get nested value from object using dot notation
   * e.g., 'user.name' will get item.user.name
   */
  function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Highlight search term in text
   * @param text - Text to highlight in
   * @param query - Search query to highlight
   * @returns HTML string with highlighted text
   */
  function highlightText(text: string, query?: string): string {
    if (!query || !text) return text
    
    const searchTerm = query.trim()
    if (!searchTerm) return text

    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  /**
   * Escape special regex characters
   */
  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * Reset search query
   */
  function resetSearch() {
    searchQuery.value = ''
    debouncedQuery.value = ''
    isSearching.value = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    searchQuery,
    debouncedQuery,
    filteredItems,
    isSearching,
    highlightText,
    resetSearch
  }
}
