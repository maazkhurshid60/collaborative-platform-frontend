import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ProviderType } from "../../../../types/providerType/ProviderType";
import { AppDispatch, RootState } from "../../../../redux/store";
import SearchBar from "../../../searchBar/SearchBar";
import ProviderSearchResults from "./ProviderSearchResults";
import Loader from "../../../loader/Loader";
import chatApiService from "../../../../apiServices/chatApi/ChatApi";
import { isNewChatModalShowReducser } from "../../../../redux/slices/ModalSlice";
import { ChatChannelType } from "../../../../types/chatType/ChatChannelType";
import { useDebounce } from "../../../../hook/useDebounce";

const NewChatModal = () => {
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search state & debounced search for API-level filtering
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const handleProviderSelect = (provider: ProviderType) => {
    const existingChannel = allChannels?.find(
      (channel: ChatChannelType) =>
        channel?.providerBId === provider?.user?.id ||
        channel?.providerAId === provider?.user?.id,
    );

    if (existingChannel) {
      dispatch(isNewChatModalShowReducser(false));
      handleClearSearch();
      navigate(`/chat/individual/${existingChannel.id}`);
    } else {
      createNewChat(provider);
    }
  };

  const {
    data: allProviders,
    isLoading,
    isError,
  } = useQuery<ProviderType[]>({
    queryKey: ["providers", debouncedSearchQuery],
    queryFn: async () => {
      const response = await chatApiService.getAllUsersForChat(
        loginUserDetail.id,
        debouncedSearchQuery,
      );
      return response?.data?.users;
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: createNewChat } = useMutation({
    mutationFn: async (provider: ProviderType) => {
      const dataSendToBack = {
        providerId: loginUserDetail?.id,
        toProviderId: provider?.id,
      };
      const response = await chatApiService.createChatChannels(dataSendToBack);
      return response?.data?.newChatChannel;
    },
    onSuccess: (newChat) => {
      queryClient.setQueryData<ChatChannelType[]>(
        ["chatchannels"],
        (old = []) => {
          const exists = old?.find((item) => item?.id === newChat?.id);
          return exists ? old : [newChat, ...old];
        },
      );

      queryClient.invalidateQueries({ queryKey: ["chatchannels"] });

      handleClearSearch();
      toast.success("New chat created successfully!");
      dispatch(isNewChatModalShowReducser(false));
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    },
  });

  const { data: allChannels = [] } = useQuery({
    queryKey: ["chatchannels"],
    queryFn: async () => {
      const res = await chatApiService.getAllChatChannels(loginUserDetail.id);
      return res.data.findAllChatChannel;
    },
  });

  const providers = useMemo(() => {
    return (
      allProviders?.filter((data) => data?.id !== loginUserDetail.id) || []
    );
  }, [allProviders, loginUserDetail.id]);

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  if (isLoading) {
    return <Loader inline text="Loading providers..." />;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        <p className="text-sm">Something went wrong while loading providers.</p>
        <p className="text-xs text-gray-500 mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <SearchBar
          sm
          bgColor="bg-inputBgColor"
          isBorder={false}
          borderRounded="rounded-lg"
          placeholder="Search Providers by Name, Email, speciality..."
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          showClearButton={!!searchQuery}
        />
      </div>

      <div className="mt-2">
        {providers.length === 0 ? (
          <div className="p-6 text-center text-lightGreyColor">
            <div className="mb-2">
              <svg
                className="mx-auto w-12 h-12 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">
              {searchQuery
                ? `No providers match "${searchQuery}"`
                : "No providers available for new chats"}
            </p>
          </div>
        ) : (
          <ProviderSearchResults
            providers={providers}
            onProviderSelect={handleProviderSelect}
            isActionLoading={
              createNewChat.hasOwnProperty("isPending")
                ? (createNewChat as any).isPending
                : false
            }
            searchQuery={searchQuery}
            emptyMessage={
              searchQuery
                ? "No providers match your search"
                : "No providers available for new chats"
            }
          />
        )}
      </div>

      {providers.length > 0 && (
        <div className="text-xs text-gray-500 text-center mt-2">
          {searchQuery
            ? `Found ${providers.length} User${providers.length !== 1 ? "s" : ""} matching "${searchQuery}"`
            : `${providers.length} User${providers.length !== 1 ? "s" : ""} available for new chats`}
        </div>
      )}
    </div>
  );
};

export default NewChatModal;
