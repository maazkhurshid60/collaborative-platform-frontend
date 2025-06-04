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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClientType } from '../../types/clientType/ClientType';
import clientApiService from '../../apiServices/clientApi/ClientApi';
import AddIcon from '../icons/add/Add';
import { toast } from 'react-toastify';
import Loader from '../loader/Loader';

const Navbar = () => {
    const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const dispatch = useDispatch<AppDispatch>()
    const [isDropDownOpen, setIsDropDownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [searchByCNIC, setSearchByCNIC] = useState('')
    const [filteredClients, setFilteredClients] = useState<ClientType[]>()
    const [isLoader, setIsLoader] = useState(false)
    const queryClient = useQueryClient()
    const formData = new FormData();

    console.log("previre navbar", filteredClients);
    const { data: clientData } = useQuery<ClientType[]>({
        queryKey: ["allclients"],
        queryFn: async () => {
            try {
                const response = await clientApiService.getAllTotalClient();
                return response?.data?.clients; // Ensure it always returns an array
            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })
    useEffect(() => {
        if (searchByCNIC !== '') {
            const filteredClients = clientData?.filter((client) =>
                client.user?.cnic?.toLowerCase()?.includes(searchByCNIC?.toLowerCase())
            );
            setFilteredClients(filteredClients)
        } else {
            setFilteredClients([])
        }
    }, [searchByCNIC])

    useEffect(() => {
        if (loginUserDetail?.user?.profileImage !== "null") {
            // const imagePath = `${localhostBaseUrl}uploads/eSignatures/${loginUserDetail?.user?.profileImage?.split('/').pop()}`
            // const url = generateImgUrl(loginUserDetail?.user?.profileImage);
            setPreviewUrl(loginUserDetail?.user?.profileImage)
        } else {
            setPreviewUrl(null)
        }

    }, [loginUserDetail])
    // console.log("loginUserDetail>>>>>>>>>>>>>>>>>", loginUserDetail);
    const addClientFun = (data: ClientType) => {
        updateMutation.mutate(data)
    }


    const updateMutation = useMutation({

        mutationFn: async (data: ClientType) => {



            formData.append("fullName", data?.user?.fullName ?? "");
            formData.append("cnic", data?.user?.cnic ?? "");
            formData.append("age", data?.user?.age ?? "18");
            formData.append("email", data?.email ?? "");
            formData.append("contactNo", data?.user?.contactNo ?? "00000000000000");
            formData.append("address", data?.user?.address ?? "No Address");
            formData.append("gender", data?.user?.gender ?? "");
            formData.append("status", data?.user?.status ?? "");
            formData.append("role", "client");
            formData.append("providerId", loginUserDetail.id);


            formData.append("profileImage", data?.user?.profileImage ?? "");

            await clientApiService.addClientApi(formData);
        },
        onMutate: () => {
            setIsLoader(true);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success("New Client has added successfully")
            setSearchByCNIC("")
            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to add the client!');
            setIsLoader(false)
        },

    });
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
            {isLoader && <Loader text='Adding...' />}
            <div className='flex  items-center justify-between md:justify-end md:gap-x-40 bg-white px-3 py-3'>
                <div className="block md:hidden">
                    {isSideBarClose === false && <IoMdMenu size={24} onClick={() => dispatch(isSideBarCloseReducser(true))} />}

                </div>
                <div className='hidden md:block lg:w-[500px] xl:w-[507px] md:relative'>

                    <SearchBar placeholder='Search by CNIC' onChange={(e) => setSearchByCNIC(e.target.value)} value={searchByCNIC} />
                    {filteredClients && filteredClients?.length > 0 &&
                        < div className='w-[100%] rounded-lg bg-white   borderClass max-h-[500px]  overflow-y-auto absolute top-12 left-0 z-50' >
                            {filteredClients?.map(data =>
                                <div className='flex items-center justify-between   p-3    hover:bg-primaryColorLight  '     >
                                    <div className='flex items-center gap-x-5     '>
                                        {
                                            data?.user?.profileImage ? (
                                                <img
                                                    src={data?.user?.profileImage}
                                                    alt="Client"
                                                    className=" w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (<>

                                                <UserIcon className="text-[32px] md:text-[40px] lg:text-[30px]" />


                                            </>
                                            )
                                        }
                                        <p> {data?.user?.fullName}</p>
                                    </div>
                                    {!data?.providerList?.some(provider => provider.providerId === loginUserDetail.id) ? (
                                        <AddIcon onClick={() => addClientFun(data)} />

                                    ) : <p className='text-primaryColorDark'>Already Added in your list</p>}
                                </div>
                            )}
                        </div>
                    }


                </div>
                {/* ACCOUNT DROP DOWN */}
                <div className='flex items-center  relative gap-x-2 bg-white' ref={dropdownRef}>
                    {
                        previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Client"
                                className=" w-12 h-12 rounded-full object-fit"
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
        </div >

    )
}

export default Navbar