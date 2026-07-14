import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import { AppDispatch, RootState } from "../../../redux/store";

import Dropdown from "../../../components/dropdown/Dropdown";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import Loader from "../../../components/loader/Loader";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import usersApiService from "../../../apiServices/usersApi/UsersApi";
import { User } from "../../../types/providerType/ProviderType";

import DeleteAccountModal from "../../../components/modals/clientModal/deleteAccountModal/DeleteAccountModal";
import VerifyAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/VerifyAccountModal";
import RejectAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RejectAccountModal";
import RestoreAccountModal from "../../../components/modals/superAdminModal/deleteAccountModal/RestoreAccountModal";
import {
  isModalDeleteReducer,
  isModalShowReducser,
  isModalShowRejectReducer,
  isModalShowRestoreReducer,
} from "../../../redux/slices/ModalSlice";
import SearchBar from "../../../components/searchBar/SearchBar";
import { useDebounce } from "../../../hook/useDebounce";
import UserItem from "./UserItem";

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

const AllUsers = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const isDeleteAccountShowModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );
  const showModal = useSelector(
    (state: RootState) => state.modalSlice.isModalShow,
  );
  const showRejectModal = useSelector(
    (state: RootState) => state.modalSlice.isShowRejectModal,
  );
  const showRestoreModal = useSelector(
    (state: RootState) => state.modalSlice.isShowRestoreModal,
  );
  const [selectedUserForApproval, setSelectedUserForApproval] =
    useState<User | null>(null);
  const [selectedUserForReject, setSelectedUserForReject] =
    useState<User | null>(null);
  const [selectedUserForRestore, setSelectedUserForRestore] =
    useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{
    id: string;
    role: string;
  } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || "1");
  const qFromUrl = searchParams.get("q") || "";
  const roleFromUrl = searchParams.get("role") || "all";
  const statusFromUrl = searchParams.get("status") || "all";

  const [searchTerm, setSearchTerm] = useState<string>(qFromUrl);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [roleFilter, setRoleFilter] = useState<string>(roleFromUrl);
  const [statusFilter, setStatusFilter] = useState<string>(statusFromUrl);

  const { control, setValue } = useForm({
    defaultValues: {
      roleFilter: roleFromUrl,
      statusFilter: statusFromUrl,
    },
  });

  useEffect(() => {
    setSearchTerm(qFromUrl);
    setRoleFilter(roleFromUrl);
    setStatusFilter(statusFromUrl);
    setValue("roleFilter", roleFromUrl);
    setValue("statusFilter", statusFromUrl);
  }, [qFromUrl, roleFromUrl, statusFromUrl, setValue]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "users_paginated",
      pageFromUrl,
      debouncedSearchTerm,
      roleFilter,
      statusFilter,
    ],
    queryFn: async () => {
      const response = await usersApiService.getUsersPaginatedApi({
        page: pageFromUrl,
        limit: 7,
        status: statusFilter,
        role: roleFilter,
        search: debouncedSearchTerm,
      });
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const usersList = data?.users || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage || 1;

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (
          debouncedSearchTerm !== qFromUrl ||
          roleFilter !== roleFromUrl ||
          statusFilter !== statusFromUrl
        ) {
          prev.set("page", "1");
        }
        if (debouncedSearchTerm) prev.set("q", debouncedSearchTerm);
        else prev.delete("q");

        if (roleFilter !== "all") prev.set("role", roleFilter);
        else prev.delete("role");

        if (statusFilter !== "all") prev.set("status", statusFilter);
        else prev.delete("status");

        return prev;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  const onPageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(page));
      return prev;
    });
  };

  const approveMutation = useMutation({
    mutationFn: async (user: User) => {
      await loginUserApiService.approveUsersApi({
        id: user.id,
        name: user.fullName,
        email: user.email,
      });
    },
    onSuccess: () => {
      toast.success("User approved successfully");
      queryClient.invalidateQueries({ queryKey: ["users_paginated"] });
      dispatch(isModalShowReducser(false));
      setSelectedUserForApproval(null);
    },
    onError: () => {
      toast.error("Failed to approve user");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (user: User) => {
      await loginUserApiService.rejectUsersApi({
        id: user.id,
        name: user.fullName,
        email: user.email,
      });
    },
    onSuccess: () => {
      toast.success("User rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["users_paginated"] });
      dispatch(isModalShowRejectReducer(false));
      setSelectedUserForReject(null);
    },
    onError: () => {
      toast.error("Failed to reject user");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (user: User) => {
      await loginUserApiService.restoreUsersApi({
        id: user.id,
        name: user.fullName,
        email: user.email,
      });
    },
    onSuccess: () => {
      toast.success("User restored successfully");
      queryClient.invalidateQueries({ queryKey: ["users_paginated"] });
      dispatch(isModalShowRestoreReducer(false));
      setSelectedUserForRestore(null);
    },
    onError: () => {
      toast.error("Failed to restore user");
    },
  });

  return (
    <OutletLayout heading="All Users">
      {isLoading && <Loader text="Loading Users..." />}

      {isDeleteAccountShowModal && selectedUserForDelete && (
        <DeleteAccountModal
          userId={selectedUserForDelete.id}
          role={selectedUserForDelete.role}
        />
      )}

      {showModal && selectedUserForApproval && (
        <VerifyAccountModal
          onConfirm={() => approveMutation.mutate(selectedUserForApproval)}
          onCancel={() => {
            setSelectedUserForApproval(null);
            dispatch(isModalShowReducser(false));
          }}
          isLoading={approveMutation.isPending}
        />
      )}

      {showRejectModal && selectedUserForReject && (
        <RejectAccountModal
          onConfirm={() => rejectMutation.mutate(selectedUserForReject)}
          onCancel={() => {
            setSelectedUserForReject(null);
            dispatch(isModalShowRejectReducer(false));
          }}
          isLoading={rejectMutation.isPending}
        />
      )}

      {showRestoreModal && selectedUserForRestore && (
        <RestoreAccountModal
          onConfirm={() => restoreMutation.mutate(selectedUserForRestore)}
          onCancel={() => {
            setSelectedUserForRestore(null);
            dispatch(isModalShowRestoreReducer(false));
          }}
          isLoading={restoreMutation.isPending}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4 z-10 w-full md:max-w-125">
          <div className="w-1/2">
            <Dropdown
              name="statusFilter"
              label=""
              control={control}
              options={[
                { value: "all", label: "All" },
                { value: "APPROVED", label: "Verified" },
                { value: "PENDING", label: "Pending" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              onChange={(opt) => setStatusFilter(opt.value)}
            />
          </div>
          <div className="w-1/2">
            <Dropdown
              name="roleFilter"
              label=""
              control={control}
              options={[
                { value: "all", label: "All" },
                { value: "provider", label: "Provider" },
                { value: "client", label: "Client" },
              ]}
              onChange={(opt) => setRoleFilter(opt.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Email, State, Role, etc..."
          />
        </div>
      </div>

      <div className="mt-10 w-full">
        {usersList?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {usersList.map((data: User, idx: number) => (
                <UserItem
                  key={data?.id ?? idx}
                  user={data}
                  idx={idx}
                  currentPage={currentPage}
                  onApprove={(user) => {
                    setSelectedUserForApproval(user);
                    dispatch(isModalShowReducser(true));
                  }}
                  onReject={(user) => {
                    setSelectedUserForReject(user);
                    dispatch(isModalShowRejectReducer(true));
                  }}
                  onRestore={(user) => {
                    setSelectedUserForRestore(user);
                    dispatch(isModalShowRestoreReducer(true));
                  }}
                  onDelete={(user) => {
                    setSelectedUserForDelete({
                      id: user?.id ?? "",
                      role: user?.role ?? "",
                    });
                    dispatch(isModalDeleteReducer(true));
                  }}
                />
              ))}
            </Table>
            <CustomPagination
              totalPages={totalPages}
              onPageChange={onPageChange}
              hookCurrentPage={currentPage}
            />
          </>
        )}
      </div>
    </OutletLayout>
  );
};

export default AllUsers;
