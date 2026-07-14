import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";

import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";

import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import Loader from "../../../components/loader/Loader";

import clientApiService from "../../../apiServices/clientApi/ClientApi";
import { ClientType } from "../../../types/clientType/ClientType";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterClients } from "../../../utils/FilteredUsers";
import AddExistingClientModal from "../../../components/modals/providerModal/addExistingClientModal/AddExistingClientModal";
import ClientItem from "./ClientItem";

export interface selectedClientIdType {
  clientId: string;
  providerId: string;
}

const recordPerPage = 6;

const heading = [
  "#",
  "Name",
  "Client ID",
  "Gender",
  "Email",
  "Status",
  "State",
  "Verified Status",
  "Provider Name",
  "Action",
];

const Clients = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const isModalDelete = useSelector(
    (state: RootState) => state?.modalSlice?.isModalDelete,
  );

  const [selectedClientId, setSelectedClientId] =
    useState<selectedClientIdType>({
      clientId: "",
      providerId: "",
    });

  const {
    data: clientData = [],
    isLoading,
    isError,
  } = useQuery<ClientType[]>({
    queryKey: ["clients", loginUserId?.user?.id],
    queryFn: async () => {
      const response = await clientApiService.getAllClient(
        loginUserId?.user?.id,
      );
      return response?.data?.clients || [];
    },
    enabled: Boolean(loginUserId?.user?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: selectedClientIdType) => {
      await clientApiService.deleteClientApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["allclients"] });
      queryClient.invalidateQueries({ queryKey: ["allproviders"] });
      toast.success("Client has been deleted successfully");
      dispatch(isModalDeleteReducer(false));
    },
    onError: () => {
      toast.error("Failed to delete the client!");
      dispatch(isModalDeleteReducer(false));
    },
  });

  const myClients = useMemo(() => {
    return (
      clientData?.filter(
        (client: ClientType) =>
          client?.providerList?.some(
            (p) => p?.provider?.user?.id === loginUserId?.user?.id,
          ) ||
          client?.createdByProviderId === loginUserId?.id ||
          client?.createdByProviderId === loginUserId?.user?.id,
      ) || []
    );
  }, [clientData, loginUserId?.user?.id, loginUserId?.id]);

  const filteredSearchClients = useMemo(() => {
    return filterClients(myClients, searchTerm);
  }, [myClients, searchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } =
    usePaginationHook({
      data: filteredSearchClients ?? [],
      recordPerPage,
    });

  const [modalConfig, setModalConfig] = useState<{
    heading: string;
    text: React.ReactNode;
    confirmText: string;
  }>({
    heading: "Delete Client",
    text: "",
    confirmText: "Delete",
  });

  const handleDeleteFun = (
    clientId: string,
    providerId: string,
    isCreator: boolean,
  ) => {
    const isDetach = !isCreator && loginUserId?.user?.role !== "superAdmin";

    setModalConfig({
      heading: isDetach ? "Detach Client" : "Delete Client",
      confirmText: isDetach ? "Detach" : "Delete",
      text: isDetach ? (
        <div>
          Are you sure you want to{" "}
          <span className="font-semibold">detach this client</span>? They will
          be removed from your list, but their account will remain active for
          other providers.
        </div>
      ) : (
        <div>
          By deleting this account you won’t be able to track records of your
          signed Documents. Are you sure that you want to
          <span className="font-semibold">delete this account</span>?
        </div>
      ),
    });

    dispatch(isModalDeleteReducer(true));
    setSelectedClientId({ clientId, providerId });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(selectedClientId);
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>something went wrong</p>;

  return (
    <OutletLayout
      heading="Client List"
      buttonContainerClass="sm:w-[350px] w-full flex-shrink-0"
      button={
        <>
          <Button
            text="Add Existing"
            onclick={() => setIsAddExistingModalOpen(true)}
            icon={<IoMdAdd />}
            borderButton
          />
          <Button
            text="Add New"
            onclick={() => navigate("add-client")}
            icon={<IoMdAdd />}
          />
        </>
      }
    >
      {isModalDelete && selectedClientId?.clientId && (
        <DeleteClientModal
          onDeleteConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
          text={modalConfig.text}
        />
      )}

      {isAddExistingModalOpen && (
        <AddExistingClientModal
          onClose={() => setIsAddExistingModalOpen(false)}
          myClients={myClients}
        />
      )}

      <div className="flex items-center justify-end mt-6">
        <div className="w-[40%]">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, state, role, etc..."
          />
        </div>
      </div>

      <div className="mt-10 w-full">
        {getCurrentRecords()?.length === 0 ? (
          <NoRecordFound />
        ) : (
          <>
            <Table heading={heading}>
              {getCurrentRecords()?.map(
                (data: ClientType, rowIndex: number) => {
                  return (
                    <ClientItem
                      data={data}
                      rowIndex={rowIndex}
                      handleDelete={handleDeleteFun}
                      loginUserId={loginUserId?.id}
                      navigate={navigate}
                      currentPage={currentPage}
                      recordPerPage={recordPerPage}
                    />
                  );
                },
              )}
            </Table>

            <CustomPagination
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hookCurrentPage={currentPage}
            />
          </>
        )}
      </div>
    </OutletLayout>
  );
};

export default Clients;
