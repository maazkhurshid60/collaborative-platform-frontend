import { Plus, MessageSquare, Share2, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actionCards = [
  {
    icon: Plus,
    title: "Add New Client",
    iconColor: "text-teal-600",
    bgColor: "bg-teal-100",
    url: "/clients/add-client",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    url: "/chat",
  },
  {
    icon: Share2,
    title: "Share Document",
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    url: "/document-sharing",
  },
  {
    icon: Bot,
    title: "Chat with AI",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    url: "/chat-with-ai",
  },
];

const DashboardActionCardSection = () => {
  const navigate = useNavigate();

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-gray-100">
      <div className="grid grid-cols-2 gap-4 h-full">
        {actionCards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation(card.url)}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bgColor} ${card.iconColor} mb-3`}
              >
                <CardIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-800">{card.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DashboardActionCardSection;
