import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Code } from "@/components/Code.jsx";
import { OutputConsole } from "@/components/Output.jsx";
import { Sidebar } from "@/components/Sidebar";

const socket = io.connect("http://localhost:3000");

export const CodeEditor = () => {
  const MIN_CHAT_WIDTH = 280;
  const MAX_CHAT_WIDTH = 600;
  const MIN_MAIN_WIDTH = 400;
  const MIN_OUTPUT_HEIGHT = 150;
  const MAX_OUTPUT_HEIGHT = 500;
  const MIN_EDITOR_HEIGHT = 200;

  const { roomId } = useParams();
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [user, setUser] = useState(null);
  const [activeFileViewers, setActiveFileViewers] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomActivity, setRoomActivity] = useState([]);
  const [chatWidth, setChatWidth] = useState(384);
  const [outputHeight, setOutputHeight] = useState(250);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );

  const roomActivitySnapshotRef = useRef({ generatedAt: Date.now(), activity: [] });
  const activeFileRef = useRef(activeFile);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isResizingChatRef = useRef(false);
  const isResizingOutputRef = useRef(false);
  const mainAreaRef = useRef(null);
  const editorStackRef = useRef(null);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Global mouse move + up handlers for resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingChatRef.current && mainAreaRef.current && isDesktop) {
        const bounds = mainAreaRef.current.getBoundingClientRect();
        const dynamicMax = Math.max(MIN_CHAT_WIDTH, bounds.width - MIN_MAIN_WIDTH);
        const nextWidth = bounds.right - e.clientX;
        setChatWidth(
          Math.min(Math.max(nextWidth, MIN_CHAT_WIDTH), Math.min(dynamicMax, MAX_CHAT_WIDTH))
        );
      }

      if (isResizingOutputRef.current && editorStackRef.current && isDesktop) {
        const bounds = editorStackRef.current.getBoundingClientRect();
        const dynamicMax = Math.max(MIN_OUTPUT_HEIGHT, bounds.height - MIN_EDITOR_HEIGHT);
        const nextHeight = bounds.bottom - e.clientY;
        setOutputHeight(
          Math.min(Math.max(nextHeight, MIN_OUTPUT_HEIGHT), Math.min(dynamicMax, MAX_OUTPUT_HEIGHT))
        );
      }
    };

    const handleMouseUp = () => {
      if (!isResizingChatRef.current && !isResizingOutputRef.current) return;
      isResizingChatRef.current = false;
      isResizingOutputRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDesktop]);

  const beginChatResize = (e) => {
    if (!isDesktop) return;
    e.preventDefault();
    isResizingChatRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const beginOutputResize = (e) => {
    if (!isDesktop) return;
    e.preventDefault();
    isResizingOutputRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const syncLiveRoomActivity = () => {
    const snapshot = roomActivitySnapshotRef.current;
    const elapsedMs = Math.max(Date.now() - snapshot.generatedAt, 0);
    setRoomActivity(
      (snapshot.activity || []).map((item) => {
        if (!item?.isActive) return item;
        return {
          ...item,
          activeSessionMs: (item.activeSessionMs || 0) + elapsedMs,
          totalTimeMs: (item.totalTimeMs || 0) + elapsedMs,
        };
      }),
    );
  };

  useEffect(() => {
    const intervalId = setInterval(syncLiveRoomActivity, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (activeFile && user) {
      socket.emit("switchFile", { roomId, fileId: activeFile, username: user.username });
    }
  }, [activeFile, user, roomId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { console.error("No token found"); return; }
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userId = decoded.id;
        if (!userId) { console.error("User ID not found in token"); return; }
        const response = await fetch(`http://localhost:3000/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        console.log("Fetched User Data:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.emit("joinRoom", { roomId, username: user.username, userId: user.id });

    socket.on("previousMessages", (oldMessages) => setMessages(oldMessages));
    socket.on("receivedmessage", (newMessage) => setMessages((prev) => [...prev, newMessage]));
    socket.on("changeCode", (newC, incomingFile) => {
      if (activeFileRef.current === incomingFile) setCode(newC);
    });
    socket.on("activeFileViewers", (viewers) => setActiveFileViewers(viewers));
    socket.on("userJoined", (data) => console.log(`${data.username} joined the room`));
    socket.on("userLeft", (data) => console.log(`${data.username} left the room`));
    socket.on("typingUsersUpdate", (users) => setTypingUsers(users || []));
    socket.on("roomActivityUpdate", (activity) => {
      if (Array.isArray(activity)) {
        roomActivitySnapshotRef.current = { generatedAt: Date.now(), activity };
      } else {
        roomActivitySnapshotRef.current = {
          generatedAt: activity?.generatedAt || Date.now(),
          activity: Array.isArray(activity?.activity) ? activity.activity : [],
        };
      }
      syncLiveRoomActivity();
    });

    return () => {
      socket.off("previousMessages");
      socket.off("receivedmessage");
      socket.off("changeCode");
      socket.off("activeFileViewers");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("typingUsersUpdate");
      socket.off("roomActivityUpdate");
    };
  }, [roomId, user]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeUpdate", { roomId, newCode, activeFile: activeFileRef.current });
    if (activeFileRef.current) {
      fetch(`http://localhost:3000/api/rooms/file/update/${activeFileRef.current}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCode }),
      })
        .then((res) => res.json())
        .then((data) => { if (!data.success) console.error("Error updating file:", data.message); })
        .catch((error) => console.error("Error updating file:", error));
    }
  };

  const handleSendButton = () => {
    if (message.trim() && user) {
      socket.emit("stopTyping", { roomId, username: user.username });
      socket.emit("send_message", { roomId, username: user.username, message });
      setMessage("");
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (!user) return;
    if (value.trim()) {
      socket.emit("startTyping", { roomId, username: user.username });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { roomId, username: user.username });
      }, 1200);
      return;
    }
    socket.emit("stopTyping", { roomId, username: user.username });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (user) socket.emit("stopTyping", { roomId, username: user.username });
    };
  }, [roomId, user]);

  const otherTypingUsers = typingUsers.filter((name) => name !== user?.username);

  return (
    <div className="flex min-h-screen flex-col bg-black text-zinc-100 lg:h-screen lg:flex-row">
      <Sidebar
        roomId={roomId}
        setCode={setCode}
        handleCodeChange={handleCodeChange}
        code={code}
        language={language}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        activeFileViewers={activeFileViewers}
        currentUser={user?.username}
        roomActivity={roomActivity}
      />

      {/* Main area: editor + output + chat */}
      <div ref={mainAreaRef} className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">

        {/* Editor + Output stacked vertically */}
        <div
          ref={editorStackRef}
          className="flex min-h-[520px] flex-1 flex-col bg-black p-3 lg:min-h-0 lg:overflow-hidden lg:p-4"
        >
          {/* Code editor - grows to fill space */}
          <div className="min-h-[200px] flex-1 overflow-hidden">
            <Code
              code={code}
              setCode={handleCodeChange}
              language={language}
              setLanguage={setLanguage}
            />
          </div>

          {/* ── Output resize handle ── */}
          <button
            type="button"
            onMouseDown={beginOutputResize}
            aria-label="Resize output panel"
            className="group hidden h-3 w-full cursor-row-resize items-center justify-center lg:flex"
          >
            <span className="h-[2px] w-24 rounded-full bg-zinc-800 transition-colors duration-150 group-hover:bg-zinc-400" />
          </button>

          {/* Output console - fixed height, resizable on desktop */}
          <div
            className="shrink-0"
            style={isDesktop ? { height: `${outputHeight}px` } : { height: "230px" }}
          >
            <OutputConsole code={code} language={language} />
          </div>
        </div>

        {/* ── Chat resize handle (vertical bar) ── */}
        <button
          type="button"
          onMouseDown={beginChatResize}
          aria-label="Resize chat panel"
          className="group hidden w-3 cursor-col-resize items-center justify-center bg-black lg:flex"
        >
          <span className="h-24 w-[2px] rounded-full bg-zinc-800 transition-colors duration-150 group-hover:bg-zinc-400" />
        </button>

        {/* Chat panel - fixed width on desktop, resizable */}
        <div
          className="flex flex-col border-t border-zinc-900 bg-zinc-950/95 lg:border-l lg:border-t-0"
          style={isDesktop ? { width: `${chatWidth}px`, minWidth: `${MIN_CHAT_WIDTH}px` } : { height: "320px" }}
        >
          <div className="border-b border-zinc-900 px-4 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">Team Chat</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {messages.length} message{messages.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-black p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-zinc-500">
                  No messages yet...
                  <br />
                  Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="animate-fadeIn">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-zinc-200">{msg.username}</span>
                    <span className="text-xs text-zinc-500">
                      {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 break-words rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {otherTypingUsers.length > 0 && (
            <div className="border-t border-zinc-900 bg-black px-4 py-2">
              <p className="animate-pulse text-xs text-zinc-300">
                {otherTypingUsers.length === 1
                  ? `${otherTypingUsers[0]} is typing...`
                  : `${otherTypingUsers.join(", ")} are typing...`}
              </p>
            </div>
          )}

          <div className="border-t border-zinc-900 bg-zinc-950/95 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-600/20"
                placeholder={user ? "Type a message..." : "Loading..."}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendButton()}
                disabled={!user}
              />
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  !user || !message.trim()
                    ? "cursor-not-allowed bg-zinc-900 text-zinc-600"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
                onClick={handleSendButton}
                disabled={!user || !message.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};