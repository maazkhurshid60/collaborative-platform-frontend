import { useState } from "react";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import { RiArrowLeftSLine } from "react-icons/ri";

type HelpItem = {
  name: string;
  data: string[];
};

const HelpAndSupport = () => {
  const helpData = [
  {
    name: "What's New",
    data: [
      "A redesigned dashboard for faster access to providers, clients, and chats.",
      "Improved collaboration features with real-time messaging.",
      "Performance enhancements and minor bug fixes for a smoother experience.",
    ],
  },
  {
    name: "Sign-in Issues",
    data: [
      "Ensure your email and password are entered correctly.",
      "If you forgot your password, use the 'Forgot Password' option to reset it.",
      "Contact support if your account is locked or access is restricted.",
    ],
  },
  {
    name: "Who can use this platform?",
    data: [
      "Licensed healthcare providers such as nutritionists, eye specialists, and heart specialists.",
      "Administrative staff managing clients and providers.",
      "Authorized professionals collaborating on patient care.",
    ],
  },
  {
    name: "How many members does the platform support?",
    data: [
      "The platform supports multiple providers and clients under one organization.",
      "There is no fixed limit for users; capacity scales based on your subscription plan.",
      "Contact support for enterprise-level usage requirements.",
    ],
  },
  {
    name: "How to add designation and department?",
    data: [
      "Navigate to your User Profile from the sidebar.",
      "Edit your professional details including designation and department.",
      "Save changes to update your profile across the platform.",
    ],
  },
  {
    name: "How to restrict offensive messages?",
    data: [
      "The system automatically monitors messages for inappropriate language.",
      "Users can report offensive content directly from the chat interface.",
      "Repeated violations may result in account suspension or restricted access.",
    ],
  },
  {
    name: "How do I delete my account?",
    data: [
      "Go to User Profile and select Account Settings.",
      "Submit an account deletion request.",
      "Your account and data will be permanently removed after verification.",
    ],
  },
];


  // null = none open, number = index open
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <OutletLayout heading="Help and support">
      {helpData.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={item.name}
            className="bg-inputBgColor p-2 rounded-[10px] text-textColor mt-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] md:text-[16px] font-medium w-[90%]">
                {item.name}
              </p>

              <RiArrowLeftSLine
                onClick={() => toggle(idx)}
                className={[
                  "text-xl sm:text-2xl md:text-3xl transition-transform duration-300",
                  "text-textGreyColor cursor-pointer",
                  isOpen ? "-rotate-90" : "rotate-180",
                ].join(" ")}
              />
            </div>

            {isOpen && (
              <div className="mt-2">
                {item.data.map((line, lineIdx) => (
                  <p key={`${item.name}-${lineIdx}`} className="text-xs md:text-sm mt-2">
                    {lineIdx + 1}- {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </OutletLayout>
  );
};

export default HelpAndSupport;
