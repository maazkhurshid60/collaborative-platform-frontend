
import OutletLayout from '../../layouts/outletLayout/OutletLayout'
import usePaginationHook from '../../hook/usePaginationHook'
import CustomPagination from '../../components/customPagination/CustomPagination'
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from 'react-toastify';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationType } from '../../types/notification/NotificationType';
import { AppDispatch, RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import notificationApiService from '../../apiServices/notification/NotificationApi';
import NoRecordFound from '../../components/noRecordFound/NoRecordFound';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { isModalDeleteReducer } from '../../redux/slices/ModalSlice';
import Loader from '../../components/loader/Loader';
import DeleteClientModal from '../../components/modals/providerModal/deleteClientModal/DeleteClientModal';
import { getSocket } from '../../socket/Socket';


const Notification = () => {

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
    const isModalDelete = useSelector((state: RootState) => state?.modalSlice.isModalDelete)
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const queryClient = useQueryClient()
    const [selectedNotificationId, setSelectedNotificationId] = useState<string>("")

    const { data: notificationData } = useQuery<NotificationType[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            try {
                const response = await notificationApiService.getAllNotification(loginUserId);


                return response?.data?.notifications?.filter(
                    (data: NotificationType) =>
                        data?.message !== "" && data?.recipientId === loginUserId
                );


            } catch (error) {
                console.error("Error fetching client:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })


    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const dataSendToBackend = { notificationId: id, userId: loginUserId }

            await notificationApiService.deleteNotification(dataSendToBackend)
        },
        onMutate: () => {
            setIsLoader(true)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
            toast.success("Notification has deleted successfully")

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to delete the department!');
            setIsLoader(false)
        },
    })
    const { totalPages,
        getCurrentRecords,
        handlePageChange, currentPage,
    } = usePaginationHook({ data: notificationData ?? [], recordPerPage: 6 })

    const handleDeleteFun = (id: string) => {
        dispatch(isModalDeleteReducer(true))
        setSelectedNotificationId(id)
    }
    const handleDeleteConfirm = () => {
        deleteMutation.mutate(selectedNotificationId);

        dispatch(isModalDeleteReducer(false))
    }

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewNotification = (notification: NotificationType) => {
            toast.info(notification.title || "New Notification");
            queryClient.invalidateQueries({ queryKey: ["notifications"] }); // ✅ This is the fixed version
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, []);





    return (
        <OutletLayout heading='Notifications'>
            {isLoader && <Loader text='Deleting...' />}
            {isModalDelete && selectedNotificationId && <DeleteClientModal onDeleteConfirm={handleDeleteConfirm} text={<div>By Deleting this notification you won’t be able to track record of your Notification. Are you sure that you want to <span className='font-semibold'>Delete this notification</span>?</div>}
            />}
            {getCurrentRecords()?.length === 0 ? <NoRecordFound /> :
                <>
                    <div className='h-[65vh] overflow-y-auto '>

                        {getCurrentRecords()?.map(data => <div className='flex items-center justify-between font-[Poppins] mb-4 mt-4 text-textGreyColor border-b-[1px] border-b-solid border-b-textGreyColor pb-4'>
                            <div className='flex items-start gap-x-4'>
                                <img
                                    // src={`${localhostBaseUrl}uploads/eSignatures/${data?.sender?.id !== loginUserId
                                    //     ? data?.sender?.profileImage?.split('/')?.pop()
                                    //     : data?.recipient?.profileImage?.split('/')?.pop()
                                    //     }`}
                                    src={`${data?.sender?.id !== loginUserId
                                        ? data?.sender?.profileImage
                                        : data?.recipient?.profileImage
                                        }`}
                                    alt="User"
                                    className="w-12 h-12 rounded-full object-cover"
                                />

                                <div className='w-[100%] sm:w-[80%] md:w-[70%] lg:w-[100%] '>
                                    <div className='flex items-center justify-between gap-x-5'>
                                        <div className='flex items-center gap-x-4'>
                                            <p className='font-semibold text-[14px] md:text-[16px] lg:text-[18px] text-textColor capitalize'>
                                                {data?.sender?.id === loginUserId
                                                    ? "you"
                                                    : data?.sender?.fullName}
                                            </p>
                                            <p className='font-semibold text-[18px]'>.</p>
                                            <p className='font-light text-[10px] lg:text-[12px] '>  {formatDistanceToNow(new Date(data?.createdAt), { addSuffix: true })}
                                            </p>
                                            {/* <p className=' font-semibold text-[18px]'>.</p>
                                <p className='font-light  text-[10px] lg:text-[12px] cursor-pointer'>Mark as Read</p> */}

                                        </div>
                                        <AiOutlineDelete className='text-redColor cursor-pointer block sm:hidden' size={18} onClick={() => toast.success("This feature is comming soon.")
                                        } />
                                    </div>
                                    <p className=' text-[12px] lg:text-[14px] '>{data?.message}</p>
                                </div>
                            </div>
                            <AiOutlineDelete className='text-redColor cursor-pointer hidden sm:block sm:text-[26px] md:text-[30px] lg:text-[20px]' onClick={() => handleDeleteFun(data?.id)} />
                        </div>)}
                    </div>
                    <CustomPagination totalPages={totalPages} onPageChange={handlePageChange} hookCurrentPage={currentPage} />
                </>
            }

        </OutletLayout>)
}

export default Notification









