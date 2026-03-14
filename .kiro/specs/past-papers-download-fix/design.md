# Past Papers Download Fix - Bugfix Design

## Overview

The "Past Papers" feature card on the home page incorrectly redirects users to `/subjects` instead of a dedicated past papers page. This prevents users from accessing the past papers functionality that is available through backend API endpoints. The fix involves creating a new `/past-papers` page with subject selection and paper download capabilities, then updating the home page route from `/subjects` to `/past-papers`.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when users click the "Past Papers" feature card, they are redirected to `/subjects` instead of `/past-papers`
- **Property (P)**: The desired behavior - clicking "Past Papers" should navigate to a dedicated page where users can select subjects and download papers/memorandums
- **Preservation**: Existing navigation behavior for other feature cards and direct `/subjects` access must remain unchanged
- **PastPaper**: An object containing past exam paper data including id, year, filename, and memorandum reference
- **subjectId**: The unique identifier used to fetch past papers for a specific subject via `GET /api/PastPapers/{subjectId}`
- **fileId**: The unique identifier used to download a specific file via `GET /api/PastPapers/Download/{fileId}`

## Bug Details

### Fault Condition

The bug manifests when a user clicks the "Past Papers" feature card on the home page. The route is hardcoded to `/subjects` instead of pointing to a dedicated past papers page, preventing access to the past papers download functionality.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UserNavigationEvent
  OUTPUT: boolean
  
  RETURN input.clickTarget == "Past Papers feature card"
         AND input.currentPage == "/index"
         AND input.expectedRoute == "/past-papers"
         AND input.actualRoute == "/subjects"
END FUNCTION
```

### Examples

- User clicks "Past Papers" card → navigates to `/subjects` (subjects list) instead of `/past-papers` (past papers interface)
- User expects to see subject selection for past papers → sees general subjects page with chapters/quizzes instead
- User expects download buttons for papers and memorandums → no download functionality available
- User clicks "Interactive Quizzes" card → correctly navigates to `/subjects` (unchanged behavior)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Clicking "Interactive Quizzes" feature card must continue to navigate to `/subjects`
- Clicking "Study Materials" feature card must continue to navigate to `/subjects`
- Clicking "Video Tutorials" feature card must continue to navigate to `/subjects`
- Clicking "Community Forums" feature card must continue to navigate to `/forums`
- Clicking "Track Progress" feature card must continue to navigate to `/profile`
- Direct navigation to `/subjects` must continue to display the subjects page with chapters and quizzes
- The subjects API endpoint (`GET /Subjects`) must continue to work for both subjects page and past papers page

**Scope:**
All inputs that do NOT involve clicking the "Past Papers" feature card should be completely unaffected by this fix. This includes:
- All other feature card navigation
- Direct URL navigation to existing pages
- Subject selection and chapter browsing on `/subjects`
- Quiz functionality and forum interactions

## Hypothesized Root Cause

Based on the bug description, the root cause is clear:

1. **Incorrect Route Configuration**: The "Past Papers" feature card in `pages/index.vue` has `route: '/subjects'` instead of `route: '/past-papers'`
   - Line in features array: `{ title: 'Past Papers', ..., route: '/subjects' }`

2. **Missing Page Implementation**: No `/past-papers` page exists in the `pages/` directory
   - Need to create `pages/past-papers/index.vue` with subject selection and download UI

3. **Missing API Integration**: The existing `useApi` composable has `getPastPapers` but no download method
   - Need to add `downloadPastPaper` method that calls `GET /api/PastPapers/Download/{fileId}`

4. **Missing Type Definitions**: No TypeScript interface for PastPaper data structure
   - Need to infer structure from API response or define based on requirements

## Correctness Properties

Property 1: Fault Condition - Past Papers Navigation

_For any_ user interaction where the "Past Papers" feature card is clicked from the home page, the fixed application SHALL navigate to `/past-papers` and display a subject selection interface that allows browsing and downloading past papers and memorandums.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation - Other Feature Card Navigation

_For any_ user interaction that involves clicking feature cards OTHER than "Past Papers" (Interactive Quizzes, Study Materials, Community Forums, Video Tutorials, Track Progress), the fixed application SHALL produce exactly the same navigation behavior as the original application, preserving all existing routes and functionality.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `pages/index.vue`

**Change**: Update Past Papers route

**Specific Changes**:
1. **Route Update**: Change the "Past Papers" feature object
   - From: `route: '/subjects'`
   - To: `route: '/past-papers'`

**File 2**: `pages/past-papers/index.vue` (NEW FILE)

**Function**: Create dedicated past papers page

**Specific Changes**:
1. **Subject Selection UI**: Display list of subjects using existing subjects store
   - Reuse subject selection pattern from subjects page
   - Filter or display all subjects for past paper selection

2. **Past Papers Display**: Show papers for selected subject
   - Fetch using `api.getPastPapers(subjectId)`
   - Display year, filename for each paper
   - Show both paper and memorandum download buttons

3. **Download Functionality**: Implement file download
   - Call `api.downloadPastPaper(fileId)` for paper download
   - Call `api.downloadPastPaper(memorandumId)` for memorandum download
   - Handle download trigger and file saving

4. **Loading and Error States**: Handle async operations
   - Show loading spinner while fetching papers
   - Display error messages if API calls fail
   - Show empty state if no papers available

5. **Responsive Design**: Ensure mobile-friendly layout
   - Use Vuetify components consistent with existing pages
   - Follow accessibility patterns from other pages

**File 3**: `composables/useApi.ts`

**Function**: Add download method

**Specific Changes**:
1. **Download Method**: Add `downloadPastPaper` function
   ```typescript
   downloadPastPaper: (fileId: string) => client.get(`/PastPapers/Download/${fileId}`, {
     responseType: 'blob'
   })
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm the root cause analysis.

