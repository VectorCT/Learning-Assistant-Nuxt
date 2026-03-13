# Implementation Plan: SA Learner Assistant Frontend

## Overview

This implementation plan breaks down the SA Learner Assistant Frontend into discrete, actionable coding tasks. The application is a Nuxt.js + Vuetify web application that provides educational content, interactive quizzes, forums, and administrative tools for South African learners (grades 8-12). Tasks are organized to build incrementally, starting with core infrastructure, then public features, followed by admin features, and finally testing and deployment preparation.

## Tasks

- [x] 1. Project setup and core infrastructure
  - [x] 1.1 Initialize Nuxt.js project with TypeScript and Vuetify
    - Create new Nuxt 3 project with TypeScript support
    - Install and configure Vuetify 3 with Material Design Icons
    - Set up project structure (pages, components, composables, stores, middleware)
    - Configure nuxt.config.ts with runtime config and build options
    - _Requirements: All features depend on proper project setup_

  - [x] 1.2 Create API service layer with axios
    - Implement useApi composable with axios instance
    - Configure base URL, timeout, and default headers
    - Add request interceptor for authentication token injection
    - Add response interceptor for error handling and 401 redirects
    - Create API methods for all backend endpoints (Subjects, Chapters, Questions, Quiz, Forums, Auth)
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1_

  - [x] 1.3 Set up Pinia stores architecture
    - Initialize Pinia in Nuxt app
    - Create entity store pattern template with normalized state structure
    - Implement auth store with user, token, isAuthenticated state
    - Add auth store actions: login, logout, restoreSession
    - Add auth store getters: isAdmin, displayName
    - _Requirements: 6.1, 6.2, 7.1_

  - [x] 1.4 Implement authentication middleware
    - Create auth.js middleware to protect authenticated routes
    - Create guest.js middleware to redirect authenticated users from login/register
    - Add role-based access control for admin routes
    - Implement session restoration on app initialization
    - _Requirements: 6.1, 6.2, 7.1, 7.2_

  - [x] 1.5 Create error handling utilities
    - Implement useErrorHandler composable
    - Add handleApiError function with status code mapping
    - Create notification store for displaying error/success messages
    - Add error logging for development environment
    - _Requirements: All features require error handling_

