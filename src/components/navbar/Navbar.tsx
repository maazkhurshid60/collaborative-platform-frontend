// ;
// import { useEffect, useMemo, useRef, useState } from 'react'
// import SearchBar from '../searchBar/SearchBar'
// import SearchResults from '../searchBar/SearchResults'
// import { IoIosArrowDown } from "react-icons/io";
// import { useDispatch, useSelector } from 'react-redux';
// import { IoMdMenu } from "react-icons/io";
// import { AppDispatch, RootState } from '../../redux/store';
// import { isSideBarCloseReducser } from '../../redux/slices/SideBarSlice';
// import UserIcon from '../icons/user/User';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { ClientType } from '../../types/clientType/ClientType';
// import clientApiService from '../../apiServices/clientApi/ClientApi';
// import providerApiService from '../../apiServices/providerApi/ProviderApi';
// import { toast } from 'react-toastify';
// import Loader from '../loader/Loader';
// import { Link } from 'react-router-dom';
// import { LuSearch } from 'react-icons/lu';

// const Navbar = () => {
//     const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose)
//     const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
//     const dispatch = useDispatch<AppDispatch>()
//     const [isDropDownOpen, setIsDropDownOpen] = useState(false)
//     const dropdownRef = useRef<HTMLDivElement>(null)
//     const searchRef = useRef<HTMLDivElement>(null)
//     const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//     const [searchQuery, setSearchQuery] = useState('')
//     const [filteredUsers, setFilteredUsers] = useState<ClientType[]>()
//     const [isSearchbarClose, setIsSearchbarClose] = useState(false)
//     const [isLoader, setIsLoader] = useState(false)
//     const [showSearchResults, setShowSearchResults] = useState(false)
//     const queryClient = useQueryClient()
//     const formData = new FormData();
//     const [screenWidth, setScreenWidth] = useState(window.innerWidth);

//     useEffect(() => {
//         const handleResize = () => setScreenWidth(window.innerWidth);

//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

    
//       const userDepartment = useMemo(() => {
//         const departmentName = loginUserDetail?.department;
//         if (!departmentName) return '';
    
//         // This splits the string into words, capitalizes the first letter of each,
//         // and joins them back together.
//         return departmentName
//             .split(' ')
//             .map(word => {
//                 if (!word) return ''; // Skips any empty strings from multiple spaces
//                 // Capitalizes the first letter and adds the rest of the word in lowercase.
//                 return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//             })
//             .join(' ');
//     }, [loginUserDetail?.department]);
    
//     const { data: clientData } = useQuery<ClientType[]>({
//         queryKey: ["allclients"],
//         queryFn: async () => {
//             try {
//                 const response = await clientApiService.getAllTotalClient();
//                 const verifiedUsers = response?.data?.clients?.filter((data: ClientType) => data?.user?.isApprove === "approve")
//                 return verifiedUsers || [];
//             } catch (error) {
//                 console.error("Error fetching clients:", error);
//                 return [];
//             }
//         }
//     })

//     const { data: providerData } = useQuery<ClientType[]>({
//         queryKey: ["allproviders"],
//         queryFn: async () => {
//             try {
//                 const response = await providerApiService.getAllTotalProviders();
//                 const verifiedProviders = response?.data?.providers?.filter((data: ClientType) => data?.user?.isApprove === "approve")
//                 return verifiedProviders || [];
//             } catch (error) {
//                 console.error("Error fetching providers:", error);
//                 return [];
//             }
//         }
//     })

//     const allUsers = useMemo(() => {
//         return [...(clientData || []), ...(providerData || [])];
//     }, [clientData, providerData]);
//     useEffect(() => {
//         if (searchQuery.trim() !== '') {
//             const searchTerm = searchQuery.toLowerCase();
//             const timeoutId = setTimeout(() => {
//                 const filtered = allUsers.filter((user) => {
//                     return (
//                         user.user?.licenseNo?.toLowerCase().includes(searchTerm) ||
//                         user.user?.fullName?.toLowerCase().includes(searchTerm) ||
//                         user.email?.toLowerCase().includes(searchTerm) ||
//                         user.user?.role?.toLowerCase().includes(searchTerm)
//                     );
//                 });

