import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'




const DashboardLayout = () => {
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const searchByCNIC = useSelector((state: RootState) => state.LoginUserDetail.searchByCNIC)
    console.log("searchByCNICsearchByCNICsearchByCNICsearchByCNICsearchByCNICsearchByCNIC", searchByCNIC);

    return (
        <div className=" h-[100vh] flex ">
            {/* Fixed Sidebar */}
            <div
                className={`
    bg-white absolute md:relative z-50 transition-all duration-300 ease-in-out  
    ${isSideBarClose ? 'left-0' : '-left-[1000px]'} 
    md:left-0 
  `}
            >
                <Sidebar />
            </div>

            {/* Content area with a left margin to accommodate the fixed sidebar */}
            <div className=" flex-grow bg-gray-100 overflow-auto w-[80%]  ">
                <div className=" w-full h-[100vh] flex flex-col bg-dashboardMainBgColor">
                    {/* Fixed Navbar */}
                    <div className=" shadow-md z-40">
                        <Navbar />
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto sm:p-2 bg-gray-100  ">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default DashboardLayout