- [x] 2. Entity stores and data management
  - [x] 2.1 Implement subjects store
    - Create subjectsStore with normalized entity structure
    - Add state: entities, ids, loading, error, lastFetch, byGrade
    - Implement actions: fetchAll, fetchById, fetchByGrade, setSubjects
    - Add getters: getById, getByGrade, isStale
    - Implement cache invalidation logic with 5-minute TTL
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement chapters store
    - Create chaptersStore with normalized entity structure
    - Add state: entities, ids, loading, error, lastFetch, bySubject
    - Implement actions: fetchAll, fetchById, fetchBySubject, createChapter, updateChapter, deleteChapter
    - Add getters: getById, getBySubject, isStale
    - _Requirements: 1.4, 1.5, 7.3_

  - [x] 2.3 Implement questions store
    - Create questionsStore with normalized entity structure
    - Add state: entities, ids, loading, error, lastFetch, byChapter
    - Implement actions: fetchById, fetchByChapter, createQuestion, updateQuestion, deleteQuestion, setQuestions
    - Add getters: getById, getByChapter, isStale
    - _Requirements: 2.1, 2.2, 7.4_

  - [x] 2.4 Implement forums store
    - Create forumsStore with normalized entity structure
    - Add state: entities, ids, loading, error, lastFetch
    - Implement actions: fetchAll, fetchById, createForum, updateForum, deleteForum
    - Add getters: getById, getAllSorted, isStale
    - _Requirements: 4.1, 4.2, 4.3, 7.7_

  - [x] 2.5 Implement comments store
    - Create commentsStore with normalized entity structure
    - Add state: entities, ids, loading, error, byForum
    - Implement actions: fetchByForum, createComment, updateComment, deleteComment
    - Add buildCommentTree utility function for nested comment structure
    - Add getters: getById, getByForum, getCommentTree
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 3. Quiz functionality (UI stores and components)
  - [x] 3.1 Implement quiz store (UI state)
    - Create quizStore with transient UI state
    - Add state: currentChapterId, questionIds, answers, result, currentQuestionIndex, isSubmitting, isComplete
    - Implement actions: startQuiz, setAnswer, submitQuiz, resetQuiz
    - Add getters: currentQuestions, allAnswered, progressPercentage
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.2 Write property test for quiz answer selection
    - **Property 1: Quiz Answer Selection Constraint**
    - **Validates: Requirements 2.1, 2.2**
    - Use fast-check to generate arbitrary questions with random maxSelections
    - Generate arbitrary user selection sequences
    - Assert that selected options length never exceeds maxSelections
    - Test idempotency of deselection operations

  - [x] 3.3 Create QuestionCard component
    - Implement component with props: question, modelValue, disabled, showCorrectAnswer, correctOptions
    - Render question text and point value
    - Display answer options as radio buttons (maxSelections=1) or checkboxes (maxSelections>1)
    - Enforce MaxSelections limit on checkbox selection
    - Show visual feedback for correct/incorrect answers when showCorrectAnswer is true
    - Emit update:modelValue on selection changes
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 3.4 Write unit tests for QuestionCard component
    - Test rendering of question text and options
    - Test single-select constraint enforcement
    - Test multi-select constraint enforcement
    - Test correct/incorrect answer display
    - Test disabled state behavior

  - [x] 3.5 Create QuizRunner component
    - Implement component with props: chapterId, mode (sequential/all-at-once)
    - Fetch quiz questions on mount using quiz store
    - Render QuestionCard components for all questions
    - Display progress bar showing completion percentage
    - Collect answers and validate before submission
    - Handle quiz submission with loading states
    - Emit quiz-complete and quiz-exit events
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.6 Create QuizResult component
    - Implement component with props: result (QuizResultDto)
    - Display total score and percentage
    - Show per-question results with correct/incorrect indicators
    - Display correct answers for incorrect responses
    - Show awarded points per question
    - Add "Retake Quiz" and "Back to Chapter" buttons
    - _Requirements: 2.5, 2.6_

  - [ ]* 3.7 Write integration test for complete quiz flow
    - Test quiz initialization and question loading
    - Test answer selection and validation
    - Test quiz submission and result display
    - Test score calculation accuracy

- [ ] 4. Chapter content rendering
  - [x] 4.1 Create ChapterContentRenderer component
    - Implement component with props: sections, depth, expandAll
    - Recursively render section titles with appropriate heading levels
    - Display section content with HTML sanitization
    - Render embedded images from section ImageUrl
    - Implement expand/collapse functionality for nested sections
    - Generate table of contents navigation
    - Emit section-click events
    - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 4.2 Write property test for chapter section hierarchy
    - **Property 3: Chapter Section Hierarchy Integrity**
    - **Validates: Requirements 1.5, 1.6**
    - Generate arbitrary section trees with parent references
    - Assert no circular references exist
    - Assert all parent references point to existing sections
    - Test heading level calculation with depth limits

  - [x] 4.3 Create HTML sanitization utility
    - Implement sanitizeHTML function using DOMPurify
    - Configure allowed tags: p, div, span, h1-h6, ul, ol, li, strong, em, img, a
    - Configure allowed attributes: href, src, alt, title, class
    - Remove all event handlers and script tags
    - Handle empty input gracefully
    - _Requirements: 1.5, 4.2, 4.3_

  - [ ]* 4.4 Write property test for HTML sanitization
    - **Property 4: HTML Sanitization Safety**
    - **Validates: Requirements 1.5, 4.2**
    - Generate arbitrary HTML strings with mixed safe/unsafe content
    - Assert output contains no script tags or event handlers
    - Assert safe tags are preserved

