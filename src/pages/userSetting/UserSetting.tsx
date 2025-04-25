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
// const blockListData = [{ name: "Client1", isBlock: true }, { name: "Provider3", isBlock: false }, { name: "Client6", isBlock: false }, { name: "Provider12", isBlock: false }, { name: "Client2", isBlock: true }, { name: "Provider32", isBlock: true }]
const UserSetting = () => {
    const isBlockListScreen = useSelector((state: RootState) => state.blockListUserSlice.isBlockScreenShow)
    const dispatch = useDispatch<AppDispatch>()
    const isShowDeleteModal = useSelector((state: RootState) => state.modalSlice.isModalDelete)
    const loginUserDetail = useSelector((state: RootState) => state.LoginUserDetail.userDetails.user.id)
    const navigate = useNavigate()
    const { data: allUsersData, isLoading, isError } = useQuery<blockListDataType[]>({
        queryKey: ["loginUser"],
        queryFn: async () => {
            try {
                const response = await loginUserApiService.getAllUsersApi();

                return response?.data?.user; // Ensure it always returns an array


            } catch (error) {
                console.error("Error fetching all users:", error);
                return []; // Return an empty array in case of an error
            }
        }

    })

    const filteredData = allUsersData?.filter(data => !data?.blockedMembers?.includes(loginUserDetail))
    console.log("filteredData", filteredData);
    console.log("allUsersData", allUsersData && allUsersData[0]);

    const deleteMe = () => {
        deleteMeMutation.mutate()
    }

    const deleteMeMutation = useMutation({
        mutationFn: async () => {
            return await loginUserApiService.deleteMeApi(loginUserDetail);
        },
        onMutate: () => {

        },
        onSuccess: () => {
            dispatch(isModalDeleteReducer(false))
            toast.error('Your Account has deleted successfully.');

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
        return <p>somethingwent wrong</p>
    }

    console.log("isShowDeleteModal", isShowDeleteModal);


    return (
        <OutletLayout heading='Settings'>
            {isBlockListScreen && <BlockList blockListData={filteredData} />}
            {isShowDeleteModal && <DeleteClientModal onDeleteConfirm={deleteMe} />}
            <UserAccount name='John Doe' email='johndoe@gmail.com' />
            <p className='bg-inputBgColor rounded-[8px] px-6 py-2 mt-6 font-[Poppins] font-semibold text-[18px]'>Account Setting</p>
            <LabelText label='Email' text='johndoe@gmail.com' />

            <div className='flex items-center justify-between mt-6'>
                <div>
                    <p className='text-[16px] font-medium'>Password</p>
                    <p className='text-textGreyColor text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]'>Change password to secure your account</p>
                </div>
                <RiArrowLeftSLine className='rotate-[180deg] text-textGreyColor cursor-pointer text-4xl  md:text-2xl' />
            </div>
            <hr className='h-[1px] text-textGreyColor mt-4' />



            <div>
                <div className='flex items-center justify-between mt-6 w-full '>
                    <div>
                        <p className='text-[16px] font-medium'>Notification</p>
                        <p className={`text-textGreyColor font-medium text-[12px] md:text-[14px] mt-0.5 w-[90%]  sm:w-[80%] md:w-[100%]`}>Enable notifications to stay up-to-date</p>
                    </div>
                    <CheckBox />
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