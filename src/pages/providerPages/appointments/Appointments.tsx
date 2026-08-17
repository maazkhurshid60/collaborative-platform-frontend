import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OutletLayout from "@/layouts/outletLayout/OutletLayout";
import BackIcon from "@/components/icons/back/Back";
import AvailabilityTab from "./AvailabilityTab";
import TimeOffTab from "./TimeOffTab";
import AppointmentsListTab from "./AppointmentsListTab";

const TABS = [
    { key: "availability", label: "Availability" },
    { key: "timeOff", label: "Time Off" },
    { key: "appointments", label: "Appointments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const Appointments = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>("availability");

    return (
        <OutletLayout heading="Appointments" backButton={<BackIcon onClick={() => navigate(-1)} />}>
            <div className="flex gap-1 border-b border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                            activeTab === tab.key
                                ? "border-primaryColorDark text-primaryColorDark"
                                : "border-transparent text-textGreyColor hover:text-textColor"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {activeTab === "availability" && <AvailabilityTab />}
                {activeTab === "timeOff" && <TimeOffTab />}
                {activeTab === "appointments" && <AppointmentsListTab />}
            </div>
        </OutletLayout>
    );
};

export default Appointments;
