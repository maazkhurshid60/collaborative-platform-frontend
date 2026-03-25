import OutletLayout from '../../layouts/outletLayout/OutletLayout'
import UserAccount from '../../components/pagesComponent/settings/userAccount/UserAccount';
import { RiArrowLeftSLine } from "react-icons/ri";
import LabelText from '../../components/labelText/LabelText';
import BlockList from '../../components/pagesComponent/settings/blockList/BlockList';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { isBlockScreenShowReducer } from '../../redux/slices/BlockListUserSlice';
import CheckBox from '../../components/toggle/Toggle';
import Loader from '../../components/loader/Loader';
import { useMutation, useQuery } from '@tanstack/react-query';
import { blockListDataType } from '../../types/usersType/UsersType';
import loginUserApiService from '../../apiServices/loginUserApi/LoginUserApi';
import { isModalDeleteReducer } from '../../redux/slices/ModalSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeleteClientModal from '../../components/modals/providerModal/deleteClientModal/DeleteClientModal';
import { NavLink } from 'react-router-dom';
import { disconnectSocket } from '../../socket/Socket';
import BackIcon from '../../components/icons/back/Back';
const UserSetting = () => {
    const isBlockListScreen = useSelector((state: RootState) => state.blockListUserSlice.isBlockScreenShow)
    const dispatch = useDispatch<AppDispatch>()
    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails)
    const navigate = useNavigate()
    const { data: allUsersData, isLoading, isError } = useQuery<blockListDataType | blockListDataType[]>({
        queryKey: ["loginUser"],
        queryFn: async () => {
            try {
                const response = await loginUserApiService.getAllUsersApi();
                return response?.user; // could be a single object or an array
            } catch (error) {
                console.error("Error fetching all users:", error);
                return [] as blockListDataType[]; // Return an empty array in case of an error
            }
        }
    })
    // console.log(allUsersData?.blockedMembers, 'alluserddata');

    let filteredData: blockListDataType[] | undefined;

    if (Array.isArray(allUsersData)) {
        // Show all users EXCEPT the logged-in user themselves
        // BlockUserAccount handles the "Block"/"Unblock" button state internally via Redux
        filteredData = allUsersData.filter(
            (user) => user.id !== loginUserDetail?.user?.id
        );
    } else if (allUsersData && typeof allUsersData === 'object') {
        if (allUsersData.id !== loginUserDetail?.user?.id) {
            filteredData = [allUsersData];
        } else {
            filteredData = [];
        }
    }

    const deleteMe = () => {
        deleteMeMutation.mutate()
    }

    const deleteMeMutation = useMutation({
        mutationFn: async () => {
            return await loginUserApiService.deleteMeApi(loginUserDetail.user.id);
        },
        onMutate: () => {

        },
        onSuccess: () => {
            dispatch(isModalDeleteReducer(false))
            toast.error('Your Account has deleted successfully.');
            disconnectSocket();
            localStorage.removeItem("token")
            navigate("/")
        },
        onError: () => {
            toast.error('Failed to delete your account!');

        },

    });
    if (isLoading) {
        return <Loader text='Loading...' />
    }
    if (isError) {
        return <p>something went wrong</p>
    }


    return (
        <OutletLayout heading='Settings' backButton={<BackIcon onClick={() => navigate(-1)} />}>
            {isBlockListScreen && <BlockList blockListData={filteredData} />}
            {isShowDeleteModal && <DeleteClientModal heading='Delete Account' onDeleteConfirm={deleteMe} text={<div>By Deleting this you account you won’t be able to track record of your signed Documents. Are you sure that you want to <span className='font-semibold'>Delete your Account</span>?</div>}
            />}
            <UserAccount name={loginUserDetail.user?.fullName} email={loginUserDetail.email} profile={loginUserDetail?.user?.profileImage} />
            <p className='bg-inputBgColor rounded-[8px] px-6 py-2 mt-6 font-[Poppins] font-semibold text-[18px]'>Account Setting</p>
            <div className='mt-6'>
                <p className='text-[16px] font-medium'>Email</p>
                <p className={` text-textGreyColor font-medium text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]`}>{loginUserDetail.email}</p>
            </div>

            <div className='flex items-center justify-between mt-6'>
                <div>
                    <p className='text-[16px] font-medium'>Change Password</p>
                    <p className='text-textGreyColor text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]'>Change password to secure your account</p>
                </div>
                <NavLink to="/setting/change-password">

                    <RiArrowLeftSLine className='rotate-[180deg] text-textGreyColor cursor-pointer text-4xl  md:text-2xl' />
                </NavLink>
            </div>
            <hr className='h-[1px] text-textGreyColor mt-4' />



            <div>
                <div>
                    <div className='flex items-center justify-between mt-6 w-full '>
                        <div>
                            <p className='text-[16px] font-medium'>Notification</p>
                            <p className={`text-textGreyColor font-medium text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]`}>Enable notifications to stay up-to-date</p>
                        </div>
                        <CheckBox />
                    </div>
                </div>
            </div>
            <LabelText label='Block' text='If you find offensive messages you can block the person' onClick={() => { dispatch(isBlockScreenShowReducer(true)) }} />
            <div className='flex items-center justify-between mt-6'>
                <div>
                    <p className='text-[16px] font-medium text-redColor'>Delete my Account</p>
                    <p className='text-textGreyColor text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]'>Permanently delete my account</p>
                </div>
                <RiArrowLeftSLine className='rotate-[180deg] text-textGreyColor cursor-pointer text-4xl  md:text-2xl' onClick={() => dispatch(isModalDeleteReducer(true))} />
            </div>


        </OutletLayout >)
}

export default UserSetting