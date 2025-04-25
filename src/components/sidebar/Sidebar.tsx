import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { ClientSidebarData, ProviderSidebarData } from "../../constantData/SidebarData";
import { TbLogout } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { IconType } from "react-icons";

interface sideBarDataType {
    name?: string
    url?: string
    icon?: IconType
}
const Sidebar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserRole = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role)
    const [sideBarData, setSideBarData] = useState<sideBarDataType[]>()
    const logoutFunction = () => {
        localStorage.removeItem("token")
        navigate("/")
    }
    useEffect(() => {
        if (loginUserRole === "client") {
            setSideBarData(ClientSidebarData)
        } else {
            setSideBarData(ProviderSidebarData)
        }
    }, [loginUserRole])
    return (
        <div className="p-6 border-r border-[#D9D9D9] w-[100vw] md:w-[260px] h-[100vh]">
            <div className="flex items-center justify-between">
                <img src={logo} alt="logo" className="w-[50px] md:w-[70px] lg:w-auto" />
                <div className="md:hidden">
                    {isSideBarClose === true && <RxCross2 size={24} onClick={() => dispatch(isSideBarCloseReducser(false))} />}
                </div>
            </div>
            <div className="mt-8 flex flex-col  justify-between h-[85vh]">
                <div className="flex flex-col gap-y-4">
                    {sideBarData && sideBarData.map((data, id: number) => {
                        const Icon = data.icon;

                        return (
                            <NavLink
                                to={data.url ? data.url : "#"}
                                key={id}
                                className={({ isActive }) =>
                                    `flex items-center font-[Poppins] text-[14px] md:text-[16px] gap-3 rounded-md font-medium transition-all ${isActive
                                        ? "bg-primaryColorDark text-white px-3 py-2"
                                        : "text-textColor hover:bg-primaryColorLight px-3 py-2"
                                    }`
                                }
                                onClick={() => dispatch(isSideBarCloseReducser(false))}
                            >
                                {Icon && <Icon className="text-[24px]" />}
                                {data.name}
                            </NavLink>
                        );
                    })}
                </div>
                <TbLogout className="text-[24px] text-textColor ml-3 cursor-pointer" onClick={logoutFunction} />
            </div>
        </div>
    );
};

export default Sidebar;
