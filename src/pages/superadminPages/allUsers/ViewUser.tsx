
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { GoDotFill } from 'react-icons/go'
import { ProviderType } from '../../../types/providerType/ProviderType'
import loginUserApiService from '../../../apiServices/loginUserApi/LoginUserApi'
import Loader from '../../../components/loader/Loader'
import OutletLayout from '../../../layouts/outletLayout/OutletLayout'
import BackIcon from '../../../components/icons/back/Back'
import LabelData from '../../../components/labelText/LabelData'
import UserIcon from '../../../components/icons/user/User'
import Button from '../../../components/button/Button'
import { User } from '../../../types/clientType/ClientType'
import { toast } from 'react-toastify'
import { isModalShowReducser, isModalShowRejectReducer, isModalShowRestoreReducer } from '../../../redux/slices/ModalSlice'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../redux/store'
import VerifyAccountModal from '../../../components/modals/superAdminModal/deleteAccountModal/VerifyAccountModal'
import verifyBadge from "../../../assets/images/verifyBadge.png"
import { getCountryNameFromCode } from '../../../utils/GetCountryName'
import RejectAccountModal from '../../../components/modals/superAdminModal/deleteAccountModal/RejectAccountModal'
import RestoreAccountModal from '../../../components/modals/superAdminModal/deleteAccountModal/RestoreAccountModal'

const ViewUser = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedUserData, setSelectedUserData] = useState<User>()
    const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow)
    const showRejectModal = useSelector((state: RootState) => state.modalSlice.isShowRejectModal);
    const showRestoreModal = useSelector((state: RootState) => state.modalSlice.isShowRestoreModal)

    //FETCH ALL PROVIDERS
    const { data: userData, isLoading, isError } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async () => {
            try {
                const response = await loginUserApiService.getAllUsersApi();

                return response?.user // Ensure it always returns an array

            } catch (error) {
                console.error("Error fetching providers:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })



    const approveUserFun = async (data: User) => {
        try {
            await loginUserApiService.approveUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });

            toast.success("User approved successfully");

            // Invalidate and refetch the users query
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowReducser(false));


        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to approve user");
            dispatch(isModalShowReducser(false));

        }
    };

    const rejectFunction = async (data: User) => {
        try {
            await loginUserApiService.rejectUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });
            toast.success("User rejected successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowReducser(false));
        } catch (error) {
            console.error("Rejected failed:", error);
            toast.error("Failed to rejected user");
            dispatch(isModalShowReducser(false));
        }
    };

    const restoreFunction = async (data: User) => {
        try {
            await loginUserApiService.restoreUsersApi({
                id: data?.id,
                name: data?.fullName,
                email: data?.client?.email || data?.provider?.email,
            });
            toast.success("User restored successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            dispatch(isModalShowRestoreReducer(false));
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Failed to restore user");
            dispatch(isModalShowRestoreReducer(false));
        }
    };


    console.log("Selected User Data", selectedUserData);

    useEffect(() => {
        setSelectedUserData(userData?.find(data => data?.id === id));

    }, [id])

    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>somethingwent wrong</p>
    }
    return (
        <OutletLayout heading='User profile'>

            {showModal && selectedUserData && (
                <VerifyAccountModal
                    onConfirm={async () => {
                        await approveUserFun(selectedUserData);

                    }}
                    onCancel={() => {

                        dispatch(isModalShowReducser(false));
                    }}
                />
            )}

            {showRejectModal && selectedUserData && (
                <RejectAccountModal
                    onConfirm={async () => await rejectFunction(selectedUserData)}
                    onCancel={() => {
                        dispatch(isModalShowRejectReducer(false));
                    }}
                />
            )}


            {showRestoreModal && selectedUserData && (
                <RestoreAccountModal
                    onConfirm={async () => await restoreFunction(selectedUserData)}
                    onCancel={() => {
                        setSelectedUserData(undefined);
                        dispatch(isModalShowRestoreReducer(false));
                    }}
                />
            )}


            <div className='relative'>
                <div className='absolute  -left-2 -top-14 md:-top-23.5 md:-left-2.5 lg:-left-5 lg:-top-14'>

                    <BackIcon onClick={() => navigate(-1)} />
                </div>
            </div>
            <div className='mt-6'>
                <div>
                    <LabelData label='User Image' />
                    {(selectedUserData?.profileImage !== null && selectedUserData?.profileImage !== "null") ? <img
                        src={selectedUserData?.profileImage}
                        alt="Client"
                        className="w-20 h-20 rounded-lg object-cover"
                    /> : <UserIcon className='text-6xl mt-2' />}

                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10'>
                    <div className=''>
                        <LabelData label='Full Name' data={selectedUserData?.fullName} />
                    </div>
                    <div className=''>
                        <LabelData label='License Number' data={selectedUserData?.licenseNo} />
                    </div>
                    <div className=''>
                        <LabelData label='Age' data={selectedUserData?.age ?? "-"} />
                    </div>

                    <div className=''>
                        <LabelData
                            label='Email'
                            data={
                                selectedUserData?.client?.email ? selectedUserData.client.email : selectedUserData?.provider?.email ?? "-"
                            }
                        />
                    </div>
                    <div className=''>
                        <LabelData label='Contact Number' data={selectedUserData?.contactNo ?? "-"} />
                    </div>

                    <div className=''>
                        <LabelData label='Country' data={getCountryNameFromCode(selectedUserData?.country ?? "") ?? "-"} />
                    </div>
                    <div className=''>
                        <LabelData label='State' data={selectedUserData?.state ?? "-"} />
                    </div>
                    <div className=''>
                        <LabelData label='Address' data={selectedUserData?.address ?? "-"} />
                    </div>
                    {selectedUserData?.role === "provider" && <div className=' '>
                        <LabelData label='List of Active Clients' />


                        {selectedUserData?.clientList === undefined ||
                            selectedUserData?.clientList?.filter((data: ProviderType) => data.client?.clientShowToOthers === true).length === 0 ? (
                            <p className='text-[14px] py-0.5 font-medium text-textGreyColor'>No Clients</p>
                        ) : (
                            selectedUserData?.clientList
                                ?.filter((provider: ProviderType) => provider?.client?.clientShowToOthers === true)
                                .map((provider: ProviderType, index: number) => (
                                    <p
                                        className='flex items-center gap-x-1 capitalize text-[14px] py-0.5 font-medium text-textGreyColor'
                                        key={index}
                                    >
                                        <GoDotFill className='text-[6px]' />
                                        {provider?.client?.user?.fullName}
                                    </p>
                                ))
                        )}


                    </div>}

                </div>
                <div className='flex items-end justify-end'>

                    <div className=''>  {selectedUserData?.isApprove === "pending" ?
                        <div className='flex items-center gap-x-4 w-[200px]'>
                            <div className='w-[100%]'>

                                <Button text='Reject' danger onclick={() => dispatch(isModalShowRejectReducer(true))
                                } />
                            </div>
                            <div className='w-[100%]'>

                                <Button text='Approve' onclick={() => dispatch(isModalShowReducser(true))} />
                            </div>

                        </div>
                        : selectedUserData?.isApprove === "reject" ?
                            <div className='w-[100px]'>

                                <Button text='Restore' onclick={() => dispatch(isModalShowRestoreReducer(true))} />
                            </div>


                            : <img src={verifyBadge} className='h-16' />}</div>
                </div>
            </div>
        </OutletLayout>
    )
}

export default ViewUser