# SA Learner Assistant Frontend

Educational platform for South African learners (grades 8-12) built with Nuxt.js, Vuetify, and Pinia.

## Features

- Subject browsing and chapter content viewing
- Interactive quizzes with immediate feedback
- Community forums with nested comments
- Past papers access
- Admin dashboard for content management
- Role-based access control

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Project Structure

```
├── pages/          # Application pages (auto-routed)
├── components/     # Reusable Vue components
├── composables/    # Composition API utilities
├── stores/         # Pinia state management
├── middleware/     # Route middleware
├── plugins/        # Nuxt plugins
└── assets/         # Static assets
```

## Tech Stack

- **Framework**: Nuxt 3
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Icons**: Material Design Icons

## Documentation

See `.kiro/specs/sa-learner-assistant-frontend/` for detailed design and requirements documentation.
