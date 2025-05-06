import { useQuery } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../redux/store'
import SearchBar from '../../../searchBar/SearchBar'
import Loader from '../../../loader/Loader'
// import chatApiService from '../../../../apiServices/chatApi/ChatApi'
// import { isModalShowReducser } from '../../../../redux/slices/ModalSlice'
import AddIcon from '../../../icons/add/Add'
// import { CiCircleMinus } from "react-icons/ci";

// import { useState } from 'react'
import InputField from '../../../inputField/InputField'
import { z } from 'zod'
import { groupSchema } from '../../../../schema/chat/ChatSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
type FormFields = z.infer<typeof groupSchema>
const NewGroupChatModal = () => {
    const { register, formState: { errors }, handleSubmit } = useForm<FormFields>({ resolver: zodResolver(groupSchema) })
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    // const [groupMembers, setGroupMembers] = useState<string[]>()
    // const dispatch = useDispatch<AppDispatch>()
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


    const newGorupChatFun = async (data: FormFields) => {

        const dataSendToBack = { groupName: data?.name }
        console.log("dataSendToBack", dataSendToBack);
        // const response = await chatApiService.createChatChannels(dataSendToBack)
        console.log(dataSendToBack);

        // dispatch(isModalShowReducser(false))
    }





    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>something went wrong</p>
    }
    return (<>
        <form action="" onSubmit={handleSubmit(newGorupChatFun)}></form>
        <div className='mt-4'>

            <InputField required label='Group Name' register={register("name")} name='name' placeHolder='Enter Full Name.' error={errors.name?.message} />
        </div>
        <div className='mt-4'>

            <SearchBar sm />
        </div>
        <div className='mt-2'>{allProviders?.map((data: ProviderType, id: number) => {
            return <div className='flex items-center gap-x-10 w-auto rounded-md hover:bg-primaryColorLight p-2'> <p key={id} className='capitalize w-50 text-[14px]  font-medium '  >
                {data?.user?.fullName}
            </p>
                <AddIcon
                // onClick={() => setGroupMembers(prev =>...prev, data?.id)} 
                />

            </div>
        })}</div >
    </>
    )
}

export default NewGroupChatModal