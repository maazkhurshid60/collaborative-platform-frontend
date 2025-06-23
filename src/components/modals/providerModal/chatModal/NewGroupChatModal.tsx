import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ProviderType } from '../../../../types/providerType/ProviderType'
import providerApiService from '../../../../apiServices/providerApi/ProviderApi'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../redux/store'
import SearchBar from '../../../searchBar/SearchBar'
import Loader from '../../../loader/Loader'
import chatApiService from '../../../../apiServices/chatApi/ChatApi'
import { isModalShowReducser, isNewGroupChatModalShowReducser } from '../../../../redux/slices/ModalSlice'
import AddIcon from '../../../icons/add/Add'

import { useState } from 'react'
import InputField from '../../../inputField/InputField'
import { z } from 'zod'
import { groupSchema } from '../../../../schema/chat/ChatSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../button/Button'
import { FiMinusCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { GroupChat } from '../../../../types/chatType/GroupType'
import ToolTip from '../../../toolTip/ToolTip'
type FormFields = z.infer<typeof groupSchema>
const NewGroupChatModal = () => {
    const { register, formState: { errors }, handleSubmit } = useForm<FormFields>({ resolver: zodResolver(groupSchema) })
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const [groupMembers, setGroupMembers] = useState<string[]>([])
    const dispatch = useDispatch<AppDispatch>()
    const queryClient = useQueryClient()
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





    const { mutate: createGroupChat } = useMutation({
        mutationFn: async (payload: FormFields) => {
            const dataSendToBack = {
                membersId: [...groupMembers, loginUserDetail?.id],
                groupName: payload.name,
            };
            const response = await chatApiService.createGroupChatChannels(dataSendToBack);
            return response?.data?.group;
        },
        onSuccess: (newGroup) => {
            queryClient.setQueryData<GroupChat[]>(['groupChatchannels'], (old = []) => {
                const exists = old.find((g) => g.id === newGroup.id);
                return exists ? old : [newGroup, ...old];
            });

            queryClient.invalidateQueries({ queryKey: ['groupChatchannels'] });
            dispatch(isModalShowReducser(false));
            dispatch(isNewGroupChatModalShowReducser(false))
        },
    });






    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>something went wrong</p>
    }
    return (<>
        <form
            onSubmit={handleSubmit((data) => {
                if (groupMembers.length === 0) {
                    toast.warn('Select at least one group member');
                    return;
                }
                createGroupChat(data);
            })}
        >
            <div className='mt-4'>

                <InputField required label='Group Name' register={register("name")} placeHolder='Enter Full Name.' error={errors.name?.message} />
            </div>
            <div className='mt-4'>

                <SearchBar sm bgColor='bg-inputBgColor' isBorder={false} borderRounded='rounded-[8px]' />
            </div>
            <div className='mt-2 mb-4'>
                {allProviders?.map((data: ProviderType, id: number) => {
                    if (!data?.id || loginUserDetail?.id === data?.id) return null;  // skip if id is missing or same as logged-in user

                    const isMember = groupMembers.includes(data.id.toString());

                    return (
                        <div className='flex items-center gap-x-0 w-auto rounded-md hover:bg-primaryColorLight p-2' key={id}>
                            <p className='capitalize w-30 text-[14px] font-medium'>
                                {data?.user?.fullName}
                            </p>
                            {isMember ? (
                                <div className='relative group'>
                                    <FiMinusCircle
                                        className='cursor-pointer text-xl text-textGreyColor'
                                        onClick={() =>
                                            setGroupMembers(prev => prev.filter(member => member !== data.id!.toString()))
                                        }
                                    />
                                    <ToolTip toolTipText='Remove Member' />
                                </div>
                            ) : (
                                <div className='relative group'>
                                    <AddIcon
                                        onClick={() => setGroupMembers(prev => [...prev, data.id!.toString()])}
                                    />
                                    <ToolTip toolTipText='Add Member' />

                                </div>
                            )}
                        </div>
                    );
                })}

            </div>

            <Button text='Create Group' sm />
        </form >
    </>
    )
}

export default NewGroupChatModal