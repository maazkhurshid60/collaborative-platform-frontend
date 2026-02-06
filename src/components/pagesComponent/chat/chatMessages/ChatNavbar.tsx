
import Button from '../../../button/Button';
import { FaRegShareFromSquare } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../redux/store';
import { isDeleteChannelModalShowReducer, isModalShowReducser } from '../../../../redux/slices/ModalSlice';
import UserIcon from '../../../icons/user/User';
import { useState } from 'react';
import { GroupCreatedBy, GroupDelete, GroupMember } from '../../../../types/chatType/GroupType';
import DeleteIcon from '../../../icons/delete/DeleteIcon';
import DeleteChannelModal from '../../../modals/providerModal/chatModal/DeleteChannelModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import chatApiService from '../../../../apiServices/chatApi/ChatApi';
import { toast } from 'react-toastify';


interface chatNavbarProps {
    name?: string,
    groupMembers: GroupMember[]
    id: string
    groupCreatedBy?: GroupCreatedBy
}

const ChatNavbar: React.FC<chatNavbarProps> = (props) => {
    const [isShowModal, setIsShowModal] = useState(false)
    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);

    const dispatch = useDispatch<AppDispatch>()
    const isDeleteChannelModalShow = useSelector((state: RootState) => state.modalSlice.isDeleteChannelModalShow)
    const deleteConservation = () => {
        dispatch(isDeleteChannelModalShowReducer(true))
    }

    const queryClient = useQueryClient();

    // 1️⃣ Define the delete mutation
    const deleteSingleChannelMutation = useMutation({
        mutationFn: async (channelId: string) => {
            await chatApiService.deleteChatChannels(channelId);
            return channelId;
        },
        onSuccess: () => {
            toast.success("Chat Channel has deleted Successfully")
            queryClient.invalidateQueries({
                queryKey: ['chatchannels', loginUserId]
            });
            dispatch(isDeleteChannelModalShowReducer(false))
        },
        onError: (err) => {
            console.error('Delete failed', err);
            // you can show a toast here
        }
    });
    const deleteGroupChannelMutation = useMutation({
        mutationFn: async (data: GroupDelete) => {
            await chatApiService.deleteGroupChannels(data);
            return data;
        },
        onSuccess: () => {
            toast.success("Group Channel has deleted Successfully")

            // 2️⃣ Invalidate or update the cache so the list refreshes
            queryClient.invalidateQueries({
                queryKey: ['groupChatchannels', loginUserId]
            });
            dispatch(isDeleteChannelModalShowReducer(false))

        },
        onError: (err) => {
            console.error('Delete failed', err);
            // you can show a toast here
        }
    });


    const confirmDeleteChatChannel = () => {
        const data = { id: props.id, createdBy: loginUserId }
        if (props.groupMembers?.length > 0) deleteGroupChannelMutation.mutate(data)
        else deleteSingleChannelMutation.mutate(props.id);
    }


    return (
        <>
            {isDeleteChannelModalShow &&
                <DeleteChannelModal text="Deleting this conversation will remove it permanently for both users and it cannot be recovered. Are you sure you want to delete this conversation?"
                    heading="Deleteing Conservation" onDeleteConfirm={confirmDeleteChatChannel} />
            }

            <div className='flex items-center justify-between '>

                <div className='flex items-center gap-x-4 '>

                    <p className='font-semibold text-[16px] md:text-[20px] lg:text-[24px] font-[Montserrat] inline-block  capitalize'>{props.name}</p>
                    {(props?.groupMembers?.length > 0) && (
                        <p className='text-xs bg-primaryColorDark text-white capitalize py-1 px-2 rounded-md'>
                            Admin: {(loginUserId === props.groupCreatedBy?.id) ? "You" : (props.groupCreatedBy?.name || "Admin")}
                        </p>
                    )}
                </div>
                <div className='flex items-center gap-x-4'>
                    <div className='w-[100px]'>
                        {props?.groupMembers?.length !== undefined && (
                            <div className="flex items-center relative w-[100%]  h-8">
                                {props?.groupMembers?.slice(0, 2).map((data, id: number) => (
                                    <div
                                        key={id}
                                        className="border-solid border-textColor rounded-full border-[1px]  bg-white absolute z-20"
                                        style={{ right: `${id * 20}px` }}
                                    >



                                        {((data?.Provider?.user?.profileImage || (data as any)?.user?.profileImage) && (data?.Provider?.user?.profileImage !== "null" && (data as any)?.user?.profileImage !== "null")) ?
                                            <img
                                                className='w-10 h-10 rounded-full object-cover'
                                                src={data?.Provider?.user?.profileImage || (data as any)?.user?.profileImage} />
                                            : <UserIcon className="w-10! h-10! rounded-full object-cover text-gray-400" />}
                                    </div>
                                ))}
                                <div
                                    className="relative"
                                    onMouseEnter={() => setIsShowModal(true)}
                                    onMouseLeave={() => setIsShowModal(false)}
                                >
                                    {props?.groupMembers?.length > 0 && (
                                        <div
                                            className="absolute right-[-110px] top-[-10px] z-20 flex items-center justify-center w-6 h-6 text-xs text-white bg-primaryColorDark rounded-full cursor-pointer"
                                        >
                                            +{props?.groupMembers?.length - 2}
                                        </div>
                                    )}

                                    {isShowModal && (
                                        <div
                                            className="absolute top-full right-[-100px] mt-2 p-4 min-w-[250px] max-w-[400px] w-full max-h-[300px] min-h-[200px]
               bg-white border border-gray-300 rounded-2xl z-30 flex flex-col gap-y-4 overflow-y-auto shadow-md"

                                        >
                                            <p className='text-sm font-semibold'>Other Group Members:</p>
                                            <hr className='h-2 text-2xl' />
                                            {props?.groupMembers?.map((data) => <div className='flex items-center gap-x-2 '>
                                                {((data?.Provider?.user?.profileImage || (data as any)?.user?.profileImage) && (data?.Provider?.user?.profileImage !== "null" && (data as any)?.user?.profileImage !== "null")) ?
                                                    <img
                                                        className='w-10 h-10 rounded-full object-cover'
                                                        src={data?.Provider?.user?.profileImage || (data as any)?.user?.profileImage} />

                                                    : <UserIcon className="w-10! h-10! rounded-full object-cover text-gray-400" />}
                                                <div className='text-xs '>
                                                    <p className='font-semibold capitalize'>{data?.Provider?.user?.fullName || (data as any)?.user?.fullName}</p>
                                                    <p>{(data?.Provider?.user as any)?.email || (data as any)?.user?.email || (data?.Provider as any)?.email}</p>
                                                </div>
                                            </div>)}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                    {loginUserId === props.groupCreatedBy?.id &&
                        <div>
                            <DeleteIcon onClick={deleteConservation} />
                        </div>
                    }

                    <div className='w-[60px] md:w-[70px] lg:w-[100px]'>
                        <Button text='share' icon={<FaRegShareFromSquare />} sm onclick={() => {
                            dispatch(isModalShowReducser(true))
                        }} />
                    </div>
                </div>
            </div >
        </>
    )
}

export default ChatNavbar