import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { DeleteIcon, EditIcon, ViewIcon } from "lucide-react";

import ShareDocumentIcon from "@/components/icons/share/ShareDocument";
import { ClientType, Provider } from "@/types/clientType/ClientType";

interface ClientItemPropsType {
  data: ClientType;
  rowIndex: number;
  handleDelete: (id: string, providerId: string, isCreator: boolean) => void;
  loginUserId?: string;
  navigate: (path: string, state?: any) => void;
  currentPage: number;
  recordPerPage: number;
}

const ClientItem = ({
  data,
  rowIndex,
  currentPage,
  recordPerPage,
  handleDelete,
}: ClientItemPropsType) => {
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const serialNo = (currentPage - 1) * recordPerPage + rowIndex + 1;
  const navigate = useNavigate();

  const canEditDelete =
    loginUserId?.user?.role === "superAdmin" ||
    data?.createdByProviderId === loginUserId?.id ||
    data?.createdByProviderId === loginUserId?.user?.id;

  return (
    <tr
      key={data?.id ?? rowIndex}
      className="border-b border-b-solid border-b-lightGreyColor"
    >
      {/* S.No */}
      <td className="px-2 py-3 align-middle whitespace-nowrap">{serialNo}</td>

      {/* Name */}
      <td className="px-2 py-3 align-middle whitespace-nowrap">
        {data?.user?.fullName}
      </td>

      {/* Client ID */}
      <td className="px-2 py-3 align-middle whitespace-nowrap">
        {data?.clientId ?? "-"}
      </td>

      {/* Gender */}
      <td className="px-2 py-3 align-middle whitespace-nowrap capitalize">
        {data?.user?.gender === "PREFER_NOT_TO_SAY"
          ? "Prefer not to say"
          : String(data?.user?.gender).toLowerCase()}
      </td>

      {/* Email (truncate) */}
      <td className="px-2 py-3 align-middle">
        <span
          className="block max-w-60 truncate lowercase"
          title={data?.user?.email}
        >
          {data?.user?.email}
        </span>
      </td>

      {/* Status (pill) */}
      <td className="px-2 py-4">
        <span
          className={`px-3 py-1 rounded-md text-sm font-medium ${data?.user?.status?.toLowerCase() === "active" ? " text-primaryColorDark" : "text-redColor"}`}
        >
          {data?.user?.status?.toLowerCase()}
        </span>
      </td>

      {/* Country */}
      {/* <td className="px-2 py-3 align-middle whitespace-nowrap">
                      {getCountryNameFromCode(data?.user?.country ?? "")}
                    </td> */}

      {/* State */}
      <td className="px-2 py-3 align-middle whitespace-nowrap">
        {data?.user?.state}
      </td>

      {/* Is Verified (pill) */}
      <td className="px-2 py-3 align-middle whitespace-nowrap">
        <span
          className={[
            "inline-block rounded-md px-3 py-1 text-sm",
            data?.user?.isApprove === "APPROVED"
              ? "text-primaryColorDark"
              : "text-redColor",
          ].join(" ")}
        >
          {data?.user?.isApprove === "APPROVED" ? "Verified" : "Pending"}
        </span>
      </td>

      {/* Providers (stable) */}
      <td className="px-2 py-3 align-middle">
        {data?.providerList?.length ? (
          <div className="min-w-0">
            {data?.providerList
              ?.slice()
              ?.sort((a, b) => {
                const isA = a?.provider?.user?.id === loginUserId?.user?.id;
                const isB = b?.provider?.user?.id === loginUserId?.user?.id;
                return isA === isB ? 0 : isA ? -1 : 1;
              })
              ?.slice(0, 2)
              ?.map((providerItem: Provider, index) => (
                <p
                  className="capitalize truncate max-w-55"
                  key={index}
                  title={providerItem?.provider?.user?.fullName}
                >
                  {providerItem?.provider?.user?.fullName}
                </p>
              ))}

            {(data?.providerList?.length ?? 0) > 2 && (
              <p
                className="text-primaryColor cursor-pointer mt-1 text-primaryColorDark whitespace-nowrap"
                onClick={() => navigate(`/clients/${data?.id}`)}
              >
                ... View All
              </p>
            )}
          </div>
        ) : (
          <p className="whitespace-nowrap">No Providers Found</p>
        )}
      </td>

      {/* Action (fixed padding + equal icon boxes) */}
      <td className="px-2 py-3  align-middle whitespace-nowrap">
        <div className="flex items-center gap-x-1.5">
          <div className="w-5 h-5 flex items-center justify-start">
            <ViewIcon onClick={() => navigate(`/clients/${data?.id}`)} />
          </div>
          <div className="w-5 h-5 flex items-center justify-center">
            <ShareDocumentIcon
              onClick={() =>
                navigate(`/clients/edit-client/${data?.id}`, {
                  state: { view: "documents" },
                })
              }
            />
          </div>
          {canEditDelete && (
            <div className="w-5 h-5 flex items-center justify-center">
              <EditIcon
                onClick={() => navigate(`/clients/edit-client/${data?.id}`)}
              />
            </div>
          )}
          <div className="w-5 h-5 flex items-center justify-center">
            <DeleteIcon
              onClick={() =>
                handleDelete(data?.id ?? "", loginUserId?.id, canEditDelete)
              }
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ClientItem;
