import { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { MdDeleteForever } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { IoIosCreate } from "react-icons/io";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({
  roomId,
  setCode,
  handleCodeChange,
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
  const user = localStorage.getItem("token");
  const decodedUser = JSON.parse(atob(user.split(".")[1]));
  const navigate = useNavigate();

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

  // ! Fetched Collaborator
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/get/${roomId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch room details");

        const data = await response.json();
        setRoomName(data.room_name);
        setCollaborators(data.collaborators);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // ! Fetched Files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/rooms/file/get/${roomId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch Files");

        const data = await response.json();
        console.log(data.files);
        setFiles(data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [roomId]);

  // Handles file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target.result;
      try {
        const response = await fetch(
          "http://localhost:3000/api/rooms/file/upload",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              content: fileContent,
              owner: decodedUser.id,
              roomId,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "File upload failed");
        }

        toast.success("File uploaded successfully!");
        setFiles((prevFiles) => [...prevFiles, data.savedFile]);
        setActiveFile(data.savedFile._id);
        setCode(fileContent);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(error.message || "An error occurred");
      }
    };
    reader.readAsText(file);
  };

  //Handles file selection
  const handleFileClick = async (file) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/rooms/file/specificFile/${file._id}`,
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch single File");
      setActiveFile(data.file._id);
      setCode(data.file.content);
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {}, [activeFile]);

  // Function to handle file download
  const handleDownload = () => {
    console.log("Code to download:", code);
    if (!code) {
      alert("No code to download!");
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

  // create New File
  const handleCreateFile = async () => {
    if (!newFilename.trim()) {
      toast.error("Filename cannot be empty!");
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
            owner: decodedUser.id,
            roomId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create file");
      }
      console.log("Created File", data);
      toast.success("File created successfully!");
      setFiles((prevFiles) => [...prevFiles, data.savedFile]);
      setNewFilename("");
      setCode("");
      setActiveFile(data.createdFile._id);
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!fileId) {
      console.error("No file ID provided.");
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

  return (
    <div className="w-64 h-full bg-[#1A1A1A] text-[#FFFFFF] flex flex-col p-4 border-r border-[#1E90FF]/30 shadow-lg">
      <div className="flex justify-between">
        <h2 className="text-2xl font-extrabold mb-4 tracking-wide bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent">
          CoCode
        </h2>
        <p
          className="text-xl font-bold text-[#FF0099] hover:text-red-500 cursor-pointer transition-all duration-200"
          onClick={() => navigate("/joinroom")}
        >
          Exit
        </p>
      </div>
      <h3 className="text-lg font-medium text-[#FFFFFF]/80 mb-4">
        <span className="text-[#FFFFFF]/50">Room:</span> {roomName}
      </h3>

      <div className="flex justify-around gap-2">
        <label className="flex items-center justify-center bg-gradient-to-r from-[#1E90FF] to-[#00FF85] text-[#0D0D0D] py-2 px-3 rounded-lg mb-4 hover:from-[#1E90FF]/90 hover:to-[#00FF85]/90 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[#00FF85]/25 hover:-translate-y-0.5">
          <FaUpload />
          <input
            type="file"
            accept=".c,.cpp,.js,.py"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        <button
          className="bg-gradient-to-r from-[#1E90FF] to-[#00FF85] text-[#0D0D0D] px-3 py-2 rounded-lg mb-4 shadow-lg hover:from-[#1E90FF]/90 hover:to-[#00FF85]/90 hover:shadow-[#00FF85]/25 hover:-translate-y-0.5 transition-all duration-200"
          onClick={handleDownload}
        >
          <FaDownload />
        </button>

        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-gradient-to-r from-[#1E90FF] to-[#00FF85] text-[#0D0D0D] px-3 py-2 rounded-lg mb-4 shadow-lg hover:from-[#1E90FF]/90 hover:to-[#00FF85]/90 hover:shadow-[#00FF85]/25 hover:-translate-y-0.5 transition-all duration-200">
              <IoIosCreate />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-[#1A1A1A] text-[#FFFFFF] border border-[#1E90FF]/30 shadow-lg rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-[#FFFFFF] text-xl font-bold bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent">
                Create New File
              </DialogTitle>
            </DialogHeader>

            <Input
              className="mt-2 px-4 py-3 rounded-xl bg-[#0D0D0D] border border-[#1E90FF]/50 text-[#FFFFFF] placeholder-[#FFFFFF]/40 focus:outline-none focus:ring-2 focus:ring-[#00FF85] focus:border-[#00FF85] transition-all duration-300"
              placeholder="Enter file name (e.g., main.js)"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
            />

            <DialogFooter className="mt-4">
              <button
                onClick={handleCreateFile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#1E90FF] text-[#0D0D0D] font-bold hover:from-[#00FF85]/90 hover:to-[#1E90FF]/90 hover:shadow-lg hover:shadow-[#00FF85]/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                CREATE
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-1">
        {files.map((file) => {
          const viewers = activeFileViewers[file._id] || [];
          const otherViewers = viewers.filter((v) => v !== currentUser);

          return (
            <div key={file._id} className="flex flex-col group">
              <div className="flex items-center justify-between">
                <div
                  className={`text-sm py-2 px-3 rounded-lg w-full cursor-pointer transition-all duration-200
                    ${
                      activeFile === file._id
                        ? "bg-gradient-to-r from-[#00FF85]/20 to-[#1E90FF]/20 border border-[#00FF85]/50 text-[#00FF85] font-semibold shadow-lg shadow-[#00FF85]/10"
                        : "hover:bg-[#0D0D0D] text-[#FFFFFF]/70 hover:text-[#FFFFFF] border border-transparent"
                    }`}
                  onClick={() => handleFileClick(file)}
                >
                  📄 {file.filename}
                </div>

                <MdDeleteForever
                  size={22}
                  className="text-[#FF0099] hover:text-red-500 cursor-pointer ml-2 transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteFile(file._id)}
                />
              </div>

              {/* Show viewers */}
              {otherViewers.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 ml-6">
                  <div className="flex -space-x-2">
                    {otherViewers.slice(0, 3).map((viewer, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#00FF85] flex items-center justify-center text-xs font-bold text-[#0D0D0D] border-2 border-[#1A1A1A]"
                        title={viewer}
                      >
                        {viewer.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[#1E90FF] ml-2">
                    {otherViewers.length === 1
                      ? otherViewers[0]
                      : `${otherViewers.length} viewing`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Room Info */}
      <div
        className="mt-4 p-3 bg-[#0D0D0D] rounded-lg text-sm cursor-pointer border border-[#1E90FF]/30 hover:border-[#00FF85]/50 transition-all duration-200"
        onClick={() => navigator.clipboard.writeText(roomId)}
        onClickCapture={() => toast.success("Copied to clipboard")}
      >
        <p className="text-[#FFFFFF]/80">
          🔑 <strong className="text-[#00FF85]">Room ID:</strong>{" "}
          <span className="text-[#FFFFFF]/60">{roomId}</span>
        </p>
      </div>

      {/* Collaborators */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2 tracking-wide">
          Collaborators
        </h3>
        {collaboratorRows.length > 0 ? (
          collaboratorRows.map((user, index) => (
            <div
              key={index}
              className="mb-2 p-2 rounded-lg bg-[#0D0D0D] border border-[#1E90FF]/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.isActive
                        ? "bg-[#00FF85] animate-pulse shadow-lg shadow-[#00FF85]/50"
                        : "bg-[#FFFFFF]/30"
                    }`}
                  ></div>
                  <p className="text-sm text-[#FFFFFF]/80">{user.name}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    user.isActive
                      ? "bg-[#00FF85]/20 text-[#00FF85]"
                      : "bg-[#FFFFFF]/10 text-[#FFFFFF]/60"
                  }`}
                >
                  {user.isActive ? "active" : "offline"}
                </span>
              </div>
              <p className="text-xs text-[#1E90FF] mt-1 pl-5">
                Time in room: {formatDuration(user.totalTimeMs)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#FFFFFF]/40">No collaborators yet</p>
        )}
      </div>
    </div>
  );
};
