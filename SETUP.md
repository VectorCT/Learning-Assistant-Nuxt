# SA Learner Assistant Frontend - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Backend API server running (default: https://localhost:7191/api)
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `NUXT_PUBLIC_API_BASE_URL` to match your backend API URL

```bash
cp .env.example .env
```

Edit `.env`:
```env
NUXT_PUBLIC_API_BASE_URL=https://localhost:7191/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Troubleshooting

### Forums Page Shows Errors

If you see errors on the forums page like "ENOTFOUND" or "Cannot connect to API server":

1. **Check if the backend API is running**
   - The backend should be accessible at the URL specified in your `.env` file
   - Default: `https://localhost:7191/api`

2. **Verify the API URL**
   - Open `.env` file
   - Ensure `NUXT_PUBLIC_API_BASE_URL` points to your running backend
   - Example: `NUXT_PUBLIC_API_BASE_URL=https://localhost:7191/api`

3. **Test the API connection**
   - Open your browser and navigate to: `https://localhost:7191/api/Forums`
   - You should see a JSON response (or 401 if authentication is required)
   - If you get a connection error, the backend is not running

4. **Start the backend API**
   - Navigate to your backend project directory
   - Run the backend server (usually `dotnet run` for .NET projects)
   - Wait for the message indicating the server is listening

5. **Check CORS settings**
   - If the API is running but requests fail, check CORS configuration in the backend
   - The backend should allow requests from `http://localhost:3000`

### Network Errors

If you see "Network error" messages:

1. Check your internet connection
2. Verify firewall settings aren't blocking localhost connections
3. Try accessing the API directly in your browser
4. Check browser console for detailed error messages

### 404 Errors

If you see "Resource not found" errors:

1. Verify the API endpoints match the backend implementation
2. Check that the backend routes are correctly configured
3. Ensure the API base URL includes `/api` if required by your backend

## API Endpoints Used

The frontend expects these endpoints to be available:

- `GET /Forums` - List all forums
- `GET /Forums/{id}` - Get forum details
- `POST /Forums` - Create new forum
- `GET /Forums/{id}/comments` - Get forum comments
- `POST /Comments` - Create comment
- `GET /Subjects` - List subjects
- `GET /Chapters` - List chapters
- `GET /Questions` - List questions
- `POST /Quiz/submit` - Submit quiz

## Development Tips

1. **Enable detailed error logging**
   - Errors are logged to the browser console in development mode
   - Check the console for detailed error information

2. **Use the offline page**
   - Navigate to `/offline` to see connection troubleshooting tips
   - This page appears automatically when the PWA detects offline status

3. **Mock data for development**
   - If the backend is not available, consider adding mock data
   - Create a mock API service in `composables/useMockApi.ts`

## Support

For issues related to:
- Frontend: Check browser console and network tab
- Backend: Check backend server logs
- Connection: Verify `.env` configuration and backend status
