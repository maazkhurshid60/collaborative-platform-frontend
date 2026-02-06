

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { GoDotFill } from "react-icons/go";
import { ProviderType } from "../../../types/providerType/ProviderType";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import Loader from "../../../components/loader/Loader";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../../components/icons/back/Back";
import LabelData from "../../../components/labelText/LabelData";
import UserIcon from "../../../components/icons/user/User";
import Button from "../../../components/button/Button";
import { User } from "../../../types/clientType/ClientType";
import { toast } from "react-toastify";
import {
  isModalShowReducser,
  isModalShowRejectReducer,
  isModalShowRestoreReducer,
} from "../../../redux/slices/ModalSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import VerifyAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/VerifyAccountModal";
import verifyBadge from "../../../assets/images/verifyBadge.png";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";
import RejectAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RejectAccountModal";
import RestoreAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RestoreAccountModal";

const ViewUser = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ for preserving ?page= & ?q=
  const { id } = useParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow);
  const showRejectModal = useSelector(
    (state: RootState) => state.modalSlice.isShowRejectModal
  );
  const showRestoreModal = useSelector(
    (state: RootState) => state.modalSlice.isShowRestoreModal
  );

  // ✅ Back should return to the list WITH the same query params
  // e.g. /verified-users?page=3&q=ali
  const handleBack = () => {
    navigate(`/verified-users${location.search}`);
  };

  // FETCH ALL USERS
  const { data: userData, isLoading, isError } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await loginUserApiService.getAllUsersApi();
        return response?.user ?? [];
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // Derive selected user from query data
  const selectedUserData = useMemo(() => {
    return userData?.find((u) => u?.id === id);
  }, [userData, id]);

  // Approve / Reject / Restore
  const approveUserFun = async (data: User) => {
    try {
      await loginUserApiService.approveUsersApi({
        id: data?.id,
        name: data?.fullName,
        email: data?.email,
      });

      toast.success("User approved successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
        email: data?.email,
      });

      toast.success("User rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      dispatch(isModalShowRejectReducer(false));
    } catch (error) {
      console.error("Reject failed:", error);
      toast.error("Failed to reject user");
      dispatch(isModalShowRejectReducer(false));
    }
  };

  const restoreFunction = async (data: User) => {
    try {
      await loginUserApiService.restoreUsersApi({
        id: data?.id,
        name: data?.fullName,
        email: data?.email,
      });

      toast.success("User restored successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      dispatch(isModalShowRestoreReducer(false));
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error("Failed to restore user");
      dispatch(isModalShowRestoreReducer(false));
    }
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>Something went wrong</p>;

  // If id not found
  if (!selectedUserData) {
    return (
      <OutletLayout
        heading="User profile"
        backButton={
          <div className="relative z-50">
            {/* ✅ Back preserves list page/search */}
            <BackIcon onClick={handleBack} />
          </div>
        }
      >
        <p className="mt-6 text-red-600">User not found.</p>
      </OutletLayout>
    );
  }

  return (
    <OutletLayout
      heading="User profile"
      backButton={
        <div className="relative z-50">
          {/* ✅ Back preserves list page/search */}
          <BackIcon onClick={handleBack} />
        </div>
      }
    >
      {/* MODALS */}
      {showModal && (
        <VerifyAccountModal
          onConfirm={async () => await approveUserFun(selectedUserData)}
          onCancel={() => dispatch(isModalShowReducser(false))}
        />
      )}

      {showRejectModal && (
        <RejectAccountModal
          onConfirm={async () => await rejectFunction(selectedUserData)}
          onCancel={() => dispatch(isModalShowRejectReducer(false))}
        />
      )}

      {showRestoreModal && (
        <RestoreAccountModal
          onConfirm={async () => await restoreFunction(selectedUserData)}
          onCancel={() => dispatch(isModalShowRestoreReducer(false))}
        />
      )}

      <div className="mt-6">
        {/* IMAGE */}
        <div>
          <LabelData label="User Image" />
          {selectedUserData?.profileImage !== null &&
            selectedUserData?.profileImage !== "null" ? (
            <img
              src={selectedUserData?.profileImage}
              alt="User"
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <UserIcon className="text-6xl mt-2" />
          )}
        </div>

        {/* DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
          <LabelData label="Full Name" data={selectedUserData?.fullName} />
          <LabelData label="License Number" data={selectedUserData?.licenseNo} />
          <LabelData label="Age" data={selectedUserData?.age ?? "-"} />

          <LabelData
            label="Email"
            data={selectedUserData?.email ?? "-"}
          />

          <LabelData label="Contact Number" data={selectedUserData?.contactNo ?? "-"} />
          <LabelData
            label="Country"
            data={getCountryNameFromCode(selectedUserData?.country ?? "") ?? "-"}
          />
          <LabelData label="State" data={selectedUserData?.state ?? "-"} />
          <LabelData label="Address" data={selectedUserData?.address ?? "-"} />

          {/* PROVIDER CLIENT LIST */}
          {selectedUserData?.role === "provider" && (
            <div>
              <LabelData label="List of Active Clients" />

              {selectedUserData?.clientList === undefined ||
                selectedUserData?.clientList?.filter(
                  (d: ProviderType) => d.client?.clientShowToOthers === true
                ).length === 0 ? (
                <p className="text-[14px] py-0.5 font-medium text-textGreyColor">
                  No Clients
                </p>
              ) : (
                selectedUserData?.clientList
                  ?.filter(
                    (p: ProviderType) => p?.client?.clientShowToOthers === true
                  )
                  .map((p: ProviderType, index: number) => (
                    <p
                      className="flex items-center gap-x-1 capitalize text-[14px] py-0.5 font-medium text-textGreyColor"
                      key={index}
                    >
                      <GoDotFill className="text-[6px]" />
                      {p?.client?.user?.fullName}
                    </p>
                  ))
              )}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-end justify-end mt-8">
          {selectedUserData?.isApprove === "PENDING" ? (
            <div className="flex items-center gap-x-4 w-[200px]">
              <div className="w-[100%]">
                <Button
                  text="Reject"
                  danger
                  onclick={() => dispatch(isModalShowRejectReducer(true))}
                />
              </div>

              <div className="w-[100%]">
                <Button
                  text="Approve"
                  onclick={() => dispatch(isModalShowReducser(true))}
                />
              </div>
            </div>
          ) : selectedUserData?.isApprove === "REJECTED" ? (
            <div className="w-[100px]">
              <Button
                text="Restore"
                onclick={() => dispatch(isModalShowRestoreReducer(true))}
              />
            </div>
          ) : (
            <img src={verifyBadge} className="h-16" alt="Verified" />
          )}
        </div>
      </div>
    </OutletLayout>
  );
};

export default ViewUser;