//                 setFilteredUsers(filtered);
//                 setShowSearchResults(true);
//             }, 300);

//             return () => clearTimeout(timeoutId);
//         }
//         setFilteredUsers([]);
//         setShowSearchResults(false);
//     }, [searchQuery, allUsers]);

//     useEffect(() => {
//         if (loginUserDetail?.user?.profileImage !== "null") {
//             setPreviewUrl(loginUserDetail?.user?.profileImage)
//         } else {
//             setPreviewUrl(null)
//         }

//     }, [loginUserDetail])
//     const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value);
//     };

//     const handleClearSearch = () => {
//         setSearchQuery('');
//         setFilteredUsers([]);
//         setShowSearchResults(false);
//     };

//     const addClientFun = (data: ClientType) => {
//         updateMutation.mutate(data);
//         handleClearSearch(); // Clear search after adding
//     }

//     const updateMutation = useMutation({

//         mutationFn: async (data: ClientType) => {
//             formData.append("fullName", data?.user?.fullName ?? "");
//             formData.append("licenseNo", data?.user?.licenseNo ?? "");
//             formData.append("age", data?.user?.age ?? "18");
//             formData.append("email", data?.email ?? "");
//             formData.append("contactNo", data?.user?.contactNo ?? "00000000000000");
//             formData.append("address", data?.user?.address ?? "No Address");
//             formData.append("gender", data?.user?.gender ?? "");
//             formData.append("status", data?.user?.status ?? "");
//             formData.append("country", data?.user?.country ?? "");
//             formData.append("state", data?.user?.state ?? "");
//             formData.append("role", "client");
//             formData.append("isApprove", "pending");
//             formData.append("providerId", loginUserDetail.id);
//             formData.append("profileImage", data?.user?.profileImage ?? "");
//             await clientApiService.addExistingClientToProvider(formData);
//         },
//         onMutate: () => {
//             setIsLoader(true);
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['clients'] });
//             queryClient.invalidateQueries({ queryKey: ['allclients'] });
//             queryClient.invalidateQueries({ queryKey: ['allproviders'] });
//             toast.success("User has been added successfully")
//             handleClearSearch();
//             setIsLoader(false)
//         },
//         onError: () => {
//             toast.error('Failed to add the client!');
//             setIsLoader(false)
//         },

//     });
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setIsDropDownOpen(false);
//             }
//             if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
//                 setShowSearchResults(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside)
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [])

//     return (
//         <div className='bg-white'>
//             {isLoader && <Loader text='Adding...' />}
//             <div className='flex w-full items-center justify-between xl:justify-end xl:gap-x-96 bg-white px-3 py-3'>

//                 <div className="block md:hidden">
//                     {isSideBarClose === false && <IoMdMenu size={24} onClick={() => dispatch(isSideBarCloseReducser(true))} />}

//                 </div>
//                 <div
//                     className={`relative transition-all duration-300 ease-in-out  ${screenWidth < 768
//                         ? isSearchbarClose
//                             ? 'w-[280px]'
//                             : 'w-[35px]'
//                         : ' md:w-full md:max-w-[280px] lg:max-w-[450px] xl:max-w-[500px]'
//                         }`}
//                     ref={searchRef}
//                 >
//                     {loginUserDetail?.user?.role === "provider" && (
//                         <div className={`relative`}>
//                             {screenWidth < 768 && (
//                                 <LuSearch
//                                     className={`text-lightGreyColor absolute top-2.5 z-30 left-2 cursor-pointer`}
//                                     size={20}
//                                     onClick={() => setIsSearchbarClose(!isSearchbarClose)}
//                                 />
//                             )}
//                             <SearchBar
//                                 placeholder='Search By Name, Email, License No or Role...'
//                                 onChange={handleSearchChange}
//                                 onClear={handleClearSearch}
//                                 value={searchQuery}
//                                 showClearButton={!!searchQuery}
//                                 borderRounded='rounded-lg'
//                             />
//                             <SearchResults
//                                 results={filteredUsers || []}
//                                 onAddClient={addClientFun}
//                                 currentUserId={loginUserDetail.id}
//                                   isVisible={showSearchResults}
//                                 // isLoading={isSearchLoading}
//                                 emptyMessage={searchQuery ? `No users found for "${searchQuery}"` : "Start typing to search users..."}
//                             />
//                         </div>
//                     )}
//                 </div>

