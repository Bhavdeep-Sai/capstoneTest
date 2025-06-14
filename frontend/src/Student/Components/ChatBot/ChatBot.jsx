import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import {
    BookOpen,
    Send,
    X,
    Minus,
    ChevronDown,
    GraduationCap,
    AlertCircle,
    History,
    Trash2,
    Maximize2,
    Save,
    RefreshCw,
} from "lucide-react";
import { baseApi } from "../../../environment";

// Student AI Tutor Icon component
const TutorIcon = ({ size = 24 }) => (
    <div
        className={`w-8 h-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center`}
    >
        <GraduationCap size={size * 0.6} className="text-black" />
    </div>
);

// Enhanced Message Component with Markdown support
const MessageContent = ({ message, isBot }) => {
    if (!isBot) {
        // User messages remain as plain text
        return (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
            </div>
        );
    }

    // Bot messages with enhanced formatting
    return (
        <div className="text-sm leading-relaxed">
            <ReactMarkdown
                components={{
                    // Custom link styling
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            className="text-amber-400 hover:text-amber-300 underline transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    // Custom paragraph styling
                    p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                    ),
                    // Custom heading styles
                    h1: ({ node, ...props }) => (
                        <h1 {...props} className="text-lg font-bold text-amber-400 mb-2" />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-md font-semibold text-amber-400 mb-2" />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-sm font-medium text-amber-400 mb-1" />
                    ),
                    // Custom list styling
                    ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside mb-2 space-y-1" />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside mb-2 space-y-1" />
                    ),
                    li: ({ node, ...props }) => (
                        <li {...props} className="text-sm" />
                    ),
                    // Custom code styling
                    code: ({ node, inline, ...props }) =>
                        inline ? (
                            <code
                                {...props}
                                className="bg-gray-700 text-amber-300 px-1 py-0.5 rounded text-xs font-mono"
                            />
                        ) : (
                            <code
                                {...props}
                                className="block bg-gray-700 text-amber-300 p-2 rounded text-xs font-mono overflow-x-auto"
                            />
                        ),
                    // Custom blockquote styling
                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            {...props}
                            className="border-l-4 border-amber-600 pl-3 italic text-gray-300 mb-2"
                        />
                    ),
                    // Custom table styling
                    table: ({ node, ...props }) => (
                        <table {...props} className="border-collapse border border-gray-600 mb-2" />
                    ),
                    th: ({ node, ...props }) => (
                        <th {...props} className="border border-gray-600 px-2 py-1 bg-gray-700 font-semibold text-amber-400" />
                    ),
                    td: ({ node, ...props }) => (
                        <td {...props} className="border border-gray-600 px-2 py-1" />
                    ),
                    // Custom strong/bold styling
                    strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold text-amber-300" />
                    ),
                    // Custom emphasis/italic styling
                    em: ({ node, ...props }) => (
                        <em {...props} className="italic text-gray-300" />
                    ),
                }}
            >
                {message.text}
            </ReactMarkdown>
        </div>
    );
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [studentName, setStudentName] = useState("Student");
    const [connectionStatus, setConnectionStatus] = useState("checking"); // checking, connected, disconnected, error
    const [lastError, setLastError] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [chatSize, setChatSize] = useState({ width: 450, height: 650 }); // Increased default width for better content display
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Get student info from token
    useEffect(() => {
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (token) {
                // Decode JWT token to get student info
                const payload = JSON.parse(atob(token.split(".")[1]));
                setStudentName(payload.name || "Student");
            }
        } catch (error) {
            console.error("Error getting student info:", error);
        }
    }, []);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Yo! I'm your **AI Study Buddy**—powered by the awesome folks at **BeaconPort** 🎓\n\nReady to break down tough topics, ace those exams, and make studying feel less like a chore and more like a win.\n\n**What I can help you with:**\n• 📚 **Subject explanations** - Math, Science, History, and more\n• 🧮 **Problem solving** - Step-by-step solutions\n• 📝 **Study tips** - Effective learning strategies\n• 🎯 **Exam prep** - Practice questions and review\n• 📖 **Assignment help** - Guidance and feedback\n\nSo, what are we conquering today?",
            isBot: true,
            timestamp: new Date(),
        },
    ]);

    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-save functionality with debouncing
    useEffect(() => {
        if (hasUnsavedChanges && messages.length > 1) {
            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout for auto-save (30 seconds after last change)
            saveTimeoutRef.current = setTimeout(() => {
                saveCurrentSession();
            }, 30000);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [messages, hasUnsavedChanges]);

    // Save session when component unmounts or page unloads
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges && messages.length > 1) {
                saveCurrentSession();
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handleUnload = () => {
            if (hasUnsavedChanges && messages.length > 1) {
                saveCurrentSession();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            if (hasUnsavedChanges && messages.length > 1) {
                saveCurrentSession();
            }
        };
    }, [hasUnsavedChanges, messages]);

    // Test connection to AI service
    const testConnection = async () => {
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                setConnectionStatus("error");
                setLastError("Authentication required");
                return;
            }

            const response = await fetch(`${baseApi}/ai-tutor/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: "test connection",
                    context: "general",
                    sessionId: currentSessionId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setConnectionStatus("connected");
                setLastError(null);
            } else if (response.status === 503) {
                setConnectionStatus("error");
                setLastError("Gemini AI service temporarily unavailable");
            } else if (response.status === 401) {
                setConnectionStatus("error");
                setLastError("Authentication failed");
            } else {
                setConnectionStatus("error");
                setLastError(data.message || "AI service connection failed");
            }
        } catch (error) {
            console.error("Connection test failed:", error);
            setConnectionStatus("error");
            setLastError("AI service unreachable");
        }
    };

    // Save current chat session
    const saveCurrentSession = async () => {
        if (!currentSessionId || messages.length <= 1 || isSaving) return;

        setIsSaving(true);
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            // Convert messages to API format
            const apiMessages = messages
                .slice(1) // Skip welcome message
                .map((msg) => ({
                    role: msg.isBot ? "assistant" : "user",
                    content: msg.text,
                    timestamp: msg.timestamp.toISOString(),
                }));

            if (apiMessages.length === 0) return;

            const response = await fetch(`${baseApi}/ai-tutor/save-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    messages: apiMessages,
                    context: determineOverallContext(),
                    title: generateSessionTitle(),
                }),
            });

            if (response.ok) {
                setHasUnsavedChanges(false);
                // Refresh chat history
                loadChatHistory();
            } else {
                console.error("Failed to save session");
            }
        } catch (error) {
            console.error("Error saving session:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Generate session title from first user message
    const generateSessionTitle = () => {
        const firstUserMessage = messages.find(msg => !msg.isBot);
        if (firstUserMessage) {
            const content = firstUserMessage.text.trim();
            return content.length > 50 ? content.substring(0, 50) + '...' : content;
        }
        return 'Chat Session';
    };

    // Determine overall context from messages
    const determineOverallContext = () => {
        const userMessages = messages.filter(msg => !msg.isBot).map(msg => msg.text.toLowerCase());
        const allText = userMessages.join(' ');

        if (allText.includes('math') || allText.includes('calculate') || /\d+\s*[+\-*/]\s*\d+/.test(allText)) return 'math';
        if (allText.includes('science') || allText.includes('physics') || allText.includes('chemistry') || allText.includes('biology')) return 'science';
        if (allText.includes('study') || allText.includes('exam') || allText.includes('test')) return 'study_tips';
        if (allText.includes('homework') || allText.includes('assignment')) return 'assignment';
        return 'general';
    };

    // Load chat history
    const loadChatHistory = async () => {
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            const response = await fetch(
                `${baseApi}/ai-tutor/chat-history?limit=10&page=1`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setChatHistory(data.chatSessions || []);
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    // Load specific chat session
    const loadChatSession = async (sessionId) => {
        try {
            // Save current session before loading new one
            if (hasUnsavedChanges && currentSessionId && messages.length > 1) {
                await saveCurrentSession();
            }

            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`${baseApi}/ai-tutor/session/${sessionId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const session = data.chatSession;

                // Convert session messages to component format
                const loadedMessages = [
                    {
                        id: 0,
                        text: `Hello **${studentName}**! I'm your **AI Study Buddy** powered by **BeaconPort** 🎓\n\nI'm here to help you excel in your studies. You can ask me about:\n• **Math problems** and concepts\n• **Science** explanations\n• **Study tips** and techniques\n• **Assignment** help\n• **Exam** preparation\n\nWhat would you like to learn today?`,
                        isBot: true,
                        timestamp: new Date(session.startTime),
                    },
                ];

                session.messages.forEach((msg, index) => {
                    loadedMessages.push({
                        id: index + 1,
                        text: msg.content,
                        isBot: msg.role === "assistant",
                        timestamp: new Date(msg.timestamp),
                    });
                });

                setMessages(loadedMessages);
                setCurrentSessionId(sessionId);
                setHasUnsavedChanges(false);
                setShowHistory(false);
            }
        } catch (error) {
            console.error("Error loading chat session:", error);
        }
    };

    // Delete chat session
    const deleteChatSession = async (sessionId) => {
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;

            const response = await fetch(`${baseApi}/ai-tutor/session/${sessionId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Refresh chat history
                loadChatHistory();

                // If current session was deleted, reset to new session
                if (sessionId === currentSessionId) {
                    startNewChat();
                }
            }
        } catch (error) {
            console.error("Error deleting chat session:", error);
        }
    };

    // Test connection when component mounts
    useEffect(() => {
        testConnection();
        loadChatHistory();
    }, []);

    // AI API Integration Function
    const callAIAPI = async (userMessage) => {
        try {
            const token =
                localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setConnectionStatus("error");
                setLastError("Authentication required");
                throw new Error("Authentication required");
            }

            console.log("Sending request to AI tutor API...");

            // Prepare previous messages for context (last 10 messages)
            const previousMessages = messages.slice(-10).map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.text,
                timestamp: msg.timestamp.toISOString(),
            }));

            const response = await fetch(`${baseApi}/ai-tutor/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: determineContext(userMessage),
                    previous_messages: previousMessages,
                    sessionId: currentSessionId,
                }),
            });

            const data = await response.json();
            console.log("API Response:", data);

            if (!response.ok) {
                setConnectionStatus("error");
                if (response.status === 401) {
                    setLastError("Authentication failed");
                    throw new Error("Please log in to use the AI tutor");
                } else if (response.status === 503) {
                    setLastError("AI service temporarily unavailable");
                    throw new Error(data.message || "AI service is temporarily unavailable");
                } else {
                    setLastError(data.message || "AI service error");
                    throw new Error(data.message || "AI service error");
                }
            }

            // Update session ID if provided
            if (data.sessionId && data.sessionId !== currentSessionId) {
                setCurrentSessionId(data.sessionId);
                setHasUnsavedChanges(true);
                // Refresh chat history to include new session
                loadChatHistory();
            }

            setConnectionStatus("connected");
            setLastError(null);
            setHasUnsavedChanges(true);

            return data.response || "I apologize, but I'm having trouble processing your request right now. Please try again.";
        } catch (error) {
            console.error("API call error:", error);

            if (error.message.includes("Authentication")) {
                setConnectionStatus("error");
                return "Please log in to use the AI tutor service.";
            } else {
                setConnectionStatus("error");
                return error.message || "AI service is currently unavailable. Please try again later.";
            }
        }
    };

    // Determine context based on user message
    const determineContext = (message) => {
        const text = message.toLowerCase();
        if (
            text.includes("math") ||
            text.includes("calculate") ||
            text.includes("equation") ||
            text.includes("solve") ||
            /\d+\s*[+\-*/]\s*\d+/.test(text)
        )
            return "math";
        if (
            text.includes("science") ||
            text.includes("physics") ||
            text.includes("chemistry") ||
            text.includes("biology")
        )
            return "science";
        if (
            text.includes("study") ||
            text.includes("exam") ||
            text.includes("test")
        )
            return "study_tips";
        if (text.includes("homework") || text.includes("assignment"))
            return "assignment";
        if (text.includes("exam") || text.includes("preparation"))
            return "exam_prep";
        return "general";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messageText = inputValue;
        if (!messageText.trim()) return;

        // Check if AI service is available before proceeding
        if (connectionStatus !== "connected") {
            const errorResponse = {
                id: Date.now() + 1,
                text: "**AI service is currently unavailable.** Please wait for the service to be restored and try again. 🤖",
                isBot: true,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
            return;
        }

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: messageText,
            isBot: false,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Call AI API
            const aiResponse = await callAIAPI(messageText);

            const botResponse = {
                id: Date.now() + 1,
                text: aiResponse,
                isBot: true,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorResponse = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble responding right now. **Please try again.** 🤖",
                isBot: true,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Refresh connection status when opening
            testConnection();
        }
    };

    // Close chatbot but keep current chat (minimize)
    const minimizeChat = async () => {
        // Save current session before minimizing
        if (hasUnsavedChanges && currentSessionId && messages.length > 1) {
            await saveCurrentSession();
        }
        setIsOpen(false);
    };

    // Close chat and clear history (X button)
    const closeAndClearChat = async () => {
        // Save current session before clearing
        if (hasUnsavedChanges && currentSessionId && messages.length > 1) {
            await saveCurrentSession();
        }

        setIsOpen(false);
        setCurrentSessionId(null);
        setMessages([
            {
                id: 1,
                text: `Hello **${studentName}**! I'm your **AI Study Buddy** powered by **BeaconPort** 🎓\n\nI'm here to help you excel in your studies. You can ask me about:\n• **Math problems** and concepts\n• **Science** explanations\n• **Study tips** and techniques\n• **Assignment** help\n• **Exam** preparation\n\nWhat would you like to learn today?`,
                isBot: true,
                timestamp: new Date(),
            },
        ]);
        setHasUnsavedChanges(false);
        setShowHistory(false);
    };

    const startNewChat = async () => {
        // Save current session before starting new one
        if (hasUnsavedChanges && currentSessionId && messages.length > 1) {
            await saveCurrentSession();
        }

        setCurrentSessionId(null);
        setMessages([
            {
                id: 1,
                text: `Hello **${studentName}**! I'm your **AI Study Buddy** powered by **BeaconPort** 🎓\n\nI'm here to help you excel in your studies. You can ask me about:\n• **Math problems** and concepts\n• **Science** explanations\n• **Study tips** and techniques\n• **Assignment** help\n• **Exam** preparation\n\nWhat would you like to learn today?`,
                isBot: true,
                timestamp: new Date(),
            },
        ]);
        setHasUnsavedChanges(false);
        setShowHistory(false);
    };

    // Manual save function
    const handleManualSave = async () => {
        if (currentSessionId && messages.length > 1) {
            await saveCurrentSession();
        }
    };

    // Resize handlers
    const handleResizeStart = (e) => {
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: chatSize.width,
            height: chatSize.height,
        });
        e.preventDefault();
    };

    const handleResizeMove = (e) => {
        if (!isResizing) return;

        const deltaX = resizeStart.x - e.clientX;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(400, Math.min(800, resizeStart.width + deltaX));
        const newHeight = Math.max(400, Math.min(800, resizeStart.height + deltaY));

        setChatSize({ width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleResizeMove);
            document.addEventListener("mouseup", handleResizeEnd);
            return () => {
                document.removeEventListener("mousemove", handleResizeMove);
                document.removeEventListener("mouseup", handleResizeEnd);
            };
        }
    }, [isResizing, resizeStart]);

    // Connection status indicator
    const getStatusColor = () => {
        switch (connectionStatus) {
            case "connected":
                return "bg-green-400";
            case "disconnected":
                return "bg-red-400";
            case "error":
                return "bg-red-400";
            case "checking":
                return "bg-yellow-400";
            default:
                return "bg-gray-400";
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case "connected":
                return "AI Connected";
            case "disconnected":
                return "AI Disconnected";
            case "error":
                return `AI Error${lastError ? `: ${lastError}` : ""}`;
            case "checking":
                return "Connecting...";
            default:
                return "Unknown Status";
        }
    };

    const retryConnection = async () => {
        setConnectionStatus("checking");
        await testConnection();
    };

    return (
        <div className="fixed bottom-6 z-1000 right-6">
            {/* Floating Chat Icon */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="cursor-pointer bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-black p-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 relative"
                >
                    <GraduationCap size={30} />
                    <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}
                    />
                    {hasUnsavedChanges && (
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className="bg-gray-900 border-2 border-amber-600 rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 relative"
                    style={{
                        width: `${chatSize.width}px`,
                        height: `${chatSize.height}px`,
                    }}
                >
                    {/* Resize Handle */}
                    <div
                        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize opacity-0 hover:opacity-100 bg-amber-600 rounded-br-lg transition-opacity"
                        onMouseDown={handleResizeStart}
                        title="Resize"
                    >
                        <Maximize2 size={12} className="text-black m-0.5" />
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-black p-4 flex items-center gap-3 rounded-t-lg">
                        <TutorIcon size={32} />
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold">AI Study Buddy</h2>
                            <div className="flex items-center gap-2 text-xs text-amber-900">
                                <div
                                    className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                                ></div>
                                <span className="truncate max-w-48">{getStatusText()}</span>
                                {isSaving && <RefreshCw size={12} className="animate-spin" />}
                            </div>
                        </div>
                        <div className="flex ">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="text-black cursor-pointer hover:text-[#2a2a40] hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 font-bold text-lg leading-none"
                                title="Chat History"
                            >
                                <History size={18} />
                            </button>
                            {hasUnsavedChanges && (
                                <button
                                    onClick={handleManualSave}
                                    disabled={isSaving}
                                    className="text-black cursor-pointer hover:text-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 font-bold text-lg leading-none disabled:opacity-50"
                                    title="Save Chat"
                                >
                                    <Save size={18} />
                                </button>
                            )}
                            <button
                                onClick={startNewChat}
                                className="text-black  hover:text-white cursor-pointer p-2 hover:bg-opacity-20 rounded-lg transition-all duration-200 font-bold text-lg leading-none"
                                title="New Chat"
                            >
                                <RefreshCw size={18} />
                            </button>
                            <button
                                onClick={minimizeChat}
                                className="text-black hover:text-white cursor-pointer p-2 hover:bg-opacity-20 rounded-lg transition-all duration-200 font-bold text-lg leading-none"
                                title="Minimize"
                            >
                                <Minus size={18} />
                            </button>
                            <button
                                onClick={closeAndClearChat}
                                className="text-black hover:text-white cursor-pointer p-2 hover:bg-opacity-20 rounded-lg transition-all duration-200 font-bold text-lg leading-none"
                                title="Close & Clear"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Connection Error Banner */}
                    {connectionStatus === "error" && (
                        <div className="bg-red-600 text-white p-2 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            <span className="flex-1 truncate">{lastError || "AI service error"}</span>
                            <button
                                onClick={retryConnection}
                                className="text-white hover:text-red-200 underline text-xs"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Chat History Modal */}
                    {showHistory && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-50 rounded-lg flex flex-col">
                            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-black p-4 flex items-center gap-3 rounded-t-lg">
                                <History size={24} />
                                <h3 className="text-lg font-semibold flex-1">Chat History</h3>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="text-black hover:text-white p-1 rounded"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <History size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No chat history found</p>
                                        <p className="text-sm mt-2">Start a conversation to see your chat sessions here!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {chatHistory.map((session) => (
                                            <div
                                                key={session.sessionId}
                                                className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
                                                onClick={() => loadChatSession(session.sessionId)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-white truncate">
                                                            {session.title || 'Chat Session'}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(session.startTime).toLocaleDateString()}{' '}
                                                            {new Date(session.startTime).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {session.messageCount} messages • {session.context}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteChatSession(session.sessionId);
                                                        }}
                                                        className="text-gray-400 hover:text-red-400 p-1"
                                                        title="Delete Session"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                {session.lastMessage && (
                                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                                        {session.lastMessage.length > 100
                                                            ? session.lastMessage.substring(0, 100) + '...'
                                                            : session.lastMessage}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.isBot ? "justify-start" : "justify-end"
                                    }`}
                            >
                                <div>
                                    {message.isBot && <TutorIcon />}
                                </div>
                                <div>
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${message.isBot
                                            ? "bg-gray-700 text-gray-100 border border-amber-600/30"
                                            : "bg-gradient-to-r from-amber-600 to-orange-600 text-black"
                                            }`}
                                    >
                                        <MessageContent message={message} isBot={message.isBot} />
                                    </div>
                                    <div
                                        className={`text-xs mt-2 opacity-70 ${message.isBot ? "text-gray-400" : "text-amber-900"
                                            }`}
                                    >
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                                {!message.isBot && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {studentName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <TutorIcon />
                                <div className="bg-gray-700 text-gray-100 border border-amber-600/30 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={
                                    connectionStatus === "connected"
                                        ? `Ask me anything, ${studentName}...`
                                        : "AI service unavailable..."
                                }
                                disabled={connectionStatus !== "connected" || isLoading}
                                className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={
                                    !inputValue.trim() ||
                                    connectionStatus !== "connected" ||
                                    isLoading
                                }
                                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-black p-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-300"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        {hasUnsavedChanges && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-blue-400">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span>Unsaved changes • Auto-save in progress...</span>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;