import mongoose from "mongoose";

const RoomPresenceSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: { type: String, required: true, trim: true },
    totalTimeMs: { type: Number, default: 0 },
    sessionsCount: { type: Number, default: 0 },
    lastJoinedAt: { type: Date, default: null },
    lastLeftAt: { type: Date, default: null },
  },
  { timestamps: true },
);

RoomPresenceSchema.index({ roomId: 1, userId: 1 }, { unique: true });

const RoomPresence = mongoose.model("RoomPresence", RoomPresenceSchema);

export default RoomPresence;
