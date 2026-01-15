// VerifiedUsers.tsx
// Preserves pagination + search when navigating to ViewUser and coming back.
//
// What changed (high level):
// 1) We store page + search in the URL: /verified-users?page=3&q=ali
// 2) When the component loads, it reads page/q from the URL and initializes state.
// 3) When user paginates or searches, we update both React state AND the URL.
// 4) When navigating to ViewUser, we include the same page/q in the link.

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import ViewIcon from "../../../components/icons/view/View";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import UserIcon from "../../../components/icons/user/User";
import { GoDotFill } from "react-icons/go";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";

import { useQuery } from "@tanstack/react-query";
import {
  DocModalData,
  documentSignByClientType,
} from "../../../types/documentType/DocumentType";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Loader from "../../../components/loader/Loader";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import { User } from "../../../types/providerType/ProviderType";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterUsers } from "../../../utils/FilteredUsers";

const VerifiedUsers = () => {
  const heading = [
    "Name",
    "License Number",
    "Country",
    "State",
    "Status",
    "Role",
    "Date",
    "Action",
  ];

  const showModal = useSelector((state: RootState) => state.modalSlice.isModalShow);
  const isDeleteAccountShowModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete
  );

  const [isDocLoading, setIsDocLoading] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const [dataSendToViewDocModal, setDataSendToViewDocModal] = useState<DocModalData>({
    clientId: "",
    providerId: "",
    documentId: "",
    sharedDocumentId: "",
    eSignature: "",
    isAgree: false,
    recipientId: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ URL state for preserving pagination/search
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || "1");
  const qFromUrl = searchParams.get("q") || "";

  // Search term is controlled by state but initialized/synced from URL
  const [searchTerm, setSearchTerm] = useState<string>(qFromUrl);

  // ✅ Keep searchTerm synced if user lands directly with ?q=
  useEffect(() => {
    setSearchTerm(qFromUrl);
  }, [qFromUrl]);

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        setIsDocLoading(true);
        const response = await loginUserApiService.getAllUsersApi();

        const approvedUsers =
          response.user?.filter(
            (u: User) => u?.role !== "superadmin" && u?.isApprove === "approve"
          ) ?? [];

        return approvedUsers;
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      } finally {
        setIsDocLoading(false);
      }
    },
  });

  const filteredUsers = useMemo(() => {
    return filterUsers(allUsers || [], searchTerm);
  }, [allUsers, searchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: Array.isArray(filteredUsers) ? filteredUsers : [],
      recordPerPage: 7,
    });

  // ✅ When coming back from ViewUser, apply page from URL
  useEffect(() => {
    // If pageFromUrl is invalid, fallback to 1
    const safePage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    handlePageChange(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  // ✅ Keep URL updated when user changes page
  const onPageChange = (page: number) => {
    handlePageChange(page);
    setSearchParams((prev) => {
      prev.set("page", String(page));
      if (searchTerm) prev.set("q", searchTerm);
      else prev.delete("q");
      return prev;
    });
  };

  // ✅ Keep URL updated when user types search (reset to page 1)
  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    handlePageChange(1);
    setSearchParams((prev) => {
      prev.set("page", "1");
      if (value) prev.set("q", value);
      else prev.delete("q");
      return prev;
    });
  };

  useEffect(() => {
    if (!showModal) {
      setSelectedDoc("");
      setDataSendToViewDocModal({
        clientId: "",
        providerId: "",
        documentId: "",
        sharedDocumentId: "",
        eSignature: "",
        isAgree: false,
        recipientId: "",
      });
    }
  }, [showModal]);

  const currentRecords = getCurrentRecords();

  return (
    <OutletLayout heading="All Verified Users">
      {isDocLoading && <Loader text="Loading Verified Users..." />}

      {isDeleteAccountShowModal && selectedUserForDelete && (
        <DeleteAccountModal userId={selectedUserForDelete} />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDoc}
          data={dataSendToViewDocModal as documentSignByClientType}
        />
      )}

      <div className="flex items-center justify-end">
        <div className="w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)} // ✅ changed
            placeholder="Search by Name, Email, State, Role, etc..."
          />
        </div>
      </div>

      <div className="mt-10 w-full">
        {currentRecords?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {currentRecords?.map((data: User, idx: number) => (
                <tr
                  key={data?.id ?? idx}
                  className="border-b-[1px] border-b-solid border-b-lightGreyColor"
                >
                  {/* Name */}
                  <td className="px-2 py-3 align-middle">
                    <div className="flex items-center gap-x-4">
                      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        {data?.profileImage !== null && data?.profileImage !== "null" ? (
                          <img
                            className="w-10 h-10 object-cover"
                            src={data?.profileImage || undefined}
                            alt="User"
                          />
                        ) : (
                          <UserIcon size={30} />
                        )}
                      </div>

                      <div className="min-w-0 text-left">
                        <p className="capitalize leading-5">{data?.fullName}</p>
                        <p className="truncate leading-5">
                          {(data?.client?.email || data?.provider?.email)?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    {data?.licenseNo}
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    {getCountryNameFromCode(data.country)}
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    {data.state}
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${
                        data.isApprove ? "bg-primaryColorDark/20" : "bg-inputBgColor"
                      }`}
                    >
                      <GoDotFill
                        className={`text-base ${data.isApprove ? "text-textColor" : ""}`}
                      />
                      {data.isApprove === "approve" ? "Verified" : ""}
                    </span>
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap capitalize">
                    {data?.role}
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    {data?.createdAt?.split("T")[0]}
                  </td>

                  <td className="px-2 py-3 align-middle whitespace-nowrap">
                    <div className="flex items-center justify-start gap-x-2">
                      <ViewIcon
                        onClick={() =>
                          navigate(
                            `/verified-users/view-user/${data?.id}?page=${currentPage}&q=${encodeURIComponent(
                              searchTerm
                            )}`
                          )
                        }
                      />
                      <DeleteIcon
                        onClick={() => {
                          setSelectedUserForDelete(data?.id ?? "");
                          dispatch(isModalDeleteReducer(true));
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </Table>

            <CustomPagination
              totalPages={totalPages}
              onPageChange={onPageChange} // ✅ changed
              hookCurrentPage={currentPage}
            />
          </>
        )}
      </div>
    </OutletLayout>
  );
};

export default VerifiedUsers;
