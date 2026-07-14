import { useState, useRef, useEffect } from "react";
import { Bot, User, PanelLeft } from "lucide-react";
import { IoIosSend } from "react-icons/io";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import ChatHistorySidebar from "./ChatHistorySidebar";

const DUMMY_CHATS = [
  { id: 1, title: "Invoice Automation Help", date: "Today" },
  { id: 2, title: "Drafting client emails", date: "Yesterday" },
  { id: 3, title: "Schedule optimization", date: "Previous 7 Days" },
  {
    id: 4,
    title: "Tips for retaining clients from linkedin and facebook",
    date: "Previous 7 Days",
  },
];

const ChatWithAI = () => {
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; content: string }[]
  >([
    {
      role: "ai",
      content: "Hello! How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { role: "user", content: input },
      {
        role: "ai",
        content:
          "This is a placeholder AI response. Please connect an actual AI backend to get real responses.",
      },
    ]);
    setInput("");
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: "ai",
        content: "Hello! How can I assist you today?",
      },
    ]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /*
  return (
    <OutletLayout heading="Chat with AI" isWhiteColor={false}>
      <div className="flex h-[calc(100vh-200px)] gap-4 -mt-7 relative">
        <ChatHistorySidebar
          isOpen={isSidebarOpen}
          chatHistory={DUMMY_CHATS}
          onNewChat={handleNewChat}
          onToggle={toggleSidebar}
        />

        // Chat Area
        <div className="flex-1 flex flex-col  rounded-2xl p-6 shadow-sm border bg-white border-gray-100 min-w-0 relative">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-4 left-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer z-10"
              title="Open Sidebar"
            >
              <PanelLeft size={20} />
            </button>
          )}

          <div
            className={`flex-1 overflow-y-auto mb-4  space-y-4 pr-2 ${!isSidebarOpen ? "mt-8" : ""}`}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-[#2C9993]/10 flex items-center justify-center shrink-0">
                    <Bot size={18} className="text-[#2C9993]" />
                  </div>
                )}
                <div
                  className={`py-2 px-3 rounded-2xl max-w-[70%] text-[15px] font-[Poppins] ${msg.role === "user" ? "bg-[#2C9993] text-white rounded-br-none" : "bg-[#F9FAFB] text-[#101828] border border-gray-100 rounded-bl-none"}`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                    <User size={18} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message to AI..."
              className="outline-none pl-4 p-2 w-full bg-gray-100 rounded-lg resize-none overflow-y-auto"
              rows={1}
            />
            <div className="flex items-center gap-x-4 p-2 shrink-0">
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-9 w-9 bg-primaryColorDark rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoIosSend size={20} className="cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </OutletLayout>
  );
  */

  return (
    <OutletLayout heading="Chat with AI" isWhiteColor={false}>
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-center">
          <Bot size={48} className="mx-auto text-[#2C9993] mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold text-gray-700 font-[Poppins]">Coming Soon</h2>
          <p className="text-gray-500 mt-2 font-[Poppins]">We are working hard to bring you the Chat with AI feature.</p>
        </div>
      </div>
    </OutletLayout>
  );
};

export default ChatWithAI;
