# Quick Start Guide

## Getting the Forums Working

### Step 1: Start Your Backend API

```bash
# Navigate to your backend project
cd path/to/backend

# Run the backend (for .NET projects)
dotnet run

# Wait for message like:
# "Now listening on: https://localhost:7191"
```

### Step 2: Configure Frontend

```bash
# In the frontend project root
# Create .env file (already created for you)
# Verify the API URL matches your backend

cat .env
# Should show:
# NUXT_PUBLIC_API_BASE_URL=https://localhost:7191/api
```

### Step 3: Install Dependencies (if not done)

```bash
npm install
```

### Step 4: Start Frontend

```bash
npm run dev
```

### Step 5: Test Forums

1. Open browser to `http://localhost:3000/forums`
2. If you see errors:
   - Check that backend is running
   - Verify API URL in `.env` matches backend
   - Click "Retry" button in error message
3. If successful, you should see the forums list (may be empty)

## Common Issues

### "Cannot connect to API server"

**Solution:**
1. Check backend is running: `curl https://localhost:7191/api/Forums`
2. If curl fails, start the backend
3. If curl works, check `.env` file has correct URL

### "Resource not found (404)"

**Solution:**
1. Verify backend has `/Forums` endpoint
2. Check API base URL includes `/api` if needed
3. Test endpoint directly: `https://localhost:7191/api/Forums`

### CORS Errors

**Solution:**
Add CORS policy in backend to allow `http://localhost:3000`

```csharp
// In your backend Startup.cs or Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

app.UseCors("AllowFrontend");
```

## Testing Checklist

- [ ] Backend is running
- [ ] Can access `https://localhost:7191/api/Forums` in browser
- [ ] `.env` file has correct API URL
- [ ] Frontend is running on `http://localhost:3000`
- [ ] No CORS errors in browser console
- [ ] Forums page loads without errors

## Need More Help?

See `SETUP.md` for detailed troubleshooting guide.
