import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RiArrowLeftSLine } from "react-icons/ri";
import { useMutation, useQuery } from "@tanstack/react-query";

import OutletLayout from "../../layouts/outletLayout/OutletLayout";

import BlockList from "../../components/pagesComponent/settings/blockList/BlockList";
import { AppDispatch, RootState } from "../../redux/store";
import { isBlockScreenShowReducer } from "../../redux/slices/BlockListUserSlice";
import CheckBox from "../../components/toggle/Toggle";
import Loader from "../../components/loader/Loader";
import { blockListDataType } from "../../types/usersType/UsersType";
import loginUserApiService from "../../apiServices/loginUserApi/LoginUserApi";
import { isModalDeleteReducer } from "../../redux/slices/ModalSlice";
import DeleteClientModal from "../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { disconnectSocket } from "../../socket/Socket";
import BackIcon from "../../components/icons/back/Back";

const UserSetting = () => {
  const isBlockListScreen = useSelector(
    (state: RootState) => state.blockListUserSlice.isBlockScreenShow,
  );
  const dispatch = useDispatch<AppDispatch>();
  const isShowDeleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );
  const navigate = useNavigate();

  // Notification Toggle State
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  const {
    data: allUsersData,
    isLoading,
    isError,
  } = useQuery<blockListDataType | blockListDataType[]>({
    queryKey: ["loginUser"],
    queryFn: async () => {
      const response = await loginUserApiService.getAllUsersApi();
      return response?.user;
    },
  });

  let filteredData: blockListDataType[] | undefined;

  if (Array.isArray(allUsersData)) {
    // Show all users EXCEPT the logged-in user themselves
    // BlockUserAccount handles the "Block"/"Unblock" button state internally via Redux
    filteredData = allUsersData.filter(
      (user) => user.id !== loginUserDetail?.user?.id,
    );
  } else if (allUsersData && typeof allUsersData === "object") {
    if (allUsersData.id !== loginUserDetail?.user?.id) {
      filteredData = [allUsersData];
    } else {
      filteredData = [];
    }
  }

  const deleteMe = () => {
    deleteMeMutation.mutate();
  };

  const deleteMeMutation = useMutation({
    mutationFn: async () => {
      return await loginUserApiService.deleteMeApi(loginUserDetail.user.id);
    },
    onSuccess: () => {
      dispatch(isModalDeleteReducer(false));
      toast.error("Client has been deleted successfully.");
      disconnectSocket();
      localStorage.removeItem("token");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to delete your account!");
    },
  });

  const handleNotificationToggle = () => {
    setIsNotificationEnabled(!isNotificationEnabled);
    if (!isNotificationEnabled) {
      toast.success("Notifications enabled successfully");
    } else {
      toast.success("Notifications disabled successfully");
    }
  };

  if (isLoading) {
    return <Loader text="Loading..." />;
  }
  if (isError) {
    return <p>something went wrong</p>;
  }

  return (
    <OutletLayout backButton={<BackIcon onClick={() => navigate(-1)} />}>
      {isBlockListScreen && <BlockList blockListData={filteredData} />}
      {isShowDeleteModal && (
        <DeleteClientModal
          heading="Delete Account"
          onDeleteConfirm={deleteMe}
          text={
            <div>
              Deleting your account will permanently remove access to your data,
              including signed documents. This action cannot be undone. Are you
              sure you want to continue?
            </div>
          }
        />
      )}
      {/* <UserAccount name={loginUserDetail.user?.fullName} email={loginUserDetail.email} profile={loginUserDetail?.user?.profileImage} /> */}
      <p className="  px-6   font-[Poppins] font-bold text-[25px]">
        Account Settings
      </p>

      <div className="flex flex-col gap-4 mt-6">
        {/* Email Box */}
        {/* <div className='border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center'>
                    <p className='text-[16px] font-medium'>Email</p>
                    <p className='text-textGreyColor font-medium text-[12px] md:text-[14px] mt-0.5'>{loginUserDetail.user?.email}</p>
                </div> */}

        {/* Change Password Box */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[16px] font-medium">Change Password</p>
            <p className="text-textGreyColor text-[12px] md:text-[14px] mt-0.5">
              Change password to secure your account
            </p>
          </div>
          <NavLink to="/setting/change-password">
            <RiArrowLeftSLine className="rotate-180 text-textGreyColor cursor-pointer text-4xl md:text-2xl" />
          </NavLink>
        </div>

        {/* Notification Box */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[16px] font-medium">Notifications</p>
            <p className="text-textGreyColor font-medium text-[12px] md:text-[14px] mt-0.5">
              Enable notifications to stay up-to-date
            </p>
          </div>
          <CheckBox
            checked={isNotificationEnabled}
            onChange={handleNotificationToggle}
          />
        </div>

        {/* 2FA Settings Box - Only for Providers */}
        {loginUserDetail?.user?.role === "provider" && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[16px] font-medium">
                Two-Factor Authentication (2FA)
              </p>
              <p className="text-textGreyColor text-[12px] md:text-[14px] mt-0.5">
                Enable 2FA for extra account security
              </p>
            </div>
            <NavLink to="/setting/two-factor">
              <RiArrowLeftSLine className="rotate-180 text-textGreyColor cursor-pointer text-4xl md:text-2xl" />
            </NavLink>
          </div>
        )}

        {/* Block Box */}
        <div
          className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => {
            dispatch(isBlockScreenShowReducer(true));
          }}
        >
          <div>
            <p className="text-[16px] font-medium">Block</p>
            <p className="text-textGreyColor text-[12px] md:text-[14px] mt-0.5">
              If you find offensive messages you can block the person
            </p>
          </div>
          <RiArrowLeftSLine className="rotate-180 text-textGreyColor text-4xl md:text-2xl" />
        </div>

        {/* Delete Account Box */}
        <div
          className="border border-red-200 rounded-xl p-5 bg-red-50 shadow-sm flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => dispatch(isModalDeleteReducer(true))}
        >
          <div>
            <p className="text-[16px] font-medium text-redColor">
              Delete my Account
            </p>
            <p className="text-redColor/70 text-[12px] md:text-[14px] mt-0.5">
              Permanently delete my account
            </p>
          </div>
          <RiArrowLeftSLine className="rotate-180 text-redColor text-4xl md:text-2xl" />
        </div>
      </div>
    </OutletLayout>
  );
};

export default UserSetting;
