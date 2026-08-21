import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../../components/icons/back/Back";
import { RootState } from "../../../redux/store";
import AccountInfoTab from "./AccountInfoTab";
import PublicProfileTab from "../publicProfile/PublicProfileTab";

type ProfileTab = "account" | "public";

const UserProfile = () => {
  const navigate = useNavigate();
  const loginUserRole = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails?.user?.role,
  );
  const isProvider = loginUserRole === "provider";
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");

  const tabClass = (tab: ProfileTab) =>
    `px-4 py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
      activeTab === tab
        ? "border-primaryColorDark text-primaryColorDark"
        : "border-transparent text-textGreyColor hover:text-textColor"
    }`;

  return (
    <OutletLayout
      heading="My Profile"
      backButton={<BackIcon onClick={() => navigate(-1)} />}
    >
      {isProvider && (
        <div className="flex gap-x-2 border-b border-lightGreyColor mb-6 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={tabClass("account")}
          >
            Account Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("public")}
            className={tabClass("public")}
          >
            Public Profile
          </button>
        </div>
      )}

      {isProvider && activeTab === "public" ? (
        <PublicProfileTab />
      ) : (
        <AccountInfoTab />
      )}
    </OutletLayout>
  );
};

export default UserProfile;
