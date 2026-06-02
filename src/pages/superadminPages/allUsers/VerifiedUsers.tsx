import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { GoDotFill } from "react-icons/go";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import ViewIcon from "../../../components/icons/view/View";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import UserIcon from "../../../components/icons/user/User";
import ViewDocModal from "../../../components/modals/clientModal/viewDocModal/ViewDocModal";
import { AppDispatch, RootState } from "../../../redux/store";

import Dropdown from "../../../components/dropdown/Dropdown";
import {
  DocModalData,
  documentSignByClientType,
} from "../../../types/documentType/DocumentType";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Loader from "../../../components/loader/Loader";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import { User } from "../../../types/providerType/ProviderType";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterUsers } from "../../../utils/FilteredUsers";
import { useDebounce } from "../../../hook/useDebounce";

const heading = [
  "#",
  "Name",
  "License No/Client ID",
  "State",
  "Status",
  "Role",
  "Date",
  "Action",
];

const VerifiedUsers = () => {
  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const isDeleteAccountShowModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );

  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{
    id: string;
    role: string;
  } | null>(null);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [dataSendToViewDocModal, setDataSendToViewDocModal] =
    useState<DocModalData>({
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

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || "1");
  const qFromUrl = searchParams.get("q") || "";
  const roleFromUrl = searchParams.get("role") || "all";

  // Search term is controlled by state but initialized/synced from URL
  const [searchTerm, setSearchTerm] = useState<string>(qFromUrl);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Role filter state
  const [roleFilter, setRoleFilter] = useState<string>(roleFromUrl);

  const { control, setValue } = useForm({
    defaultValues: {
      roleFilter: roleFromUrl,
    },
  });

  // Keep searchTerm and roleFilter synced if user lands directly with ?q= or ?role=
  useEffect(() => {
    setSearchTerm(qFromUrl);
    setRoleFilter(roleFromUrl);
    setValue("roleFilter", roleFromUrl);
  }, [qFromUrl, roleFromUrl, setValue]);

  const { data: allUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await loginUserApiService.getAllUsersApi();

      const approvedUsers =
        response.user?.filter(
          (u: User) => u?.role !== "superAdmin" && u?.isApprove === "APPROVED",
        ) ?? [];

      return approvedUsers;
    },
    refetchOnWindowFocus: false,
  });

  const filteredUsers = useMemo(() => {
    let users = allUsers || [];
    if (roleFilter !== "all") {
      users = users.filter((u) => u.role === roleFilter);
    }
    return filterUsers(users, debouncedSearchTerm);
  }, [allUsers, debouncedSearchTerm, roleFilter]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: Array.isArray(filteredUsers) ? filteredUsers : [],
      recordPerPage: 7,
    });

  // ✅ When coming back from ViewUser, apply page from URL
  useEffect(() => {
    // If pageFromUrl is invalid, fallback to 1
    const safePage =
      Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    handlePageChange(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl]);

  // Update URL when debouncedSearchTerm or roleFilter changes
  useEffect(() => {
    setSearchParams(
      (prev) => {
        // If we are initializing from URL, don't reset page unless it's a real change
        if (debouncedSearchTerm !== qFromUrl || roleFilter !== roleFromUrl) {
          prev.set("page", "1");
          handlePageChange(1);
        }

        if (debouncedSearchTerm) prev.set("q", debouncedSearchTerm);
        else prev.delete("q");

        if (roleFilter !== "all") prev.set("role", roleFilter);
        else prev.delete("role");

        return prev;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, roleFilter]);

  // ✅ Keep URL updated when user changes page
  const onPageChange = (page: number) => {
    handlePageChange(page);
    setSearchParams((prev) => {
      prev.set("page", String(page));
      if (searchTerm) prev.set("q", searchTerm);
      else prev.delete("q");
      if (roleFilter !== "all") prev.set("role", roleFilter);
      else prev.delete("role");
      return prev;
    });
  };

  // ✅ Keep URL updated when user types search (reset to page 1)
  const onSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const onRoleChange = (value: string) => {
    setRoleFilter(value);
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
      {isLoading && <Loader text="Loading Verified Users..." />}

      {isDeleteAccountShowModal && selectedUserForDelete && (
        <DeleteAccountModal
          userId={selectedUserForDelete.id}
          role={selectedUserForDelete.role}
        />
      )}

      {showModal && (
        <ViewDocModal
          sharedDocs={selectedDoc}
          data={dataSendToViewDocModal as documentSignByClientType}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="w-44 z-10 flex items-center justify-center ">
          <Dropdown
            name="roleFilter"
            label=""
            control={control}
            options={[
              { value: "all", label: "All Roles" },
              { value: "provider", label: "Provider" },
              { value: "client", label: "Client" },
            ]}
            onChange={(opt) => onRoleChange(opt.value)}
          />
        </div>
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
                  className="border-b border-b-solid border-b-lightGreyColor"
                >
                  <td className="px-4 py-3 align-middle">
                    {(currentPage - 1) * 7 + (idx + 1)}
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-x-4">
                      <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        {data?.profileImage !== null &&
                        data?.profileImage !== "null" ? (
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
                          {data?.email?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    {data.role === "client"
                      ? data?.client?.clientId
                      : data?.licenseNo}
                  </td>

                  {/* <td className="px-4 py-3 align-middle whitespace-nowrap">
                    {getCountryNameFromCode(data.country)}
                  </td> */}

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    {data.state}
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-x-2 rounded-md px-2 py-1 text-sm ${
                        data.isApprove
                          ? "bg-primaryColorDark/20"
                          : "bg-inputBgColor"
                      }`}
                    >
                      <GoDotFill
                        className={`text-base ${data.isApprove ? "text-textColor" : ""}`}
                      />
                      {data.isApprove === "APPROVED" ? "Verified" : ""}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap capitalize">
                    {data?.role}
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    {data?.createdAt?.split("T")[0]}
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <div className="flex items-center justify-start gap-x-2">
                      <ViewIcon
                        onClick={() =>
                          navigate(
                            `/verified-users/view-user/${data?.id}?page=${currentPage}&q=${encodeURIComponent(
                              searchTerm,
                            )}`,
                          )
                        }
                      />
                      <DeleteIcon
                        onClick={() => {
                          setSelectedUserForDelete({
                            id: data?.id ?? "",
                            role: data?.role ?? "",
                          });
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