- [ ] 5. Public pages implementation
  - [x] 5.1 Create home page (index.vue)
    - Display welcome message and platform overview
    - Show grade level selector (8-12)
    - Display featured subjects with thumbnails
    - Add navigation to subject catalog
    - Implement responsive layout with Vuetify grid
    - _Requirements: 1.1_

  - [x] 5.2 Create subjects catalog page (subjects/index.vue)
    - Fetch and display subjects by selected grade
    - Show subject cards with name, description, and image
    - Implement search/filter functionality
    - Add navigation to subject detail page
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 5.3 Create subject detail page (subjects/[id].vue)
    - Fetch subject details including chapters
    - Display subject information and textbook link
    - List all chapters with chapter numbers and titles
    - Add navigation to chapter content and quiz
    - Show past papers link if available
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 5.4 Create chapter content page (chapters/[id].vue)
    - Fetch chapter details with sections
    - Render chapter content using ChapterContentRenderer
    - Display chapter title and navigation breadcrumbs
    - Add "Practice Questions" and "Take Quiz" buttons
    - Implement print-friendly view option
    - _Requirements: 1.4, 1.5, 1.6_

  - [x] 5.5 Create quiz page (quiz/[chapterId].vue)
    - Initialize quiz using QuizRunner component
    - Display quiz progress and timer (optional)
    - Handle quiz submission and result display
    - Add navigation back to chapter
    - Implement fullscreen layout for focused experience
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.6 Create questions practice page (chapters/[id]/questions.vue)
    - Fetch questions for chapter
    - Display questions one at a time with immediate feedback
    - Show correct answer after each attempt
    - Track practice progress (questions attempted)
    - Add navigation to quiz mode
    - _Requirements: 2.1, 2.7_

- [ ] 6. Forum functionality
  - [x] 6.1 Create forums list page (forums/index.vue)
    - Fetch and display all forum threads
    - Show forum title, description, author, and created date
    - Display comment count and latest activity
    - Implement search and filter by tags
    - Add "Create New Forum" button for authenticated users
    - _Requirements: 4.1_

  - [x] 6.2 Create forum detail page (forums/[id].vue)
    - Fetch forum thread with comments
    - Display forum title and description
    - Render comment tree using CommentList component
    - Show comment form for authenticated users
    - Implement screenshot upload for comments
    - Handle nested replies with proper indentation
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 6.3 Create CommentList component
    - Implement recursive comment rendering
    - Display comment content, author, and timestamp
    - Show screenshot if attached
    - Render nested replies with indentation
    - Add "Reply" button for authenticated users
    - Display reaction counts and buttons
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 6.4 Create CommentForm component
    - Implement textarea for comment content
    - Add file input for screenshot upload
    - Validate file size (max 5MB) and type (images only)
    - Show upload progress indicator
    - Handle submission with loading states
    - Support both new comments and replies
    - _Requirements: 4.3, 4.4_

  - [ ]* 6.5 Write unit tests for comment tree building
    - Test flat array to tree conversion
    - Test nested replies structure
    - Test orphaned comment handling
    - Test sorting by date

- [ ] 7. Authentication pages
  - [x] 7.1 Create login page (login.vue)
    - Implement login form with username and password fields
    - Add form validation (required fields)
    - Handle login submission with auth store
    - Display error messages for failed login
    - Add "Register" link for new users
    - Redirect to return URL or home after successful login
    - Apply guest middleware
    - _Requirements: 6.1_

  - [x] 7.2 Create registration page (register.vue)
    - Implement registration form with username, email, password fields
    - Add password confirmation field
    - Validate password strength and matching
    - Handle registration submission
    - Display success message and redirect to login
    - Apply guest middleware
    - _Requirements: 6.1_

  - [x] 7.3 Create user profile page (profile.vue)
    - Display user information (username, email)
    - Show quiz history and scores
    - Display forum activity (posts, comments)
    - Add "Change Password" functionality
    - Implement logout button
    - Apply auth middleware
    - _Requirements: 6.2_

