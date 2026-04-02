import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { Code } from "@/components/Code.jsx";
import { OutputConsole } from "@/components/Output.jsx";
import { Sidebar } from "@/components/Sidebar";

const socket = io.connect("http://localhost:3000");

export const CodeEditor = () => {
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

  const activeFileRef = useRef(activeFile);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Emit file switch event when activeFile changes
  useEffect(() => {
    if (activeFile && user) {
      socket.emit("switchFile", {
        roomId,
        fileId: activeFile,
        username: user.username,
      });
    }
  }, [activeFile, user, roomId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token:", decoded);

        const userId = decoded.id;
        if (!userId) {
          console.error("User ID not found in token");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/auth/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

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

    socket.emit("joinRoom", {
      roomId,
      username: user.username,
      userId: user.id,
    });

    socket.on("previousMessages", (oldMessages) => {
      setMessages(oldMessages);
    });

    socket.on("receivedmessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("changeCode", (newC, incomingFile) => {
      if (activeFileRef.current === incomingFile) {
        setCode(newC);
      }
    });

    socket.on("activeFileViewers", (viewers) => {
      setActiveFileViewers(viewers);
    });

    socket.on("userJoined", (data) => {
      console.log(`${data.username} joined the room`);
    });

    socket.on("userLeft", (data) => {
      console.log(`${data.username} left the room`);
    });

    socket.on("typingUsersUpdate", (users) => {
      setTypingUsers(users || []);
    });

    socket.on("roomActivityUpdate", (activity) => {
      setRoomActivity(Array.isArray(activity) ? activity : []);
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
    socket.emit("codeUpdate", {
      roomId,
      newCode,
      activeFile: activeFileRef.current,
    }); // Ensure latest activeFile is sent

    // Send a request to update the database
    if (activeFileRef.current) {
      fetch(
        `http://localhost:3000/api/rooms/file/update/${activeFileRef.current}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newCode }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            console.error("Error updating file in database:", data.message);
          }
        })
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

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (user) {
        socket.emit("stopTyping", { roomId, username: user.username });
      }
    };
  }, [roomId, user]);

  const otherTypingUsers = typingUsers.filter(
    (name) => name !== user?.username,
  );

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden">
      {/* Sidebar */}
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

      {/* Code Editor + Output Section */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex-1 h-64 overflow-auto">
          <Code
            code={code}
            setCode={handleCodeChange}
            language={language}
            setLanguage={setLanguage}
          />
        </div>

        <div className="h-64 p-3">
          <OutputConsole code={code} language={language} />
        </div>
      </div>

      {/* Chat Box */}
      <div className="w-80 border-l border-[#1E90FF]/30 bg-[#1A1A1A] flex flex-col shadow-lg">
        <div className="p-4 border-b border-[#1E90FF]/30 bg-[#1A1A1A]">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent tracking-wide">
            💬 Chat
          </h2>
          <p className="text-xs text-[#FFFFFF]/50 mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0D0D0D] p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#FFFFFF]/40 text-sm text-center">
                No messages yet...
                <br />
                Start the conversation! 💭
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="animate-fadeIn">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#00FF85] font-semibold text-sm">
                    {msg.username}
                  </span>
                  <span className="text-[#FFFFFF]/30 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-[#FFFFFF]/90 text-sm mt-1 break-words">
                  {msg.message}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {otherTypingUsers.length > 0 && (
          <div className="px-4 py-2 border-t border-[#1E90FF]/20 bg-[#0D0D0D]">
            <p className="text-xs text-[#00FF85] animate-pulse">
              {otherTypingUsers.length === 1
                ? `${otherTypingUsers[0]} is typing...`
                : `${otherTypingUsers.join(", ")} are typing...`}
            </p>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-3 border-t border-[#1E90FF]/30 bg-[#1A1A1A]">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0D0D0D] border border-[#1E90FF]/50 text-[#FFFFFF] placeholder-[#FFFFFF]/40 focus:outline-none focus:ring-2 focus:ring-[#00FF85] focus:border-[#00FF85] transition-all duration-300 text-sm"
              placeholder={user ? "Type a message..." : "Loading..."}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={(e) => e.key === "Enter" && handleSendButton()}
              disabled={!user}
            />
            <button
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                !user || !message.trim()
                  ? "bg-[#0D0D0D] text-[#FFFFFF]/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#00FF85] to-[#1E90FF] text-[#0D0D0D] hover:from-[#00FF85]/90 hover:to-[#1E90FF]/90 hover:shadow-lg hover:shadow-[#00FF85]/25 transform hover:-translate-y-0.5"
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
  );
};