//                 {(screenWidth >= 768 || (screenWidth < 768 && !isSearchbarClose)) &&
//                     <>

//                         <div className='flex items-center  relative gap-x-2 bg-white' ref={dropdownRef}>
//                             {
//                                 previewUrl ? (
//                                     <img
//                                         src={previewUrl}
//                                         alt="Client"
//                                         className=" w-12 h-12 rounded-full object-cover"
//                                     />
//                                 ) : (

//                                     <UserIcon className="text-[32px] w-12 h-12 md:text-[40px] lg:text-[48px]" />

//                                 )
//                             }

//                             <div className='flex items-center lg:gap-x-4 bg-white z-20'> <div className='font-[Montserrat]'> <p className='text-gray-800 font-bold text-[16px] md:text-[18px] lg:text-[20px] capitalize'>{loginUserDetail?.user?.role === "superadmin" ?
//                                         (() => {
//                                             const fullName = loginUserDetail?.user?.fullName || '';
//                                             const words = fullName.split(' ');
//                                             const firstName = words [0];
//                                             return firstName ? `${firstName}...` : '';
//                                         })()
//                                         :
//                                         `${loginUserDetail?.user?.fullName?.slice(0, 6)}${loginUserDetail?.user?.fullName && loginUserDetail.user.fullName.length > 6 ? "..." : ""}`
//                                     } </p>
//                                 <p className='text-gray-500 font-medium text-sm -mt-1.5'>{loginUserDetail?.user?.role === "superadmin" ? "Super Admin" : loginUserDetail?.department ? userDepartment : "Client"}</p>
//                             </div> {loginUserDetail?.user?.role === "provider" && (
//                                 <div className='p-1 rounded-full hover:bg-gray-100 transition-colors duration-200'> <IoIosArrowDown className={`text-textColor transition-all duration-700 ease-in-out ${isDropDownOpen ? 'rotate-180' : 'rotate-0'} cursor-pointer`} size={22} onClick={() => setIsDropDownOpen(!isDropDownOpen)} />
//                                 </div>)}
//                             </div>
//                             <ul
//                                 className={`bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] -z-10 p-1  mt-0.5 rounded-[10px] flex flex-col  font-[Poppins] text-[12px] md:text-[14px] lg:text-[16px]'> absolute right-0 transition-all duration-700 ease-in-out 
//                                 ${isDropDownOpen ? 'opacity-100 translate-y-2  top-[45px] md:top-[50px] z-20' : 'opacity-0 hidden z-[0] -translate-y-3 pointer-events-none top-[-80px]'}
//                             `}
//                             >
//                                 <Link className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' to="/notification" >Notifications</Link>
//                                 <Link className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' to="/setting">Settings</Link>
//                                 <Link className='cursor-pointer py-2 px-3 rounded-[10px] hoverCLass' to="/help-and-support"> Help & Support</Link>
//                             </ul>
//                         </div>
//                     </>

//                 }

//             </div>
//         </div >

//     )
// }

// export default Navbar


// src/components/navbar/Navbar.tsx  (your Navbar with navigation added)
import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "../searchBar/SearchBar";
import SearchResults from "../searchBar/SearchResults";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { IoMdMenu } from "react-icons/io";
import { AppDispatch, RootState } from "../../redux/store";
import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import UserIcon from "../icons/user/User";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientType } from "../../types/clientType/ClientType";
import clientApiService from "../../apiServices/clientApi/ClientApi";
import providerApiService from "../../apiServices/providerApi/ProviderApi";
import { toast } from "react-toastify";
import Loader from "../loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import { LuSearch } from "react-icons/lu";

