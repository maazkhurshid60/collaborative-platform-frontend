import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../public/assets/kolabme-logo.svg";
import { ClientSidebarData, ProviderSidebarData, SuperAdminSidebarData } from "../../constantData/SidebarData";
import { RxCross2 } from "react-icons/rx";
import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { SVGProps, useEffect, useState } from "react";
import { disconnectSocket } from "../../socket/Socket";
import ToolTip from "../toolTip/ToolTip";
import { emptyResult } from "../../redux/slices/LoginUserDetailSlice";
import Logout from "../icons/logout/Logout";

interface sideBarDataType {
    name?: string
    url?: string
    icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
}
const Sidebar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)
    const [sideBarData, setSideBarData] = useState<sideBarDataType[]>()
    // const logoutFunction = () => {
    //     disconnectSocket();
    //     localStorage.removeItem("token")
    //     dispatch(emptyResult())

    //     navigate("/")
    // }

    const logoutFunction = () => {
        disconnectSocket();
        localStorage.removeItem("token");

        const clearCaches = 'caches' in window
            ? caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
            : Promise.resolve();

        const unregisterServiceWorkers = 'serviceWorker' in navigator
            ? navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(reg => reg.unregister())))
            : Promise.resolve();

        Promise.all([clearCaches, unregisterServiceWorkers]).then(() => {
            dispatch(emptyResult());
            navigate("/");
            window.location.reload();
        });
    };

    useEffect(() => {
        if (loginUserRole === "client") {
            setSideBarData(ClientSidebarData)
        } else if (loginUserRole === "provider") {
            setSideBarData(ProviderSidebarData)
        } else if (loginUserRole === "superadmin") {

            setSideBarData(SuperAdminSidebarData)
        }
    }, [loginUserRole])
    return (
        <div className="p-6 border-r flex justify-between flex-col border-[#D9D9D9] w-[100vw] md:w-[260px] h-[100vh] overflow-y-hidden">
            <div className="flex items-center justify-center">
                <img src={logo} alt="logo" className="w-[50px] md:w-[120px] " />
                <div className="md:hidden">
                    {isSideBarClose === true && <RxCross2 size={24} onClick={() => dispatch(isSideBarCloseReducser(false))} />}
                </div>
            </div>
            <div className="mt-8 flex flex-col  justify-between h-[85vh]">
                <div className="flex flex-col gap-y-4">
                    {sideBarData && sideBarData.map((data, id: number) => {

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
              

            </div>
              <span className="relative group inline-block ml-3 cursor-pointer text-textColor w-max">

                    <Logout onClick={logoutFunction} />
                    <ToolTip toolTipText="Logout" />
                </span>
        </div>
    );
};

export default Sidebar;
