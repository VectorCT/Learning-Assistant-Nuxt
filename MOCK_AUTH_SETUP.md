# Mock Authentication Setup

This application now uses mock authentication for testing purposes. No backend API is required for login and registration.

## Test Credentials

Two default users are automatically created:

### Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Roles:** admin, user

### Regular User
- **Username:** `testuser`
- **Password:** `test123`
- **Roles:** user

## How It Works

1. **User Storage:** Users are stored in browser localStorage under the key `mock_users`
2. **Session Management:** Authentication tokens and current user data are stored in localStorage
3. **Auto-Initialization:** Default users are automatically created when the app loads
4. **Registration:** New users can register and will be added to localStorage

## Features

- ✅ Login with username/password
- ✅ User registration with validation
- ✅ Session persistence (survives page refresh)
- ✅ Logout functionality
- ✅ Role-based access (admin/user)
- ✅ Form validation and error handling

## Testing

### Login
1. Navigate to `/login`
2. Use one of the test credentials above
3. Click "Sign In"

### Registration
1. Navigate to `/register`
2. Fill in the form with:
   - Username (unique)
   - Email (valid format, unique)
   - Password (min 6 characters)
   - Confirm Password (must match)
3. Click "Create Account"
4. You'll be redirected to login page

### Admin Access
- Login with admin credentials to access admin pages
- Admin routes are protected by role checking

## Utility Functions

The `utils/mockAuth.ts` file provides helper functions:

```typescript
// Initialize default users (called automatically)
initializeMockUsers()

// Reset users to defaults
resetMockUsers()

// Get all users (for debugging)
getMockUsers()

// Clear all auth data
clearMockAuth()
```

## Browser Console Commands

You can use these in the browser console for testing:

```javascript
// View all users
JSON.parse(localStorage.getItem('mock_users'))

// View current user
JSON.parse(localStorage.getItem('mock_current_user'))

// Clear all auth data
localStorage.removeItem('mock_users')
localStorage.removeItem('auth_token')
localStorage.removeItem('mock_current_user')
```

## Switching to Real API

When ready to connect to a real backend:

1. Update `stores/auth.ts` - replace mock logic with API calls
2. Remove mock user initialization from `plugins/auth-init.ts`
3. Update `composables/useApi.ts` if needed
4. Remove `components/MockAuthInfo.vue` from login/register pages

## Notes

- Mock data is stored per browser/device
- Clearing browser data will reset all users
- Passwords are stored in plain text (mock only - never do this in production!)
- No actual security - this is for UI testing only