**Test Plan**: Manually test the home page navigation and verify that clicking "Past Papers" redirects to `/subjects`. Inspect the code to confirm the route configuration. Run these observations on the UNFIXED code.

**Test Cases**:
1. **Past Papers Click Test**: Click "Past Papers" card on home page (will navigate to `/subjects` on unfixed code)
2. **Route Inspection Test**: Verify features array has `route: '/subjects'` for Past Papers (will show incorrect route on unfixed code)
3. **Page Existence Test**: Check if `/past-papers` page exists (will not exist on unfixed code)
4. **API Method Test**: Verify download method exists in useApi (will not exist on unfixed code)

**Expected Counterexamples**:
- Clicking "Past Papers" navigates to `/subjects` instead of `/past-papers`
- No `/past-papers` page file exists in pages directory
- No download API method in useApi composable

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handlePastPapersClick_fixed(input)
  ASSERT result.navigatesTo == "/past-papers"
  ASSERT result.displaysSubjectSelection == true
  ASSERT result.allowsDownload == true
END FOR
```

**Test Cases**:
1. **Navigation Test**: Click "Past Papers" card → verify navigation to `/past-papers`
2. **Subject Selection Test**: On `/past-papers` page → verify subjects are displayed
3. **Papers Fetch Test**: Select a subject → verify past papers are fetched and displayed
4. **Download Test**: Click download button → verify file download is triggered
5. **Memorandum Download Test**: Click memorandum button → verify memorandum download is triggered

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleFeatureCardClick_original(input) = handleFeatureCardClick_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for other feature cards and direct navigation, then write tests capturing that behavior.

**Test Cases**:
1. **Interactive Quizzes Preservation**: Click "Interactive Quizzes" → verify still navigates to `/subjects`
2. **Study Materials Preservation**: Click "Study Materials" → verify still navigates to `/subjects`
3. **Community Forums Preservation**: Click "Community Forums" → verify still navigates to `/forums`
4. **Video Tutorials Preservation**: Click "Video Tutorials" → verify still navigates to `/subjects`
5. **Track Progress Preservation**: Click "Track Progress" → verify still navigates to `/profile`
6. **Direct Subjects Access**: Navigate to `/subjects` directly → verify subjects page displays correctly
7. **Subjects API Preservation**: Call subjects API → verify it returns subjects list as before

### Unit Tests

- Test route configuration in home page features array
- Test past papers page component renders correctly
- Test subject selection triggers API call
- Test download button click triggers download API call
- Test error handling for failed API calls
- Test empty state when no papers available

### Property-Based Tests

- Generate random subject IDs and verify past papers fetch works correctly
- Generate random file IDs and verify download API is called with correct parameters
- Test that all non-"Past Papers" feature cards continue to navigate to their original routes across many test runs

### Integration Tests

- Test full flow: home page → click Past Papers → select subject → view papers → download paper
- Test full flow: home page → click Past Papers → select subject → view papers → download memorandum
- Test switching between subjects on past papers page
- Test navigation back to home and clicking other feature cards
- Test direct URL access to `/past-papers`
