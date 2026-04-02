# Backend

Express and Socket.IO server for the application.

## Scripts

- `npm run dev` starts the server with `nodemon`.
- `npm start` runs the server with Node.js.

## Setup

1. Install dependencies with `npm install`.
2. Add the required environment variables for database and third-party services.
3. Start the server from the backend directory.

## Notes

- Keep secrets in environment variables, not in source control.
- The backend is responsible for authentication, room management, file handling, and realtime communication.
