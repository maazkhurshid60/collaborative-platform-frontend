// Clients.tsx
// Alignment fixes applied:
// - Consistent padding + vertical alignment across ALL <td>
// - Prevent wrapping in narrow columns to avoid header/body drift
// - Email truncated with tooltip
// - Status / Verified pills are consistent width/spacing and nowrap
// - Providers column uses truncation and stable layout (no pushing other columns)
// - Action column has consistent px padding (was missing px-2) + fixed icon containers for equal sizing
// - S.No uses pagination-correct serial number (not just id+1)

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Button from "../../../components/button/Button";

import usePaginationHook from "../../../hook/usePaginationHook";
import Table from "../../../components/table/Table";
import CustomPagination from "../../../components/customPagination/CustomPagination";
import EditIcon from "../../../components/icons/edit/Edit";
import DeleteIcon from "../../../components/icons/delete/DeleteIcon";
import { useNavigate } from "react-router-dom";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import ViewIcon from "../../../components/icons/view/View";
import { useDispatch, useSelector } from "react-redux";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import Loader from "../../../components/loader/Loader";
import { toast } from "react-toastify";
import clientApiService from "../../../apiServices/clientApi/ClientApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ClientType, Provider } from "../../../types/clientType/ClientType";
import { ProviderType } from "../../../types/providerType/ProviderType";
import { IoMdAdd } from "react-icons/io";
import ShareDocumentIcon from "../../../components/icons/share/ShareDocument";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";
import SearchBar from "../../../components/searchBar/SearchBar";
import { filterClients } from "../../../utils/FilteredUsers";

export interface selectedClientIdType {
  clientId: string;
  providerId: string;
}

const recordPerPage = 6;

const Clients = () => {
  const navigate = useNavigate();

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

  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const loginUserId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails);
  const isModalDelete = useSelector((state: RootState) => state?.modalSlice?.isModalDelete);

  const [selectedClientId, setSelectedClientId] = useState<selectedClientIdType>({
    clientId: "",
    providerId: "",
  });


  const { data: clientData, isLoading, isError } = useQuery<ClientType[]>({
    queryKey: ["clients", loginUserId?.user?.id],
    queryFn: async () => {
      try {
        const response = await clientApiService.getAllClient(loginUserId?.user?.id);
        return response?.data?.clients || [];
      } catch (error) {
        console.error("Error fetching client:", error);
        return [];
      }
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
      toast.error("Failed to delete the specialty!");
      dispatch(isModalDeleteReducer(false));
    },
  });

  const myClients = useMemo(() => {
    return (
      clientData?.filter((client: ClientType) =>
        client?.providerList?.some((p) => p?.provider?.user?.id === loginUserId?.user?.id) ||
        client?.createdByProviderId === loginUserId?.id ||
        client?.createdByProviderId === loginUserId?.user?.id
      ) || []
    );
  }, [clientData, loginUserId?.user?.id, loginUserId?.id]);

  const filteredSearchClients = useMemo(() => {
    return filterClients(myClients, searchTerm);
  }, [myClients, searchTerm]);

  const { totalPages, getCurrentRecords, handlePageChange, currentPage } = usePaginationHook({
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

  const handleDeleteFun = (clientId: string, providerId: string, isCreator: boolean) => {
    const isDetach = !isCreator && loginUserId?.user?.role !== "superAdmin";

    setModalConfig({
      heading: isDetach ? "Detach Client" : "Delete Client",
      confirmText: isDetach ? "Detach" : "Delete",
      text: isDetach ? (
        <div>
          Are you sure you want to <span className="font-semibold">detach this client</span>?
          They will be removed from your list, but their account will remain active for other providers.
        </div>
      ) : (
        <div>
          By deleting this account you won’t be able to track records of your signed
          Documents. Are you sure that you want to
          <span className="font-semibold">delete this account</span>?
        </div>
      )
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
      button={<Button text="Add New" onclick={() => navigate("add-client")} icon={<IoMdAdd />} />}
    >

      {isModalDelete && selectedClientId?.clientId && (
        <DeleteClientModal
          onDeleteConfirm={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
          text={
            modalConfig.text
          }
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
              {getCurrentRecords()?.map((data: ClientType, rowIndex: number) => {
                const serialNo = (currentPage - 1) * recordPerPage + rowIndex + 1;

                // ✅ permission check (fix: correct boolean grouping)
                const canEditDelete =
                  loginUserId?.user?.role === "superAdmin" ||
                  (data?.createdByProviderId === loginUserId?.id) ||
                  (data?.createdByProviderId === loginUserId?.user?.id);

                return (
                  <tr
                    key={data?.id ?? rowIndex}
                    className="border-b border-b-solid border-b-lightGreyColor"
                  >
                    {/* S.No */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">{serialNo}</td>

                    {/* Name */}
                    <td
                      className="px-2 py-3 align-middle whitespace-nowrap"
                    >
                      {data?.user?.fullName}
                    </td>

                    {/* Client ID */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">{data?.clientId ?? '-'}</td>

                    {/* Gender */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap capitalize">{data?.user?.gender}</td>

                    {/* Email (truncate) */}
                    <td className="px-2 py-3 align-middle">
                      <span className="block max-w-[240px] truncate lowercase" title={data?.user?.email}>
                        {data?.user?.email}
                      </span>
                    </td>

                    {/* Status (pill) */}
                    <td className="px-2 py-4">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${data?.user?.status?.toLowerCase() === 'active' ? ' text-primaryColorDark' : 'bg-redColor text-white'}`}>
                        {data?.user?.status?.toLowerCase()}
                      </span>
                    </td>

                    {/* Country */}
                    {/* <td className="px-2 py-3 align-middle whitespace-nowrap">
                      {getCountryNameFromCode(data?.user?.country ?? "")}
                    </td> */}

                    {/* State */}
                    <td className="px-2 py-3 align-middle whitespace-nowrap">{data?.user?.state}</td>

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
                                className="capitalize truncate max-w-[220px]"
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
                    <td className="px-2 py-3 align-middle whitespace-nowrap">
                      <div className="flex items-center justify-center gap-x-1.5">
                        <div className="w-5 h-5 flex items-center justify-start">
                          <ViewIcon onClick={() => navigate(`/clients/${data?.id}`)} />
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center">
                          <ShareDocumentIcon onClick={() => navigate(`/clients/edit-client/${data?.id}`, { state: { view: 'documents' } })} />
                        </div>
                        {canEditDelete && (
                          <div className="w-5 h-5 flex items-center justify-center">
                            <EditIcon onClick={() => navigate(`/clients/edit-client/${data?.id}`)} />
                          </div>
                        )}
                        <div className="w-5 h-5 flex items-center justify-center">
                          <DeleteIcon
                            onClick={() => handleDeleteFun(data?.id ?? "", loginUserId?.id, canEditDelete)}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
