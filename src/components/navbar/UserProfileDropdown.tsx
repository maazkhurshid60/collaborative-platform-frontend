import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { ArrowRight, UserIcon } from "lucide-react";

import { AppDispatch, RootState } from "@/redux/store";
import authService from "@/apiServices/authApi/AuthApi";
import { disconnectSocket } from "@/socket/Socket";
import { emptyResult } from "@/redux/slices/LoginUserDetailSlice";

const UserProfileDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (
      loginUserDetail?.user?.profileImage &&
      loginUserDetail?.user?.profileImage !== "null"
    ) {
      setPreviewUrl(loginUserDetail?.user?.profileImage);
    } else {
      setPreviewUrl(null);
    }
  }, [loginUserDetail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropDownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userspeciality = useMemo(() => {
    const specialtyName = loginUserDetail?.speciality;
    if (!specialtyName) return "";

    return specialtyName
      .split(" ")
      .map((word: string) => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }, [loginUserDetail?.speciality]);

  const isSuperAdmin = loginUserDetail?.user?.role === "superAdmin";
  const isProvider = loginUserDetail?.user?.role === "provider";

  const goToClientAndProviderAndSuperAdmin = () => {
    if (loginUserDetail?.user?.role === "client") {
      navigate("/settings");
    }
    if (loginUserDetail?.user?.role === "provider") {
      navigate("/user-profile");
    }
    if (loginUserDetail?.user?.role === "superAdmin") {
      navigate("/super-admin");
    }
  };

  const logoutFunction = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Backend logout failed", error);
    }

    disconnectSocket();

    localStorage.clear();
    sessionStorage.clear();

    const clearCaches =
      "caches" in window
        ? caches
            .keys()
            .then((names) =>
              Promise.all(names.map((name) => caches.delete(name))),
            )
        : Promise.resolve();

    const unregisterServiceWorkers =
      "serviceWorker" in navigator
        ? navigator.serviceWorker
            .getRegistrations()
            .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        : Promise.resolve();

    Promise.all([clearCaches, unregisterServiceWorkers]).then(() => {
      dispatch(emptyResult());
      navigate("/");
      window.location.reload();
    });
  };

  return (
    <div
      className={`flex items-center relative gap-x-2 bg-white ${
        isSuperAdmin ? "cursor-pointer" : "cursor-pointer"
      }`}
      ref={dropdownRef}
      role={isSuperAdmin ? "button" : undefined}
      tabIndex={isSuperAdmin ? 0 : undefined}
      onClick={goToClientAndProviderAndSuperAdmin}
      onKeyDown={(e) => {
        if (isSuperAdmin && e.key === "Enter")
          goToClientAndProviderAndSuperAdmin();
      }}
    >
      {isProvider && (
        <div>
          <span
            title={`Your account is ${
              loginUserDetail?.user?.isApprove === "APPROVED"
                ? "Verified"
                : "Unverified"
            }`}
            className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${
              loginUserDetail?.user?.isApprove === "APPROVED"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {loginUserDetail?.user?.isApprove === "APPROVED"
              ? "Verified"
              : "Unverified"}
          </span>
        </div>
      )}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <UserIcon className="text-[28px] w-10 h-10 md:text-[32px] lg:text-[36px]" />
      )}

      <div className="flex items-center lg:gap-x-4 bg-white z-20">
        <div className="font-[Montserrat]">
          <p className="text-gray-800 font-bold text-[12px] md:text-[14px] lg:text-[16px] capitalize">
            {isSuperAdmin
              ? (() => {
                  const fullName = loginUserDetail?.user?.fullName || "";
                  const words = fullName.split(" ");
                  const firstName = words[0];
                  return firstName ? `${firstName}...` : "";
                })()
              : `${loginUserDetail?.user?.fullName?.slice(0, 8) || ""}${
                  loginUserDetail?.user?.fullName &&
                  loginUserDetail.user.fullName.length > 8
                    ? "..."
                    : ""
                }`}
          </p>

          <p className="text-gray-500 font-medium text-sm -mt-1.5">
            {isSuperAdmin
              ? "Super Admin"
              : loginUserDetail?.speciality
                ? userspeciality
                : "Client"}
          </p>
        </div>

        {/* dropdown only for provider */}
        {isProvider && (
          <div className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <IoIosArrowDown
              className={`text-textColor transition-all duration-700 ease-in-out ${
                isDropDownOpen ? "rotate-180" : "rotate-0"
              } cursor-pointer`}
              size={22}
              onClick={(e) => {
                e.stopPropagation(); // prevent click bubbling to profile area
                setIsDropDownOpen(!isDropDownOpen);
              }}
            />
          </div>
        )}
      </div>

      <ul
        onClick={(e) => e.stopPropagation()}
        className={`bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] -z-10 p-1 mt-0.5 rounded-[10px] flex flex-col font-[Poppins] text-[12px] md:text-[14px] lg:text-[16px] absolute right-0 transition-all duration-700 ease-in-out 
      ${
        isDropDownOpen
          ? "opacity-100 translate-y-2 top-11.25 md:top-12.5 z-20"
          : "opacity-0 hidden z-0 -translate-y-3 pointer-events-none -top-20"
      }`}
      >
        <Link
          onClick={() => setIsDropDownOpen(false)}
          className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass"
          to="/notification"
        >
          Notifications
        </Link>
        <Link
          onClick={() => setIsDropDownOpen(false)}
          className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass"
          to="/setting"
        >
          Settings
        </Link>
        <Link
          onClick={() => setIsDropDownOpen(false)}
          className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass"
          to="/help-and-support"
        >
          Help & Support
        </Link>
        <li
          onClick={() => {
            setIsDropDownOpen(false);
            logoutFunction();
          }}
          className="cursor-pointer py-2 px-3 rounded-[10px] hover:bg-red-200 list-none flex items-start gap-x-8"
        >
          <p>Logout</p>
          <ArrowRight className="text-red-900" />
        </li>
      </ul>
    </div>
  );
};

export default UserProfileDropdown;
