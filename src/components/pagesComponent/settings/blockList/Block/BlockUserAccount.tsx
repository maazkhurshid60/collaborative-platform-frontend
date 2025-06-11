
import { useDispatch, useSelector } from 'react-redux'
import UserIcon from '../../../../icons/user/User'
import { AppDispatch, RootState } from '../../../../../redux/store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import loginUserApiService from '../../../../../apiServices/loginUserApi/LoginUserApi'
import { toast } from 'react-toastify'
import { updateBlockedMembers } from '../../../../../redux/slices/LoginUserDetailSlice'
interface BlockUserAccountProps {
    image?: string
    fullName?: string
    isBlocked?: boolean
    id: string
}
const BlockUserAccount: React.FC<BlockUserAccountProps> = (props) => {
    const loginUserDetails = useSelector((state: RootState) => state.LoginUserDetail?.userDetails)
    const isBlocked = loginUserDetails?.user?.blockedMembers?.includes(props.id)
    const queryClient = useQueryClient()
    const dispatch = useDispatch<AppDispatch>()
    const userStatus = {
        id: props.id ?? "",
        fullName: props.fullName ?? "",
        isBlocked: isBlocked
    };
    const blockUserAccount = (blockUserid: string) => {
        const dataSendToBackend = {
            blockUserid,
            loginUserId: loginUserDetails.user.id
        }
        blockUserMutation.mutate(dataSendToBackend);


    }

    const unblockUserAccount = (blockUserid: string) => {
        const dataSendToBackend = {
            blockUserid,
            loginUserId: loginUserDetails.user.id
        }

        unblockUserMutation.mutate(dataSendToBackend);
    }

    const blockUserMutation = useMutation({
        mutationFn: async (dataSendToBackend: { blockUserid: string; loginUserId: string }) => {
            return await loginUserApiService.blockUserApi(dataSendToBackend);
        },
        onMutate: () => {

        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['loginUser'] });
            toast.success("Account has blocked successfully")

            dispatch(updateBlockedMembers(response?.data?.user?.blockedMembers));


        },
        onError: () => {
            toast.error('Failed to block the account!');

        },

    });


    const unblockUserMutation = useMutation({
        mutationFn: async (dataSendToBackend: { blockUserid: string; loginUserId: string }) => {
            return await loginUserApiService.unBlockUserApi(dataSendToBackend);
        },
        onMutate: () => {
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['loginUser'] });
            toast.success("Account has unblocked successfully")

            dispatch(updateBlockedMembers(response?.data?.user?.blockedMembers));

        },
        onError: () => {
            toast.error('Failed to unblock the account!');
        },

    });

    return (
        <div>


            <div className='flex items-center justify-between mt-6 border-b-[1px] border-b-lightGreyColor/30 border-b-solid pb-4'>
                <div className='flex items-center bg-white relative gap-x-2 '>
                    <UserIcon className="text-[22px] md:text-[30px] lg:text-[30px]" />

                    <div className='flex items-center gap-x-10'>
                        <div className='font-[Poppins]'>
                            <p className=' text-textColor font-semibold text-[12px] md:text-[14px] '>{userStatus.fullName}</p>

                        </div>

                    </div>
                </div>
                <p className={`text-center  border-solid border-[1px] rounded-full w-[70px] py-1 text-[12px]  font-semibold  cursor-pointer ${userStatus?.isBlocked ? "text-textGreyColor border-textGreyColor" : "text-redColor border-redColor"}`}
                    onClick={() =>
                        userStatus?.isBlocked
                            ? unblockUserAccount(userStatus.id)
                            : blockUserAccount(userStatus.id)
                    }>
                    {userStatus.isBlocked ? "Remove" : "Block"}</p>
            </div>
        </div>

    )
}

export default BlockUserAccount