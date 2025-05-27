;
import { useEffect, useRef, useState } from 'react'
import SearchBar from '../searchBar/SearchBar'
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';

import { IoMdMenu } from "react-icons/io";
import { AppDispatch, RootState } from '../../redux/store';
import { isSideBarCloseReducser } from '../../redux/slices/SideBarSlice';
import { useNavigate } from 'react-router-dom';
import UserIcon from '../icons/user/User';
import { localhostBaseUrl } from '../../apiServices/baseUrl/BaseUrl';

const Navbar = () => {
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const dispatch = useDispatch<AppDispatch>()
    const [isDropDownOpen, setIsDropDownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    console.log("previre navbar", previewUrl);


    useEffect(() => {
        if (loginUserDetail?.user?.profileImage !== "null") {
            const imagePath = `${localhostBaseUrl}uploads/eSignatures/${loginUserDetail?.user?.profileImage?.split('/').pop()}`
            setPreviewUrl(imagePath)
        } else {
            setPreviewUrl(null)
        }

    }, [loginUserDetail])
    console.log("loginUserDetail>>>>>>>>>>>>>>>>>", previewUrl);

    useEffect(() => {
        const handleCickOutSide = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropDownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleCickOutSide)
        return () => {
            document.removeEventListener("mousedown", handleCickOutSide);
        };
    }, [])
    return (
        <div className='bg-white'>
            <div className='flex  items-center justify-between md:justify-end md:gap-x-40 bg-white px-3 py-3'>
                <div className="block md:hidden">
                    {isSideBarClose === false && <IoMdMenu size={24} onClick={() => dispatch(isSideBarCloseReducser(true))} />}

                </div>
                <div className='hidden md:block lg:w-[500px] xl:w-[507px]'> <SearchBar /></div>
                {/* ACCOUNT DROP DOWN */}
                <div className='flex items-center  relative gap-x-2 bg-white' ref={dropdownRef}>
                    {
                        previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Client"
                                className=" w-12 h-12 rounded-full object-cover"
                            />
                        ) : (

                            <UserIcon className="text-[32px] md:text-[40px] lg:text-[48px]" />

                        )
                    }

                    <div className='flex items-center gap-x-10 bg-white z-20'>
                        <div className='font-[Montserrat]'>
                            <p className=' text-textColor font-bold text-[16px] md:text-[18px] lg:text-[20px] capitalize'>{loginUserDetail?.user?.fullName}</p>
                            <p className='text-lightGreyColor font-medium text-[12px] md:text-[14px] lg:text-[16px] capitalize'>{loginUserDetail?.department ? loginUserDetail?.department : "Client"}</p>
                        </div>
                        <div className=''>
                            <IoIosArrowDown className={`text-textColor transition-all duration-700 ease-in-out  ${isDropDownOpen ? 'rotate-180' : 'rotate-0'} cursor-pointer`} size={22} onClick={() => setIsDropDownOpen(!isDropDownOpen)} />
                        </div>
                    </div>
                    {/* OPTIONS */}
                    <ul
                        className={`bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] -z-10  rounded-[10px] flex flex-col  font-[Poppins] text-[12px] md:text-[14px] lg:text-[16px]'> absolute right-0 transition-all duration-700 ease-in-out 
    ${isDropDownOpen ? 'opacity-100 translate-y-2  top-[45px] md:top-[50px] z-10' : 'opacity-0 hidden z-[0] -translate-y-3 pointer-events-none top-[-80px]'}
  `}
                    >
                        <li className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' onClick={() => { setIsDropDownOpen(false); navigate("/notification") }}>Notifications</li>
                        <li className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' onClick={() => { setIsDropDownOpen(false); navigate("/setting") }}>Settings</li>
                        <li className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' onClick={() => { setIsDropDownOpen(false); navigate("/help-and-support") }}>Help & Support</li>
                    </ul>
                </div>
            </div>
        </div>

    )
}

export default Navbar