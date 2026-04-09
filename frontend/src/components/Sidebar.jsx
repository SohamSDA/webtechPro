import { useState, useEffect } from "react";
import { FaDownload, FaUpload } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { IoIosCreate } from "react-icons/io";
import { Copy, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({
  roomId,
  setCode,
  code,
  language,
  activeFile,
  setActiveFile,
  activeFileViewers = {},
  currentUser,
  roomActivity = [],
}) => {
  const [files, setFiles] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [newFilename, setNewFilename] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let decodedUser = null;
  try {
    decodedUser = token ? JSON.parse(atob(token.split(".")[1])) : null;
  } catch {
    decodedUser = null;
  }

  const formatDuration = (durationMs = 0) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  const activityByUsername = roomActivity.reduce((acc, item) => {
    if (item?.username) {
      acc[item.username] = item;
    }
    return acc;
  }, {});

  const collaboratorRows = collaborators.map((collab) => {
    const activity = activityByUsername[collab.name];
    return {
      name: collab.name,
      isActive: Boolean(activity?.isActive),
      totalTimeMs: activity?.totalTimeMs || 0,
    };
  });

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/get/${roomId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch room details");

        const data = await response.json();
        setRoomName(data.room_name);
        setCollaborators(data.collaborators || []);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/file/get/${roomId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch files");

        const data = await response.json();
        setFiles(data.files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [roomId]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result;
      try {
        const response = await fetch(
          "http://localhost:3000/api/rooms/file/upload",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content: fileContent,
              owner: decodedUser?.id,
              roomId,
            }),
          },
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "File upload failed");
        }

        toast.success("File uploaded successfully");
        setFiles((prevFiles) => [...prevFiles, data.savedFile]);
        setActiveFile(data.savedFile._id);
        setCode(fileContent || "");
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(error.message || "An error occurred");
      }
    };

    reader.readAsText(file);
  };

  const handleFileClick = async (file) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/rooms/file/specificFile/${file._id}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch file");

      setActiveFile(data.file._id);
      setCode(data.file.content);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDownload = () => {
    if (!code) {
      toast.error("No code to download");
      return;
    }

    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    const extension =
      language === "javascript"
        ? "js"
        : language === "python"
          ? "py"
          : language === "c"
            ? "c"
            : language === "cpp"
              ? "cpp"
              : "txt";

    link.download = `code.${extension}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCreateFile = async () => {
    if (!newFilename.trim()) {
      toast.error("Filename cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/rooms/file/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: newFilename,
            content: "",
            owner: decodedUser?.id,
            roomId,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create file");
      }

      toast.success("File created successfully");
      setFiles((prevFiles) => [...prevFiles, data.savedFile]);
      setNewFilename("");
      setCode("");
      setActiveFile(data.savedFile._id);
    } catch (error) {
      console.error("Error creating file:", error);
      toast.error(error.message || "Failed to create file");
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!fileId) {
      toast.error("No file selected");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/rooms/file/delete/${fileId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete file");
      }

      toast.success("File deleted successfully");
      setFiles((prevFiles) => prevFiles.filter((file) => file._id !== fileId));
      setCode("");
      setActiveFile(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Error deleting file");
    }
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Unable to copy room ID");
    }
  };

  return (
    <div className="w-full shrink-0 border-b border-zinc-900 bg-zinc-950/95 p-4 shadow-[0_18px_45px_-35px_rgba(0,0,0,0.98)] lg:h-screen lg:w-80 lg:border-b-0 lg:border-r lg:overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            CoCode
          </h2>
          <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
            Room: {roomName || "Loading..."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-black px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900"
          onClick={() => navigate("/joinroom")}
        >
          <LogOut className="h-3.5 w-3.5" />
          Exit
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-black py-2 text-zinc-200 transition-colors hover:bg-zinc-900">
          <FaUpload size={13} />
          <input
            type="file"
            accept=".c,.cpp,.js,.py"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-zinc-800 bg-black py-2 text-zinc-200 transition-colors hover:bg-zinc-900"
          onClick={handleDownload}
        >
          <FaDownload size={13} />
        </button>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center rounded-lg border border-zinc-800 bg-black py-2 text-zinc-200 transition-colors hover:bg-zinc-900"
            >
              <IoIosCreate size={16} />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-zinc-100">
                Create New File
              </DialogTitle>
            </DialogHeader>

            <Input
              className="mt-1 h-11 rounded-xl border-zinc-800 bg-black text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-600/20"
              placeholder="Enter file name (e.g. main.js)"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
            />

            <DialogFooter className="mt-2">
              <button
                type="button"
                onClick={handleCreateFile}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
              >
                Create
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Files
        </p>
        <div className="max-h-[35vh] space-y-1.5 overflow-y-auto pr-1 lg:max-h-[38vh]">
          {files.map((file) => {
            const viewers = activeFileViewers[file._id] || [];
            const otherViewers = viewers.filter(
              (viewer) => viewer !== currentUser,
            );

            return (
              <div
                key={file._id}
                className="group rounded-lg border border-transparent"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`flex-1 truncate rounded-lg border px-3 py-2 text-left text-sm transition-all duration-200 ${
                      activeFile === file._id
                        ? "border-zinc-300 bg-zinc-900 text-zinc-100"
                        : "border-zinc-900 bg-black text-zinc-200 hover:border-zinc-800 hover:bg-zinc-950"
                    }`}
                    onClick={() => handleFileClick(file)}
                  >
                    {file.filename}
                  </button>

                  <button
                    type="button"
                    className="rounded-md p-1 text-zinc-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                    onClick={() => handleDeleteFile(file._id)}
                    aria-label="Delete file"
                  >
                    <MdDeleteForever size={20} />
                  </button>
                </div>

                {otherViewers.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 pl-2">
                    <div className="flex -space-x-2">
                      {otherViewers.slice(0, 3).map((viewer, idx) => (
                        <div
                          key={`${viewer}-${idx}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-900 bg-zinc-800 text-[10px] font-semibold text-zinc-200"
                          title={viewer}
                        >
                          {viewer.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {otherViewers.length === 1
                        ? otherViewers[0]
                        : `${otherViewers.length} viewing`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {files.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-sm text-zinc-500">
              No files yet. Upload or create one.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-900 bg-black p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Room ID
            </p>
            <p className="mt-1 break-all text-sm text-zinc-300">{roomId}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyRoomId}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-900"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Collaborators
        </h3>

        {collaboratorRows.length > 0 ? (
          <div className="mt-2 space-y-2">
            {collaboratorRows.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="rounded-xl border border-zinc-900 bg-black px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        member.isActive ? "bg-zinc-300" : "bg-zinc-700"
                      }`}
                    ></span>
                    <p className="text-sm font-medium text-zinc-200">
                      {member.name}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      member.isActive
                        ? "bg-zinc-500/20 text-zinc-200"
                        : "bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {member.isActive ? "active" : "offline"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Time in room: {formatDuration(member.totalTimeMs)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No collaborators yet</p>
        )}
      </div>
    </div>
  );
};
