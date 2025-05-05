import { useQuery } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import SearchBar from '../../../searchBar/SearchBar'
import Loader from '../../../loader/Loader'
import chatApiService from '../../../../apiServices/chatApi/ChatApi'
import { isModalShowReducser } from '../../../../redux/slices/ModalSlice'

const NewChatModal = () => {
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const dispatch = useDispatch<AppDispatch>()
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


    const newChatFun = async (data: ProviderType) => {

        const dataSendToBack = { providerId: loginUserDetail?.id, toProviderId: data?.id }
        console.log("dataSendToBack", dataSendToBack);
        const response = await chatApiService.createChatChannels(dataSendToBack)
        console.log(response);

        dispatch(isModalShowReducser(false))
    }





    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (<>
        <div className='mt-4'>

            <SearchBar sm />
        </div>
        <div className='mt-2'>{allProviders?.map((data: ProviderType, id: number) => {
            return <p key={id} className='capitalize text-[14px] p-2 font-medium cursor-pointer rounded-md hover:bg-primaryColorLight' onClick={() => newChatFun(data)} >
                {data?.user?.fullName}</p>
        })}</div >
    </>
    )
}

export default NewChatModal