import { NavLink } from "react-router-dom";
import logo from "../../../public/assets/logo.png";
import {
  ClientSidebarData,
  ProviderSidebarData,
  SuperAdminSidebarData,
} from "../../constantData/SidebarData";
import { RxCross2 } from "react-icons/rx";
import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { SVGProps, useEffect, useState } from "react";
import LogoutButton from "../ui/LogoutButton";

interface sideBarDataType {
  name?: string;
  url?: string;
  icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
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

  return (
    <div className="p-6 border-r flex flex-col border-[#D9D9D9] w-screen md:w-[260px] h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center ml-10 justify-between">
        <img src={logo} alt="logo" className="w-[200px] md:w-[120px]" />
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
      <div className="mt-8 flex flex-col gap-y-4 flex-1">
        {sideBarData &&
          sideBarData.map((data, id: number) => {
            return (
              <NavLink
                to={data.url ?? "#"}
                key={id}
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
            );
          })}
      </div>
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
