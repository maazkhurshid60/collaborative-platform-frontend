import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IoMdMenu } from "react-icons/io";
import { LuSearch } from "react-icons/lu";
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import SearchBar from "../searchBar/SearchBar";
import SearchResults from "../searchBar/SearchResults";
import { AppDispatch, RootState } from "../../redux/store";
import { isSideBarCloseReducser } from "../../redux/slices/SideBarSlice";
import { ClientType } from "../../types/clientType/ClientType";
import clientApiService from "../../apiServices/clientApi/ClientApi";
import Loader from "../loader/Loader";
import { useSubscription } from "../../hooks/useSubscription";

import { getSocket } from "../../socket/Socket";
import notificationApiService from "../../apiServices/notification/NotificationApi";
import UserProfileDropdown from "./UserProfileDropdown";
import { useDebounce } from "@/hook/useDebounce";

const Navbar = () => {
  const { isTrialActive } = useSubscription();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ClientType[]>();
  const [isSearchbarClose, setIsSearchbarClose] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const isSideBarClose = useSelector(
    (state: RootState) => state.sideBarSlice.isSideBarClose,
  );
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: unreadCountData } = useQuery({
    queryKey: ["unreadNotificationCount", loginUserDetail?.user?.id],
    queryFn: async () => {
      if (!loginUserDetail?.user?.id) return null;
      const res = await notificationApiService.getUnreadCount(
        loginUserDetail.user.id,
      );
      return res;
    },
    enabled: !!loginUserDetail?.user?.id,
  });

  const unreadCount = unreadCountData?.data?.unreadCount || 0;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    };
    socket.on("new_notification", handleNewNotification);
    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [queryClient]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["global-search", debouncedSearchQuery],
    queryFn: async () => {
      const response = await clientApiService.searchUsers(debouncedSearchQuery);
      return response?.data?.users || [];
    },
    enabled: debouncedSearchQuery.trim().length > 0,
  });

  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "") {
      setFilteredUsers(searchResults || []);
      setShowSearchResults(true);
    } else {
      setFilteredUsers([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery, searchResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredUsers([]);
    setShowSearchResults(false);
  };

  const addClientFun = (data: ClientType) => {
    const currentUserId = loginUserDetail?.id;
    const isOwnClient = data?.createdByProviderId === currentUserId;
    if (isTrialActive && !isOwnClient) {
      toast.info(
        "Adding another provider's client is a premium feature. Please upgrade your plan.",
      );
      return;
    }
    updateMutation.mutate(data);
    handleClearSearch();
  };

  const updateMutation = useMutation({
    mutationFn: async (data: ClientType) => {
      const localFormData = new FormData();
      localFormData.append("fullName", data?.user?.fullName || "Unkown User");
      localFormData.append("licenseNo", data?.user?.licenseNo || "");
      localFormData.append("age", String(data?.user?.age || "18"));
      localFormData.append("email", data?.user?.email || "");
      localFormData.append("contactNo", data?.user?.contactNo || "0000000000");
      localFormData.append("address", data?.user?.address || "No Address");
      localFormData.append(
        "gender",
        (data?.user?.gender || "male").toLowerCase(),
      );
      localFormData.append(
        "status",
        (data?.user?.status || "active").toLowerCase(),
      );
      // localFormData.append("country", data?.user?.country || "");
      localFormData.append("state", data?.user?.state || "");
      localFormData.append("role", "client");
      localFormData.append("isApprove", "pending");
      localFormData.append("providerId", loginUserDetail?.id || "");
      localFormData.append("profileImage", data?.user?.profileImage || "");
      await clientApiService.addExistingClientToProvider(localFormData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["allclients"] });
      queryClient.invalidateQueries({ queryKey: ["allproviders"] });
      toast.success("User has been added successfully");
      handleClearSearch();
    },
    onError: () => {
      toast.error("Failed to add the client!");
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isProvider = loginUserDetail?.user?.role === "provider";

  return (
    <div className="bg-white">
      {updateMutation.isPending && <Loader text="Adding..." />}

      <div className="flex w-full items-center justify-between xl:justify-between xl:gap-x-96 bg-white px-3 py-3">
        <div className="block md:hidden">
          {isSideBarClose === false && (
            <IoMdMenu
              size={24}
              onClick={() => dispatch(isSideBarCloseReducser(true))}
            />
          )}
        </div>

        <div
          className={`relative transition-all duration-300 ease-in-out  ${
            screenWidth < 768
              ? isSearchbarClose
                ? "w-70"
                : "w-8.75"
              : " md:w-full md:max-w-70 lg:max-w-112.5 xl:max-w-125"
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
                isLoading={isSearching || searchQuery !== debouncedSearchQuery}
                onResultClick={handleClearSearch}
                emptyMessage={
                  searchQuery
                    ? `No users found for "${searchQuery}"`
                    : "Start typing to search users..."
                }
              />
            </div>
          )}
        </div>
        {(screenWidth >= 768 || (screenWidth < 768 && !isSearchbarClose)) && (
          <div className="flex items-center gap-x-4 md:gap-x-6">
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/notification")}
            >
              <Bell
                size={24}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 mt-1"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            <UserProfileDropdown />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
