
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
                    {(props?.groupMembers?.length > 0) && <p className='text-xs bg-primaryColorDark text-white capitalize py-1 px-2  rounded-md'>Admin: {loginUserId === props.groupCreatedBy?.id ? "You" : props.groupCreatedBy?.name}</p>
                    } </div>
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



                                        {(data?.Provider?.user?.profileImage !== null && data?.Provider?.user?.profileImage !== "null") ?
                                            <img
                                                className='w-10 h-10 rounded-full object-cover'
                                                // src={`${localhostBaseUrl}uploads/eSignatures/${data?.Provider?.user?.profileImage?.split('/').pop()}`} />
                                                src={data?.Provider?.user?.profileImage} />
                                            : <UserIcon className="text-[20px] md:text-[24px] lg:text-[40px]" />}
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
                                            className="absolute  p-4 rounded-2xl top-full right-[-100px] mt-2 w-[220px] max-h-[300px] min-h[200px] bg-white border-1 border-gray-300  z-30 gap-y-4 flex flex-col"

                                        >
                                            <p className='text-sm font-semibold'>Other Group Members:</p>
                                            <hr className='h-2 text-2xl' />
                                            {props?.groupMembers?.map((data) => <div className='flex items-center gap-x-2 '>
                                                {(data?.Provider?.user?.profileImage !== null && data?.Provider?.user?.profileImage !== "null") ?
                                                    <img
                                                        className='w-7 h-7 rounded-full object-cover'
                                                        src={data?.Provider?.user?.profileImage} />

                                                    : <UserIcon className="text-[20px] md:text-[24px] lg:text-[28px]" />}
                                                <div className='text-xs'>
                                                    <p className='font-semibold capitalize'>{data?.Provider?.user?.fullName}</p>
                                                    <p>{data?.Provider?.email}</p>
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