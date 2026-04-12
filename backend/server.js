import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import connectDB from "./config/connectToDatabase.js";
import { authRoutes } from "./routes/auth.routes.js";
import { codeRoutes } from "./routes/code.routes.js";
import { roomRoutes } from "./routes/room.routes.js";
import { initSocket } from "./socket/socketIO.js";
import { getAllowedOriginsText, isAllowedOrigin } from "./utils/corsOrigins.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

app.use(express.json());

const corsOption = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(
      `Blocked CORS origin: ${origin}. Allowed origins: ${getAllowedOriginsText()}`,
    );
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOption));
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});
app.use("/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/code", codeRoutes);

initSocket(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is Running on the PORT ${PORT}`);
});
