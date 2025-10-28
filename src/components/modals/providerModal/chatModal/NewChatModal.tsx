import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import SearchBar from '../../../searchBar/SearchBar'
import Loader from '../../../loader/Loader'
import chatApiService from '../../../../apiServices/chatApi/ChatApi'
import { isNewChatModalShowReducser } from '../../../../redux/slices/ModalSlice'
import { ChatChannelType } from '../../../../types/chatType/ChatChannelType'
import { toast } from 'react-toastify'

const NewChatModal = () => {
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const dispatch = useDispatch<AppDispatch>()
    const queryClient = useQueryClient();

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
            });

            // Optional: force full refetch
            queryClient.invalidateQueries({ queryKey: ['chatchannels'] });

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
    const providers = allProviders?.filter(data => data?.id !== loginUserDetail.id)
    const providersWithoutChat = providers?.filter(provider => {
        return !allChannels?.some((channel: ChatChannelType) => channel?.providerBId === provider?.id || channel?.providerAId === provider?.id);
    });






    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>something went wrong</p>
    }
    return (<>
        <div className='mt-4'>

            <SearchBar sm bgColor='bg-inputBgColor' isBorder={false} borderRounded='rounded-[8px]' />
        </div>
        <div className='mt-2'>{providersWithoutChat?.map((data: ProviderType, id: number) => {
            return <p key={id} className='capitalize text-[14px] p-2 font-medium cursor-pointer rounded-md hover:bg-primaryColorLight' onClick={() => createNewChat(data)}>
                {data?.user?.fullName}</p>
        })}</div >
    </>
    )
}

export default NewChatModal