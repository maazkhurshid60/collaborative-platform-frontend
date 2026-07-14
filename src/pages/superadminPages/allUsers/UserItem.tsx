import { GoDotFill } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import ApproveIcon from "../../../components/icons/approve/Approve";
import RejectIcon from "../../../components/icons/reject/Reject";
import RestoreIcon from "../../../components/icons/restore/RestoreIcon";
import ViewIcon from "../../../components/icons/view/View";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import UserIcon from "../../../components/icons/user/User";
import { User } from "../../../types/providerType/ProviderType";

interface UserItemProp {
  user: User;
  idx: number;
  currentPage: number;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  onRestore: (user: User) => void;
  onDelete: (user: User) => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-primaryColorDark/20 text-textColor";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "REJECTED":
      return "bg-redColor/20 text-red-700";
    default:
      return "bg-inputBgColor text-gray-500";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "Verified";
    case "PENDING":
      return "Pending";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
};

const UserItem = ({
  user,
  idx,
  currentPage,
  onApprove,
  onReject,
  onRestore,
  onDelete,
}: UserItemProp) => {
  const navigate = useNavigate();

  return (
    <tr className="border-b border-b-solid border-b-lightGreyColor pb-4">
      <td className="px-4 py-3 align-middle">
        {(currentPage - 1) * 7 + (idx + 1)}
      </td>

      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-x-4">
          <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
            {user?.profileImage && user.profileImage !== "null" ? (
              <img
                className="w-10 h-10 object-cover"
                src={user.profileImage}
                alt="User"
              />
            ) : (
              <UserIcon size={30} />
            )}
          </div>
          <div className="min-w-0 text-left flex flex-col gap-y-0.5">
            <p className="capitalize leading-5">{user?.fullName}</p>
            <p className="truncate text-gray-500 leading-5">
              {user?.email?.toLowerCase()}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 align-middle whitespace-nowrap">
        {user.role === "client" ? user?.client?.clientId : user?.licenseNo}
      </td>

      <td className="px-4 py-3 align-middle whitespace-nowrap">{user.state}</td>

      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${getStatusStyle(user.isApprove as string)}`}
        >
          <GoDotFill className="text-base" />
          {getStatusLabel(user.isApprove as string)}
        </span>
      </td>

      <td className="px-4 py-3 align-middle whitespace-nowrap capitalize">
        {user?.role}
      </td>

      <td className="px-4 py-3 align-middle whitespace-nowrap">
        {user?.createdAt?.split("T")[0]}
      </td>

      <td className="px-4 py-3 align-middle whitespace-nowrap">
        <div className="flex items-center justify-start gap-x-2 h-full">
          {user.isApprove === "PENDING" && (
            <>
              <ApproveIcon onClick={() => onApprove(user)} />
              <RejectIcon onClick={() => onReject(user)} />
            </>
          )}
          {user.isApprove === "REJECTED" && (
            <RestoreIcon onClick={() => onRestore(user)} />
          )}

          <ViewIcon
            onClick={() => navigate(`/all-users/view-user/${user?.id}`)}
          />
          <DeleteIcon onClick={() => onDelete(user)} />
        </div>
      </td>
    </tr>
  );
};

export default UserItem;
