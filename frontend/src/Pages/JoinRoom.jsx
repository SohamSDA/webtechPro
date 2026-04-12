import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Building2,
  Copy,
  DoorOpen,
  FolderOpenDot,
  PlusCircle,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { apiUrl } from "@/lib/api";

export const JoinRoom = () => {
  const [user, setUser] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [enteredRoomId, setEnteredRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded) setUser(decoded);
    } catch (err) {
      console.warn("Invalid token, ignoring decode", err);
    }
  }, [token]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Room name cannot be empty");
      return;
    }

    if (!user?.id) {
      toast.error("User session not available");
      return;
    }

    const roomId = uuidv4();
    const newRoom = { roomId, roomName, ownerId: user.id, collaborators: [] };

    try {
      const response = await fetch(apiUrl("/api/rooms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Room created successfully");
        navigate(`/editor/${roomId}`);
      } else {
        toast.error("Failed to create room");
      }
    } catch (error) {
      toast.error("Error creating room");
      console.error("Error creating room:", error);
    }
  };

  const handleRoomJoin = async () => {
    if (!enteredRoomId.trim()) {
      toast.error("Enter Room ID");
      return;
    }

    if (!user?.id) {
      toast.error("User session not available");
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/rooms/join/${enteredRoomId}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Joined room successfully");
        navigate(`/editor/${enteredRoomId}`);
      } else {
        toast.error(data.message || "Failed to join room");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  useEffect(() => {
    const fetchJoinedRooms = async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/rooms/getrooms/${user?.id}`),
          {
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.ok) {
          setRooms(data.rooms || []);
        } else {
          toast.error(data.message || "Failed to fetch joined rooms");
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    if (user?.id) {
      fetchJoinedRooms();
    }
  }, [user]);

  const copyRoomId = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Room ID copied");
    } catch {
      toast.error("Unable to copy room ID");
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-black px-4 pb-12 pt-28 text-zinc-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-8 top-0 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-12 right-8 h-72 w-72 rounded-full bg-zinc-500/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(39,39,42,0.5)_1px,transparent_1px)] bg-[size:22px_22px]"></div>
        </div>

        <div className="relative mx-auto w-full max-w-6xl space-y-8">
          <motion.div
            className="rounded-3xl border border-zinc-900 bg-zinc-950/90 p-6 shadow-[0_28px_80px_-45px_rgba(0,0,0,1)] md:p-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-200">
                  Room Workspace Hub
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
                  Welcome back{user?.username ? `, ${user.username}` : ""}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
                  Create a room for a new collaboration or join one with an
                  invite ID. Keep every project structured and easy to access.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-400">
                <p className="font-semibold text-zinc-200">
                  {rooms.length} joined room{rooms.length !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-xs">Active collaboration snapshot</p>
              </div>
            </div>

            <motion.div
              className="mt-7 grid gap-4 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-zinc-200">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">
                      Create Room
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Start a new collaborative coding session.
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200">
                      New Room <ArrowRight className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-zinc-100">
                        Create a New Room
                      </DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="e.g. frontend-refactor"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="h-11 rounded-xl border-zinc-800 bg-black text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-500/20"
                    />
                    <DialogFooter>
                      <button
                        onClick={handleCreateRoom}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
                      >
                        Create Room <Building2 className="h-4 w-4" />
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-zinc-200">
                    <DoorOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-100">
                      Join Existing Room
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Enter a room ID shared by your teammate.
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors duration-200 hover:bg-zinc-900">
                      Join Room <Users className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-zinc-100">
                        Join a Room
                      </DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Paste room ID"
                      value={enteredRoomId}
                      onChange={(e) => setEnteredRoomId(e.target.value)}
                      className="h-11 rounded-xl border-zinc-800 bg-black text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-500/20"
                    />
                    <DialogFooter>
                      <button
                        onClick={handleRoomJoin}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
                      >
                        Join Room <ArrowRight className="h-4 w-4" />
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </motion.div>

          {rooms.length > 0 ? (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-zinc-100">
                  <FolderOpenDot className="h-6 w-6 text-zinc-200" />
                  Your Joined Rooms
                </h2>
                <p className="text-sm text-zinc-400">
                  Click any room to open editor
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => navigate(`/editor/${room.room_id}`)}
                    className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-[0_18px_45px_-35px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1 hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-xl font-semibold text-zinc-100">
                        {room.room_name}
                      </h3>
                      <span className="rounded-full border border-zinc-700 bg-black px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                        Room
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-zinc-400">
                      Owner: {room.owner?.email || "Unknown"}
                    </p>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-700 bg-black px-3 py-2 text-xs text-zinc-300">
                      <span className="truncate pr-3">ID: {room.room_id}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          copyRoomId(room.room_id);
                        }}
                        className="inline-flex items-center gap-1 font-medium text-zinc-100 hover:text-zinc-300"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-zinc-100">
                No rooms yet
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Create your first room to start a focused collaboration session.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};
