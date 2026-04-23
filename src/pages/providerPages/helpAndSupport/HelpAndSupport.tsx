import { useState } from "react";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import { RiArrowLeftSLine } from "react-icons/ri";

type HelpItem = {
  name: string;
  data: React.ReactNode[];
};

const HelpAndSupport = () => {
  const helpData = [
    {
      name: "Release Notes",
      data: [
        "A redesigned dashboard for faster access to providers, clients, and chats.",
        "Improved collaboration features with real-time messaging.",
        "Performance enhancements and minor bug fixes for a smoother experience.",
      ],
    },
    {
      name: "Sign-in Issues?",
      data: [
        "Ensure your email and password are entered correctly.",
        "If you forgot your password, use the 'Forgot Password' option to reset it.",
        "If your account is locked or access is restricted.",
        <>Contact Support Email: <a href="mailto:katelin@kolabme.com" className="text-[#2C9993] hover:underline font-medium">katelin@kolabme.com</a></>
      ],
    },
    {
      name: "Who can use this platform?",
      data: [
        "Licensed healthcare providers such as nutritionists, eye specialists, and heart specialists.",
        "Administrative staff managing clients and providers.",
        "Authorized professionals collaborating on patient care.such as providers, clients, and other healthcare professionals.",
      ],
    },
    {
      name: "How many members does the platform support?",
      data: [
        "Currently we offer 1 Standard plan for 100 members for free and 1000 memebers for standard plan",
        "There is no fixed limit for users; capacity scales based on your subscription plan.",
        "Contact support for enterprise-level usage requirements.",
      ],
    },
    {
      name: "How to add Profile and specialty?",
      data: [
        "Navigate to your User Profile Image from the sidebar.",
        "Edit your professional details including Profile Image and specialty.",
        "Update your profile across the platform.",
      ],
    },
    {
      name: "How to restrict offensive messages?",
      data: [
        "Moderation features (e.g., reporting and content monitoring) are currently under development.",
      ],
    },
    {
      name: "How do I delete my account?",
      data: [
        "Go to Settings (top-right dropdown menu).",
        "Select “Delete my account.”",
        "Confirm your decision by clicking the Delete button.",
        "Note: Deleting your account is immediate and cannot be undone."
      ],
    },
  ];


  // null = none open, number = index open
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <OutletLayout heading="Help & Support">
      <div className="flex flex-col gap-4 mt-6">
        {helpData.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#2C9993] bg-[#F4FAFA] shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none cursor-pointer"
              >
                <span className={`text-[15px] sm:text-[16px] font-semibold pr-4 ${isOpen ? 'text-[#2C9993]' : 'text-textColor'}`}>
                  {item.name}
                </span>

                <RiArrowLeftSLine
                  className={`text-2xl transition-transform duration-300 shrink-0 ${isOpen ? 'text-[#2C9993] -rotate-90' : 'text-textGreyColor rotate-180'}`}
                />
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5 pt-1 text-[#666666]">
                  <ul className="list-disc pl-5 space-y-2">
                    {item.data.map((line, lineIdx) => (
                      <li key={lineIdx} className="text-[13px] md:text-[14px] leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </OutletLayout>
  );
};

export default HelpAndSupport;
