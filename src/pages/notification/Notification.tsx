
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
import UserIcon from '../../components/icons/user/User';


const NotificationPage = () => {

    const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id)
    const isModalDelete = useSelector((state: RootState) => state?.modalSlice.isModalDelete)
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const queryClient = useQueryClient()
    const [selectedNotificationId, setSelectedNotificationId] = useState<string>("")

    const { data: notificationData, isLoading } = useQuery<NotificationType[]>({
        queryKey: ["notifications", loginUserId],
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
        },
        enabled: !!loginUserId, // important only shows when user id exist
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
            toast.success("Notification has been deleted successfully")

            setIsLoader(false)
        },
        onError: () => {
            toast.error('Failed to delete the specialty!');
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

    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        "Notification" in window ? window.Notification.permission : "denied"
    );

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("This browser does not support desktop notifications.");
            return;
        }

        const permission = await window.Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission === "granted") {
            toast.success("Desktop notifications enabled!");
        } else if (permission === "denied") {
            toast.error("Notifications were denied. Please enable them in browser settings.");
        }
    };

    useEffect(() => {
        if (loginUserId) {
            notificationApiService.markAsSeen(loginUserId)
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
                });
        }
    }, [loginUserId, queryClient]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewNotification = (notification: NotificationType) => {
            // Toast will be handled in App.tsx globally now, 
            // but we keep invalidate query here for local UI update
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        };

        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("new_notification", handleNewNotification);
        };
    }, [queryClient]);
    return (
        <OutletLayout heading='Notifications'>
            {isLoader && <Loader text='Deleting...' />}
            {isModalDelete && selectedNotificationId && <DeleteClientModal onDeleteConfirm={handleDeleteConfirm} text={<div>By deleting this notification, you won’t be able to view it again. Are you sure you want to delete it?</div>}
            />}
            {permissionStatus !== "granted" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-full text-white">
                            <AiOutlineDelete className="rotate-180" /> {/* Just a placeholder icon */}
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900 text-sm">Stay Updated</h4>
                            <p className="text-blue-700 text-xs">Enable desktop notifications to get real-time alerts for document shares and signings.</p>
                        </div>
                    </div>
                    <button
                        onClick={requestNotificationPermission}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}
            {
                isLoading ? (
                    <Loader text="Loading Notifications..." />
                ) :

                    getCurrentRecords()?.length === 0 ? <NoRecordFound /> :
                        <>
                            <div className='h-[65vh] overflow-y-auto '>

                                {getCurrentRecords()?.map(data => <div className='flex items-center justify-between font-[Poppins] mb-4 mt-4 text-textGreyColor border-b-[1px] border-b-solid border-b-textGreyColor pb-4'>
                                    <div className='flex items-start gap-x-4'>

                                        {

                                            <UserIcon size={80} profileImg={data?.sender?.id !== loginUserId
                                                ? data?.sender?.profileImage
                                                : data?.recipient?.profileImage} />
                                        }

                                        <div className='w-[100%] sm:w-[80%] md:w-[70%] lg:w-[100%] '>
                                            <div className='flex items-center justify-between gap-x-5'>
                                                <div className='flex items-center gap-x-4'>
                                                    <p className='font-semibold text-[14px] md:text-[16px] lg:text-[18px] text-textColor capitalize flex items-center gap-2'>
                                                        {data?.sender?.id === loginUserId
                                                            ? "you"
                                                            : data?.sender?.fullName}
                                                        {data?.type && (
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                                                                {data.type.replace(/_/g, " ")}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className='font-semibold text-[18px]'>.</p>
                                                    <p className='font-light text-[10px] lg:text-[12px] '>  {formatDistanceToNow(new Date(data?.createdAt), { addSuffix: true })}
                                                    </p>

                                                </div>
                                                <AiOutlineDelete className='text-redColor cursor-pointer block sm:hidden' size={18} onClick={() => handleDeleteFun(data?.id)} />
                                            </div>
                                            {data?.title && (
                                                <p className="font-semibold text-[13px] md:text-[15px] text-[#2C9993] mt-1 mb-0.5">
                                                    {data.title}
                                                </p>
                                            )}
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

export default NotificationPage