- [ ] 8. Admin pages and components
  - [x] 8.1 Create admin dashboard page (admin/index.vue)
    - Display overview statistics (total subjects, chapters, questions, users)
    - Show recent activity feed
    - Add quick links to management pages
    - Implement admin layout with sidebar navigation
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.1_

  - [x] 8.2 Create AdminTable component
    - Implement reusable data table with Vuetify v-data-table
    - Add props: items, headers, loading, itemsPerPage, showActions, customActions
    - Implement client-side sorting and filtering
    - Render action column with edit/delete buttons
    - Support custom action buttons per row
    - Handle loading skeleton state
    - Emit edit, delete, custom-action, page-change events
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 8.3 Create subjects management page (admin/subjects.vue)
    - Fetch and display subjects in AdminTable
    - Implement create/edit subject dialog with form
    - Add subject form fields: name, description, gradeId, yearId, textbookUrl, imageUrl
    - Handle subject deletion with confirmation
    - Validate required fields before submission
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.2_

  - [x] 8.4 Create chapters management page (admin/chapters.vue)
    - Fetch and display chapters in AdminTable
    - Implement create/edit chapter dialog with form
    - Add chapter form fields: title, subjectId, chapterNumber, sections
    - Implement section editor for nested content structure
    - Handle chapter deletion with confirmation
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.3_

  - [x] 8.5 Create QuestionEditor component
    - Implement form with props: modelValue, questionTypes, mode (create/edit)
    - Add form fields: questionText, pointValue, chapterId, questionTypeId
    - Implement question type selector (Multiple Choice vs True/False)
    - Show/hide MaxSelections field based on question type
    - Render dynamic list of option inputs with add/remove buttons
    - Validate required fields and constraints
    - Emit save and cancel events
    - _Requirements: 7.4_

  - [x] 8.6 Create questions management page (admin/questions/index.vue)
    - Fetch and display questions in AdminTable
    - Show question text, chapter, points, and type columns
    - Implement create/edit question dialog using QuestionEditor
    - Handle question deletion with confirmation
    - Add filter by chapter and question type
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.4_

  - [x] 8.7 Create answers management page (admin/questions/[id]/answers.vue)
    - Fetch and display answers for selected question
    - Show answer text, isCorrect flag, and order
    - Implement create/edit answer dialog
    - Handle answer deletion with confirmation
    - Support both multiple choice and true/false answer types
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.4_

  - [x] 8.8 Create forums moderation page (admin/forums.vue)
    - Fetch and display all forums in AdminTable
    - Show forum title, author, created date, and comment count
    - Implement edit forum dialog
    - Handle forum deletion with confirmation
    - Add ability to lock/unlock forums
    - Apply auth middleware with requiresAdmin
    - _Requirements: 7.7_

- [x] 9. Reusable UI components
  - [x] 9.1 Create LoadingSpinner component
    - Implement centered loading indicator using Vuetify v-progress-circular
    - Add props: size, color, message
    - Support overlay mode for full-page loading
    - _Requirements: All features with loading states_

  - [x] 9.2 Create ErrorAlert component
    - Implement error display using Vuetify v-alert
    - Add props: message, dismissible, type
    - Support retry action button
    - Auto-dismiss after timeout (optional)
    - _Requirements: All features with error handling_

  - [x] 9.3 Create ConfirmDialog component
    - Implement confirmation dialog using Vuetify v-dialog
    - Add props: title, message, confirmText, cancelText
    - Emit confirm and cancel events
    - Support danger mode for destructive actions
    - _Requirements: All delete operations_

  - [x] 9.4 Create Breadcrumbs component
    - Implement navigation breadcrumbs using Vuetify v-breadcrumbs
    - Generate breadcrumbs from route path
    - Add custom breadcrumb labels for dynamic routes
    - Support home icon as first item
    - _Requirements: Navigation across all pages_

- [x] 10. Checkpoint - Core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Advanced features and optimizations
  - [x] 11.1 Implement virtual scrolling for large lists
    - Add vue-virtual-scroller to question lists
    - Implement virtual scroll for forum threads
    - Configure item height and buffer size
    - Test performance with 1000+ items
    - _Requirements: Performance optimization for 2.7, 4.1_

  - [x] 11.2 Add image optimization with Nuxt Image
    - Install and configure @nuxt/image module
    - Replace img tags with nuxt-img component
    - Configure lazy loading and responsive images
    - Set up WebP format with fallbacks
    - Implement blur-up placeholder loading
    - _Requirements: Performance optimization for 1.2, 1.5_

  - [x] 11.3 Implement search functionality with debouncing
    - Create useSearch composable with debounce (300ms)
    - Add search to subjects catalog
    - Add search to forums list
    - Implement search highlighting in results
    - _Requirements: 1.3, 4.1_

  - [x] 11.4 Add offline support with PWA
    - Install and configure @nuxtjs/pwa module
    - Configure service worker for static asset caching
    - Implement runtime caching for API responses
    - Add background sync for quiz submissions
    - Create offline fallback page
    - _Requirements: Performance and reliability_

  - [ ] 11.5 Implement optimistic UI updates
    - Add optimistic updates for forum reactions
    - Implement optimistic comment posting
    - Add rollback logic for failed operations
    - Show loading indicators only for slow operations (>500ms)
    - _Requirements: 4.4, UX improvement_

