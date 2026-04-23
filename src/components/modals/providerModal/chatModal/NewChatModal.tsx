import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import SearchBar from '../../../searchBar/SearchBar'
import ProviderSearchResults from './ProviderSearchResults'
import Loader from '../../../loader/Loader'
import chatApiService from '../../../../apiServices/chatApi/ChatApi'
import { isNewChatModalShowReducser } from '../../../../redux/slices/ModalSlice'
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType'
import { toast } from 'react-toastify'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
const NewChatModal = () => {
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const dispatch = useDispatch<AppDispatch>()
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleProviderSelect = (provider: ProviderType) => {
        const existingChannel = allChannels?.find((channel: ChatChannelType) => 
            channel?.providerBId === provider?.user?.id || channel?.providerAId === provider?.user?.id
        );

        if (existingChannel) {
            dispatch(isNewChatModalShowReducser(false));
            handleClearSearch();
            navigate(`/chat/individual/${existingChannel.id}`);
        } else {
            createNewChat(provider);
        }
    };

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredProviders, setFilteredProviders] = useState<ProviderType[]>([])

    const { data: allProviders, isLoading, isError } = useQuery<ProviderType[]>({
        queryKey: ["providers"],
        queryFn: async () => {
            try {
                const response = await providerApiService.getAllProviders(loginUserDetail.user.id)
                return response?.data?.providers
            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }
    })


    const { mutate: createNewChat } = useMutation({
        mutationFn: async (provider: ProviderType) => {
            const dataSendToBack = { providerId: loginUserDetail?.id, toProviderId: provider?.id };
            const response = await chatApiService.createChatChannels(dataSendToBack);
            return response?.data?.newChatChannel;
        },
        onSuccess: (newChat) => {
            // Push to cache or refetch
            queryClient.setQueryData<ChatChannelType[]>(['chatchannels'], (old = []) => {
                const exists = old?.find((item) => item?.id === newChat?.id);
                return exists ? old : [newChat, ...old];
                return old;
            });

            // Optional: force full refetch
            queryClient.invalidateQueries({ queryKey: ['chatchannels'] });

            // Clear search and close modal
            handleClearSearch();
            toast.success('New chat created successfully!');
            dispatch(isNewChatModalShowReducser(false))
        },
        onError: (error) => {
            console.error(error)

            toast.error('Failed to create chat.');
        },
    });


    const { data: allChannels = [] } = useQuery({
        queryKey: ['chatchannels'],
        queryFn: async () => {
            const res = await chatApiService.getAllChatChannels(loginUserDetail.id);
            return res.data.findAllChatChannel;
        },
    });

    useEffect(() => {

    }, [allProviders])

    const providers = useMemo(() => {
        return allProviders?.filter(data => data?.id !== loginUserDetail.id && data.user?.isApprove === 'APPROVED');
    }, [allProviders, loginUserDetail.id]);

    // Search functionality with debounce
    useEffect(() => {
        if (!providers) {
            setFilteredProviders([]);
            return;
        }

        if (searchQuery.trim() === '') {
            setFilteredProviders(providers);
            return;
        }

        const timeoutId = setTimeout(() => {
            const searchTerm = searchQuery.toLowerCase();
            const filtered = providers.filter((provider) => {
                return (
                    provider.user?.fullName?.toLowerCase().includes(searchTerm) ||
                    provider.user?.email?.toLowerCase().includes(searchTerm) ||
                    provider.specialty?.toLowerCase().includes(searchTerm) ||
                    provider.user?.licenseNo?.toLowerCase().includes(searchTerm) ||
                    provider.user?.role?.toLowerCase().includes(searchTerm)
                );
            });

            setFilteredProviders(filtered);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [searchQuery, providers]);

    // Search handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredProviders(providers || []);
    };






    if (isLoading) {
        return <Loader text='Loading providers...' />
    }

    if (isError) {
        return (
            <div className="p-6 text-center text-red-500">
                <p className="text-sm">Something went wrong while loading providers.</p>
                <p className="text-xs text-gray-500 mt-1">Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="mt-4">
                <SearchBar
                    sm
                    bgColor='bg-inputBgColor'
                    isBorder={false}
                    borderRounded='rounded-lg'
                    placeholder='Search Providers by Name, Email, specialty...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClear={handleClearSearch}
                    showClearButton={!!searchQuery}
                />
            </div>

            <div className="mt-2">
                {providers?.length === 0 ? (
                    <div className="p-6 text-center text-lightGreyColor">
                        <div className="mb-2">
                            <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">No active providers found!</p>
                        <p className="text-xs mt-1">Providers might be pending approval.</p>
                    </div>
                ) : (
                    <ProviderSearchResults
                        providers={filteredProviders}
                        onProviderSelect={handleProviderSelect}
                        isActionLoading={createNewChat.hasOwnProperty('isPending') ? (createNewChat as any).isPending : false}
                        searchQuery={searchQuery}
                        emptyMessage={searchQuery ? "No providers match your search" : "No providers available for new chats"}
                    />
                )}
            </div>

            {filteredProviders.length > 0 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                    {searchQuery ? (
                        `Found ${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                    ) : (
                        `${filteredProviders.length} provider${filteredProviders.length !== 1 ? 's' : ''} available for new chats`
                    )}
                </div>
            )}
        </div>
    )
}

export default NewChatModal