import React from "react";
import { MessageSquare, Plus, PanelLeftClose } from "lucide-react";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  chatHistory: { id: number; title: string; date: string }[];
  onNewChat: () => void;
  onToggle: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  chatHistory,
  onNewChat,
  onToggle,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="md:hidden absolute inset-0 z-10 bg-black/10 rounded-2xl"
        onClick={onToggle}
      />
      <div className="absolute md:relative z-20 h-full left-0 w-70 md:w-75 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col shrink-0 transition-all duration-300">
        <div className="flex gap-2 mb-6">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#101828] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer"
          >
            <Plus size={18} />
            New Chat
          </button>
          <button
            onClick={onToggle}
            className="p-3 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-gray-600 border border-gray-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Close Sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between group p-3 hover:bg-[#F9FAFB] rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={16} className="text-gray-400 shrink-0" />
                  <span className="text-[14px] text-[#101828] font-[Poppins] truncate">
                    {chat.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistorySidebar;