const Navbar = () => {
  const isSideBarClose = useSelector((state: RootState) => state.sideBarSlice.isSideBarClose);
  const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ClientType[]>();
  const [isSearchbarClose, setIsSearchbarClose] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const queryClient = useQueryClient();
  const formData = new FormData();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userDepartment = useMemo(() => {
    const departmentName = loginUserDetail?.department;
    if (!departmentName) return "";

    return departmentName
      .split(" ")
      .map((word) => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }, [loginUserDetail?.department]);

  const { data: clientData } = useQuery<ClientType[]>({
    queryKey: ["allclients"],
    queryFn: async () => {
      try {
        const response = await clientApiService.getAllTotalClient();
        const verifiedUsers = response?.data?.clients?.filter(
          (data: ClientType) => data?.user?.isApprove === "approve"
        );
        return verifiedUsers || [];
      } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
      }
    },
  });

  const { data: providerData } = useQuery<ClientType[]>({
    queryKey: ["allproviders"],
    queryFn: async () => {
      try {
        const response = await providerApiService.getAllTotalProviders();
        const verifiedProviders = response?.data?.providers?.filter(
          (data: ClientType) => data?.user?.isApprove === "approve"
        );
        return verifiedProviders || [];
      } catch (error) {
        console.error("Error fetching providers:", error);
        return [];
      }
    },
  });

  const allUsers = useMemo(() => [...(clientData || []), ...(providerData || [])], [clientData, providerData]);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      const searchTerm = searchQuery.toLowerCase();
      const timeoutId = setTimeout(() => {
        const filtered = allUsers.filter((user) => {
          return (
            user.user?.licenseNo?.toLowerCase().includes(searchTerm) ||
            user.user?.fullName?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.user?.role?.toLowerCase().includes(searchTerm)
          );
        });

        setFilteredUsers(filtered);
        setShowSearchResults(true);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
    setFilteredUsers([]);
    setShowSearchResults(false);
  }, [searchQuery, allUsers]);

  useEffect(() => {
    if (loginUserDetail?.user?.profileImage !== "null") {
      setPreviewUrl(loginUserDetail?.user?.profileImage);
    } else {
      setPreviewUrl(null);
    }
  }, [loginUserDetail]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredUsers([]);
    setShowSearchResults(false);
  };

  const addClientFun = (data: ClientType) => {
    updateMutation.mutate(data);
    handleClearSearch();
  };

  const updateMutation = useMutation({
    mutationFn: async (data: ClientType) => {
      formData.append("fullName", data?.user?.fullName ?? "");
      formData.append("licenseNo", data?.user?.licenseNo ?? "");
      formData.append("age", data?.user?.age ?? "18");
      formData.append("email", data?.email ?? "");
      formData.append("contactNo", data?.user?.contactNo ?? "00000000000000");
      formData.append("address", data?.user?.address ?? "No Address");
      formData.append("gender", data?.user?.gender ?? "");
      formData.append("status", data?.user?.status ?? "");
      formData.append("country", data?.user?.country ?? "");
      formData.append("state", data?.user?.state ?? "");
      formData.append("role", "client");
      formData.append("isApprove", "pending");
      formData.append("providerId", loginUserDetail.id);
      formData.append("profileImage", data?.user?.profileImage ?? "");
      await clientApiService.addExistingClientToProvider(formData);
    },
    onMutate: () => setIsLoader(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["allclients"] });
      queryClient.invalidateQueries({ queryKey: ["allproviders"] });
      toast.success("User has been added successfully");
      handleClearSearch();
      setIsLoader(false);
    },
    onError: () => {
      toast.error("Failed to add the client!");
      setIsLoader(false);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropDownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Navigate to super admin page when clicking the profile area (only for superadmin)
  const goToSuperAdmin = () => {
    if (loginUserDetail?.user?.role === "superadmin") {
      navigate("/super-admin");
    }
  };

  const isSuperAdmin = loginUserDetail?.user?.role === "superadmin";
  const isProvider = loginUserDetail?.user?.role === "provider";

  return (
    <div className="bg-white">
      {isLoader && <Loader text="Adding..." />}

      <div className="flex w-full items-center justify-between xl:justify-end xl:gap-x-96 bg-white px-3 py-3">
        <div className="block md:hidden">
          {isSideBarClose === false && <IoMdMenu size={24} onClick={() => dispatch(isSideBarCloseReducser(true))} />}
        </div>

        <div
          className={`relative transition-all duration-300 ease-in-out  ${
            screenWidth < 768 ? (isSearchbarClose ? "w-[280px]" : "w-[35px]") : " md:w-full md:max-w-[280px] lg:max-w-[450px] xl:max-w-[500px]"
          }`}
          ref={searchRef}
        >
          {isProvider && (
            <div className="relative">
              {screenWidth < 768 && (
                <LuSearch
                  className="text-lightGreyColor absolute top-2.5 z-30 left-2 cursor-pointer"
                  size={20}
                  onClick={() => setIsSearchbarClose(!isSearchbarClose)}
                />
              )}

              <SearchBar
                placeholder="Search By Name, Email, License No or Role..."
                onChange={handleSearchChange}
                onClear={handleClearSearch}
                value={searchQuery}
                showClearButton={!!searchQuery}
                borderRounded="rounded-lg"
              />

              <SearchResults
                results={filteredUsers || []}
                onAddClient={addClientFun}
                currentUserId={loginUserDetail.id}
                isVisible={showSearchResults}
                emptyMessage={searchQuery ? `No users found for "${searchQuery}"` : "Start typing to search users..."}
              />
            </div>
          )}
        </div>

        {(screenWidth >= 768 || (screenWidth < 768 && !isSearchbarClose)) && (
          <div
            className={`flex items-center relative gap-x-2 bg-white ${isSuperAdmin ? "cursor-pointer" : ""}`}
            ref={dropdownRef}
            role={isSuperAdmin ? "button" : undefined}
            tabIndex={isSuperAdmin ? 0 : undefined}
            onClick={goToSuperAdmin}
            onKeyDown={(e) => {
              if (isSuperAdmin && e.key === "Enter") goToSuperAdmin();
            }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="User" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <UserIcon className="text-[32px] w-12 h-12 md:text-[40px] lg:text-[48px]" />
            )}

            <div className="flex items-center lg:gap-x-4 bg-white z-20">
              <div className="font-[Montserrat]">
                <p className="text-gray-800 font-bold text-[16px] md:text-[18px] lg:text-[20px] capitalize">
                  {isSuperAdmin
                    ? (() => {
                        const fullName = loginUserDetail?.user?.fullName || "";
                        const words = fullName.split(" ");
                        const firstName = words[0];
                        return firstName ? `${firstName}...` : "";
                      })()
                    : `${loginUserDetail?.user?.fullName?.slice(0, 6)}${
                        loginUserDetail?.user?.fullName && loginUserDetail.user.fullName.length > 6 ? "..." : ""
                      }`}
                </p>

                <p className="text-gray-500 font-medium text-sm -mt-1.5">
                  {isSuperAdmin ? "Super Admin" : loginUserDetail?.department ? userDepartment : "Client"}
                </p>
              </div>

              {/* dropdown only for provider (as you had it) */}
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
              className={`bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] -z-10 p-1 mt-0.5 rounded-[10px] flex flex-col font-[Poppins] text-[12px] md:text-[14px] lg:text-[16px] absolute right-0 transition-all duration-700 ease-in-out 
              ${
                isDropDownOpen ? "opacity-100 translate-y-2 top-[45px] md:top-[50px] z-20" : "opacity-0 hidden z-[0] -translate-y-3 pointer-events-none top-[-80px]"
              }`}
            >
              <Link className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass" to="/notification">
                Notifications
              </Link>
              <Link className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass" to="/setting">
                Settings
              </Link>
              <Link className="cursor-pointer py-2 px-3 rounded-[10px] hoverCLass" to="/help-and-support">
                Help & Support
              </Link>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