- [ ] 12. Security implementations
  - [ ] 12.1 Implement CSRF protection
    - Add CSRF token to API requests
    - Configure axios interceptor for CSRF token injection
    - Validate CSRF token on state-changing operations
    - _Requirements: Security for all POST/PUT/DELETE operations_

  - [ ] 12.2 Configure Content Security Policy
    - Add CSP headers in nuxt.config.ts
    - Configure allowed sources for scripts, styles, images
    - Test CSP with browser console
    - _Requirements: Security against XSS attacks_

  - [ ] 12.3 Implement input validation with Zod
    - Create validation schemas for all forms
    - Add schema validation to question editor
    - Validate quiz submission data
    - Validate forum post and comment data
    - Display validation errors in forms
    - _Requirements: Data integrity for 2.1, 4.3, 7.4_

  - [ ] 12.4 Add rate limiting for sensitive operations
    - Implement exponential backoff for login attempts
    - Add debouncing for API requests
    - Limit quiz submission frequency
    - _Requirements: Security against abuse_

- [ ] 13. Testing setup and implementation
  - [ ] 13.1 Configure Vitest for unit testing
    - Install Vitest and @vue/test-utils
    - Configure vitest.config.ts
    - Set up test utilities and helpers
    - Add test scripts to package.json
    - _Requirements: Testing infrastructure_

  - [ ]* 13.2 Write unit tests for stores
    - Test auth store actions and getters
    - Test entity store normalization
    - Test cache invalidation logic
    - Test optimistic updates and rollback

  - [ ]* 13.3 Write unit tests for utilities
    - Test sanitizeHTML function
    - Test answer selection validation
    - Test comment tree building
    - Test date formatting functions

  - [ ]* 13.4 Configure Playwright for E2E testing
    - Install @playwright/test
    - Configure playwright.config.ts
    - Set up test fixtures and helpers
    - Add E2E test scripts to package.json

  - [ ]* 13.5 Write E2E tests for critical flows
    - Test complete quiz flow (login, take quiz, view results)
    - Test admin CRUD operations
    - Test forum interaction flow
    - Test authentication flow

- [ ] 14. Deployment preparation
  - [ ] 14.1 Configure environment variables
    - Set up .env.example with all required variables
    - Document API_BASE_URL, AUTH_SECRET, etc.
    - Configure runtime config in nuxt.config.ts
    - Add environment-specific configurations
    - _Requirements: Deployment configuration_

  - [ ] 14.2 Optimize production build
    - Enable Vuetify tree-shaking
    - Configure webpack bundle analyzer
    - Implement code splitting for admin routes
    - Add compression for static assets
    - Minimize bundle size to <200KB initial load
    - _Requirements: Performance optimization_

  - [ ] 14.3 Add error tracking and monitoring
    - Integrate error tracking service (Sentry or similar)
    - Configure error reporting for production
    - Add performance monitoring
    - Set up logging for critical operations
    - _Requirements: Production monitoring_

  - [ ] 14.4 Create deployment documentation
    - Document build and deployment process
    - Add environment setup instructions
    - Document API integration requirements
    - Create troubleshooting guide
    - _Requirements: Deployment documentation_

- [ ] 15. Final checkpoint - Production ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows the design document's architecture with normalized state management, component-based UI, and comprehensive error handling
- Admin features are separated from public features and protected with role-based access control
- Security measures are implemented throughout (authentication, authorization, input validation, XSS prevention)
