# CoCode Deployment Guide

This project is split into:

- `backend/` (Express + Socket.IO + MongoDB)
- `frontend/` (React + Vite)

Recommended hosting:

- MongoDB Atlas for database
- Render (or Railway) for backend
- Vercel (or Netlify) for frontend

## 1. Prepare Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example` as reference.

Required:

- `MONGO_URI`
- `JWT_KEY`
- `CLIENT_URLS` (comma-separated list)
- `PORT` (platform often provides this automatically)

Optional:

- `GEMINI_API_KEY`

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cocode?retryWrites=true&w=majority
PORT=3000
JWT_KEY=replace_with_a_long_random_secret_value
CLIENT_URLS=https://your-frontend-domain.vercel.app,http://localhost:5173
GEMINI_API_KEY=optional_if_using_gemini_features
```

### Frontend (`frontend/.env`)

Use `frontend/.env.example` as reference.

Required:

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

Example:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

## 2. Deploy MongoDB Atlas

1. Create an Atlas cluster.
2. Create database user (username/password).
3. In Network Access, allow your backend host IP (or `0.0.0.0/0` temporarily).
4. Copy connection string and set it as `MONGO_URI` in backend service.

## 3. Deploy Backend (Render)

1. Create a new Web Service from your repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add backend environment variables from section 1.
6. Deploy and verify `GET /health` returns `{ "ok": true }`.

Notes:

- Backend CORS and Socket.IO origins are read from `CLIENT_URLS`/`CLIENT_URL`.
- Update `CLIENT_URLS` whenever frontend domain changes.

## 4. Deploy Frontend (Vercel)

1. Import repository in Vercel.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add frontend environment variables from section 1.
6. Deploy.

SPA routing:

- Because React Router uses browser history, configure rewrite/fallback to `index.html` if your platform does not do this automatically.

## 5. Connect Frontend and Backend

1. Set frontend env:
   - `VITE_API_BASE_URL=https://<backend-domain>`
   - `VITE_SOCKET_URL=https://<backend-domain>`
2. Set backend env:
   - `CLIENT_URLS=https://<frontend-domain>`
3. Redeploy both services after env updates.

## 6. Post-Deploy Verification

Open frontend and test:

1. Signup/Login
2. Create room
3. Join room from another browser/device
4. Live code sync
5. Team chat messages and typing indicator
6. Run Code output endpoint

## 7. Runtime Dependencies for Code Execution

`/code/execute` can invoke system binaries for Python/C/C++.
Your backend host must include:

- Python
- GCC
- G++

If your host lacks these binaries, use Docker-based deployment for backend.

## 8. Security Recommendations

Before public production, add:

- Rate limiting on auth/chat/execute endpoints
- Request body size limits
- Better sandboxing for code execution
- Authentication checks around code execution
- Logging/monitoring and alerts
