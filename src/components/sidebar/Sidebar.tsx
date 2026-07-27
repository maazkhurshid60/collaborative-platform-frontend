import { NavLink } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { SVGProps, useEffect, useState } from "react";

import logo from "../../../public/assets/logo.png";
import {
  ClientSidebarData,
  ProviderSidebarData,
  SuperAdminSidebarData,
} from "../../constantData/SidebarData";

import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import { AppDispatch, RootState } from "../../redux/store";
import LogoutButton from "../ui/LogoutButton";

interface sideBarDataType {
  name?: string;
  url?: string;
  icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
  subItems?: Array<{ name: string; url: string }>;
}
const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSideBarClose = useSelector(
    (state: RootState) => state.sideBarSlice.isSideBarClose,
  );
  const loginUserRole = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails?.user?.role,
  );
  const [sideBarData, setSideBarData] = useState<sideBarDataType[]>();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (loginUserRole === "client") {
      setSideBarData(ClientSidebarData);
    } else if (loginUserRole === "provider") {
      setSideBarData(ProviderSidebarData);
    } else if (loginUserRole === "superAdmin") {
      setSideBarData(SuperAdminSidebarData);
    }

    dispatch(isSideBarCloseReducser(false));
  }, [loginUserRole]);

  const toggleDropdown = (name: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="py-6 px-4 border-r flex flex-col border-[#D9D9D9] w-screen md:w-65 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center ml-10 justify-between">
        <img src={logo} alt="logo" className="w-50 md:w-30" />
        <div className="md:hidden">
          {isSideBarClose === true && (
            <RxCross2
              size={24}
              onClick={() => dispatch(isSideBarCloseReducser(false))}
            />
          )}
        </div>
      </div>

      {/* Nav items */}
      <div className="mt-8 flex flex-col gap-y-2 flex-1">
        {sideBarData &&
          sideBarData.map((data, id: number) => {
            const hasSubItems = !!data.subItems;
            const isDropdownOpen = !!openDropdowns[data.name || ""];

            return (
              <div key={id} className="flex flex-col gap-y-1">
                {hasSubItems ? (
                  <button
                    type="button"
                    onClick={() => toggleDropdown(data.name || "")}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md font-medium text-[14px] md:text-[16px] text-textColor hover:bg-primaryColorLight w-full text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {data.icon && (
                        <data.icon
                          className="w-6 h-6"
                          stroke="#2C2C2C"
                        />
                      )}
                      {data.name}
                    </div>
                    {/* Chevron Indicator */}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : (
                  <NavLink
                    to={data.url ?? "#"}
                    className={({ isActive }) => {
                      const isActiveClasses = isActive
                        ? "bg-primaryColorDark text-white"
                        : "text-textColor hover:bg-primaryColorLight";

                      return `flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[14px] md:text-[16px] transition-all ${isActiveClasses}`;
                    }}
                    onClick={() => dispatch(isSideBarCloseReducser(false))}
                  >
                    {({ isActive }) => {
                      const Icon = data.icon;
                      return (
                        <>
                          {Icon && (
                            <Icon
                              className="w-6 h-6"
                              stroke={isActive ? "#fff" : "#2C2C2C"}
                            />
                          )}
                          {data.name}
                        </>
                      );
                    }}
                  </NavLink>
                )}

                {/* Render sub-items if present and open */}
                {data.subItems && isDropdownOpen && (
                  <div className="pl-8 flex flex-col gap-y-1 transition-all duration-200">
                    {data.subItems.map((sub, subId) => (
                      <NavLink
                        key={subId}
                        to={sub.url}
                        className={({ isActive }) => {
                          const isActiveClasses = isActive
                            ? "bg-primaryColorLight text-primaryColorDark font-semibold"
                            : "text-textColor/80 hover:bg-gray-100";

                          return `flex items-center px-3 py-1.5 rounded-md text-[13px] md:text-[14px] transition-all ${isActiveClasses}`;
                        }}
                        onClick={() => dispatch(isSideBarCloseReducser(false))}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>


      <LogoutButton />
    </div>
  );
};

export default Sidebar;
