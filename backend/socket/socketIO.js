import { Server } from "socket.io";
import { Message } from "../modules/Message.js"; // Import Message model
import RoomPresence from "../modules/RoomPresence.js";

export const initSocket = (server) => {
  const allowedOrigins = (
    process.env.CLIENT_URLS ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  // Track active files per user: { socketId: { username, roomId, activeFile } }
  const userActiveFiles = new Map();
  // Track typing users per room: { roomId: Set(username) }
  const typingUsersByRoom = new Map();
  // Track active users in each room to measure session duration without double counting multi-tab usage.
  const roomActiveUsers = new Map();
  // Cache persisted totals by room for fast live broadcasts.
  const roomPresenceCache = new Map();

  const getUserKey = (userId, username) => userId || username;

  const ensureRoomCache = async (roomId) => {
    if (roomPresenceCache.has(roomId)) {
      return roomPresenceCache.get(roomId);
    }

    const records = await RoomPresence.find({ roomId }).lean();
    const cache = new Map();
    records.forEach((record) => {
      const userId = record.userId?.toString();
      const key = getUserKey(userId, record.username);
      cache.set(key, {
        userId,
        username: record.username,
        totalTimeMs: record.totalTimeMs || 0,
      });
    });

    roomPresenceCache.set(roomId, cache);
    return cache;
  };

  const upsertPresence = async ({ roomId, userId, username }) => {
    const record = await RoomPresence.findOneAndUpdate(
      { roomId, userId },
      {
        $setOnInsert: { totalTimeMs: 0, sessionsCount: 0 },
        $set: { username, lastJoinedAt: new Date() },
      },
      { new: true, upsert: true },
    ).lean();

    const roomCache = await ensureRoomCache(roomId);
    roomCache.set(getUserKey(userId, username), {
      userId,
      username,
      totalTimeMs: record.totalTimeMs || 0,
    });
  };

  const finalizeSession = async ({
    roomId,
    userId,
    username,
    sessionStartedAt,
  }) => {
    if (!sessionStartedAt) return;

    const durationMs = Math.max(Date.now() - sessionStartedAt, 0);
    await RoomPresence.updateOne(
      { roomId, userId },
      {
        $inc: { totalTimeMs: durationMs, sessionsCount: 1 },
        $set: { username, lastLeftAt: new Date() },
      },
      { upsert: true },
    );

    const roomCache = await ensureRoomCache(roomId);
    const key = getUserKey(userId, username);
    const cached = roomCache.get(key) || { userId, username, totalTimeMs: 0 };
    roomCache.set(key, {
      userId,
      username,
      totalTimeMs: (cached.totalTimeMs || 0) + durationMs,
    });
  };

  const buildRoomActivity = async (roomId) => {
    const roomCache = await ensureRoomCache(roomId);
    const activeUsers = roomActiveUsers.get(roomId) || new Map();
    const now = Date.now();
    const activity = [];
    const seen = new Set();

    roomCache.forEach((entry, key) => {
      const active = activeUsers.get(key);
      const activeSessionMs = active
        ? Math.max(now - active.sessionStartedAt, 0)
        : 0;

      activity.push({
        userId: entry.userId,
        username: entry.username,
        totalTimeMs: (entry.totalTimeMs || 0) + activeSessionMs,
        activeSessionMs,
        isActive: Boolean(active),
      });
      seen.add(key);
    });

    activeUsers.forEach((active, key) => {
      if (seen.has(key)) return;

      const activeSessionMs = Math.max(now - active.sessionStartedAt, 0);
      activity.push({
        userId: active.userId,
        username: active.username,
        totalTimeMs: activeSessionMs,
        activeSessionMs,
        isActive: true,
      });
    });

    activity.sort((a, b) => b.totalTimeMs - a.totalTimeMs);
    return activity;
  };

  const emitRoomActivity = async (roomId) => {
    const activity = await buildRoomActivity(roomId);
    io.to(roomId).emit("roomActivityUpdate", {
      generatedAt: Date.now(),
      activity,
    });
  };

  setInterval(() => {
    const activeRoomIds = Array.from(roomActiveUsers.keys());
    activeRoomIds.forEach((roomId) => {
      emitRoomActivity(roomId).catch((error) => {
        console.error("Error broadcasting room activity:", error);
      });
    });
  }, 15000);

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("joinRoom", async (data) => {
      const { roomId, username, userId } = data;
      socket.join(roomId);
      console.log(`User ${username} (${socket.id}) joined room ${roomId}`);

      // Store user info
      userActiveFiles.set(socket.id, {
        username,
        userId,
        roomId,
        activeFile: null,
      });

      if (userId) {
        await upsertPresence({ roomId, userId, username });

        const roomUsers = roomActiveUsers.get(roomId) || new Map();
        const userKey = getUserKey(userId, username);
        const existing = roomUsers.get(userKey);

        if (existing) {
          roomUsers.set(userKey, {
            ...existing,
            connectionCount: existing.connectionCount + 1,
          });
        } else {
          roomUsers.set(userKey, {
            userId,
            username,
            sessionStartedAt: Date.now(),
            connectionCount: 1,
          });
        }

        roomActiveUsers.set(roomId, roomUsers);
        await emitRoomActivity(roomId);
      }

      // Fetch and send previous messages when a user joins
      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      socket.emit("previousMessages", messages);

      // Send current active file viewers to the new user
      const viewers = getActiveFileViewers(roomId);
      socket.emit("activeFileViewers", viewers);

      // Notify others in the room
      socket.to(roomId).emit("userJoined", { username });
    });

    socket.on("startTyping", ({ roomId, username }) => {
      if (!roomId || !username) return;
      if (!typingUsersByRoom.has(roomId)) {
        typingUsersByRoom.set(roomId, new Set());
      }

      const roomTypingUsers = typingUsersByRoom.get(roomId);
      roomTypingUsers.add(username);
      io.to(roomId).emit("typingUsersUpdate", Array.from(roomTypingUsers));
    });

    socket.on("stopTyping", ({ roomId, username }) => {
      if (!roomId || !username || !typingUsersByRoom.has(roomId)) return;

      const roomTypingUsers = typingUsersByRoom.get(roomId);
      roomTypingUsers.delete(username);

      if (roomTypingUsers.size === 0) {
        typingUsersByRoom.delete(roomId);
        io.to(roomId).emit("typingUsersUpdate", []);
        return;
      }

      io.to(roomId).emit("typingUsersUpdate", Array.from(roomTypingUsers));
    });

    socket.on("send_message", async (data) => {
      const { roomId, username, message } = data;

      // Clear typing state for sender once message is sent
      if (typingUsersByRoom.has(roomId)) {
        const roomTypingUsers = typingUsersByRoom.get(roomId);
        roomTypingUsers.delete(username);
        io.to(roomId).emit("typingUsersUpdate", Array.from(roomTypingUsers));
      }

      // Store message in database
      const newMessage = new Message({ roomId, username, message });
      await newMessage.save();

      // Emit message to all users in the room
      io.to(roomId).emit("receivedmessage", newMessage);
    });

    socket.on("codeUpdate", (data) => {
      io.to(data.roomId).emit("changeCode", data.newCode, data.activeFile);
    });

    // Handle active file changes
    socket.on("switchFile", (data) => {
      const { roomId, fileId, filename, username } = data;

      // Update user's active file
      const userInfo = userActiveFiles.get(socket.id);
      if (userInfo) {
        userInfo.activeFile = fileId;
        userActiveFiles.set(socket.id, userInfo);
      }

      // Broadcast to all users in the room
      const viewers = getActiveFileViewers(roomId);
      io.to(roomId).emit("activeFileViewers", viewers);
    });

    socket.on("disconnect", () => {
      const userInfo = userActiveFiles.get(socket.id);
      if (userInfo) {
        const { roomId, username, userId } = userInfo;
        userActiveFiles.delete(socket.id);

        if (userId) {
          const roomUsers = roomActiveUsers.get(roomId);
          if (roomUsers) {
            const userKey = getUserKey(userId, username);
            const activeUser = roomUsers.get(userKey);

            if (activeUser) {
              const nextCount = activeUser.connectionCount - 1;
              if (nextCount <= 0) {
                roomUsers.delete(userKey);
                finalizeSession({
                  roomId,
                  userId,
                  username,
                  sessionStartedAt: activeUser.sessionStartedAt,
                })
                  .then(() => emitRoomActivity(roomId))
                  .catch((error) => {
                    console.error("Error finalizing room session:", error);
                  });
              } else {
                roomUsers.set(userKey, {
                  ...activeUser,
                  connectionCount: nextCount,
                });
                emitRoomActivity(roomId).catch((error) => {
                  console.error("Error emitting room activity:", error);
                });
              }
            }

            if (roomUsers.size === 0) {
              roomActiveUsers.delete(roomId);
            } else {
              roomActiveUsers.set(roomId, roomUsers);
            }
          }
        }

        if (typingUsersByRoom.has(roomId)) {
          const roomTypingUsers = typingUsersByRoom.get(roomId);
          roomTypingUsers.delete(username);

          if (roomTypingUsers.size === 0) {
            typingUsersByRoom.delete(roomId);
            io.to(roomId).emit("typingUsersUpdate", []);
          } else {
            io.to(roomId).emit(
              "typingUsersUpdate",
              Array.from(roomTypingUsers),
            );
          }
        }

        // Update active file viewers after user leaves
        const viewers = getActiveFileViewers(roomId);
        io.to(roomId).emit("activeFileViewers", viewers);
        io.to(roomId).emit("userLeft", { username });

        console.log(`User ${username} (${socket.id}) disconnected`);
      }
    });
  });

  // Helper function to get active file viewers for a room
  function getActiveFileViewers(roomId) {
    const viewers = {};
    userActiveFiles.forEach((userInfo, socketId) => {
      if (userInfo.roomId === roomId && userInfo.activeFile) {
        if (!viewers[userInfo.activeFile]) {
          viewers[userInfo.activeFile] = [];
        }
        viewers[userInfo.activeFile].push(userInfo.username);
      }
    });
    return viewers;
  }
};
