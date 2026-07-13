import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ModalLayout from "../../modalLayout/ModalLayout";
import SearchBar from "../../../searchBar/SearchBar";
import UserIcon from "../../../icons/user/User";
import Loader from "../../../loader/Loader";

import { useDebounce } from "../../../../hook/useDebounce";
import { useSubscription } from "../../../../hooks/useSubscription";
import clientApiService from "../../../../apiServices/clientApi/ClientApi";
import { ClientType } from "../../../../types/clientType/ClientType";
import { RootState } from "../../../../redux/store";
import { showAPIError } from "@/utils/errorUtils";

interface AddExistingClientModalProps {
  onClose: () => void;
  myClients: ClientType[];
}

const AddExistingClientModal: React.FC<AddExistingClientModalProps> = ({
  onClose,
  myClients,
}) => {
  const queryClient = useQueryClient();
  const { isTrialActive } = useSubscription();

  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const isSearchEmpty = debouncedSearchQuery.trim() === "";

  const { data: defaultClients = [], isFetching: isLoadingDefault } = useQuery({
    queryKey: ["all-total-clients"],
    queryFn: async () => {
      const response = await clientApiService.getAllTotalClient();
      return response?.data?.clients || [];
    },
    enabled: isSearchEmpty,
  });

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ["existing-clients-search", debouncedSearchQuery],
    queryFn: async () => {
      const response = await clientApiService.searchUsers(debouncedSearchQuery);
      return response?.data?.users || [];
    },
    enabled: !isSearchEmpty,
  });

  const isLoading = isSearchEmpty ? isLoadingDefault : isSearching;

  const displayResults = isSearchEmpty
    ? defaultClients
    : searchResults.filter((user: ClientType) => user?.user?.role === "client");

  const updateMutation = useMutation({
    mutationFn: async (data: ClientType) => {
      const localFormData = new FormData();
      localFormData.append("fullName", data?.user?.fullName || "Unknown User");
      localFormData.append("licenseNo", data?.user?.licenseNo || "");
      localFormData.append("age", String(data?.user?.age || "18"));
      localFormData.append("email", data?.user?.email || "");
      localFormData.append("contactNo", data?.user?.contactNo || "0000000000");
      localFormData.append("address", data?.user?.address || "No Address");
      localFormData.append(
        "gender",
        (data?.user?.gender || "male").toLowerCase(),
      );
      localFormData.append(
        "status",
        (data?.user?.status || "active").toLowerCase(),
      );
      localFormData.append("state", data?.user?.state || "");
      localFormData.append("role", "client");
      localFormData.append("isApprove", "pending");
      localFormData.append("providerId", loginUserDetail?.id || "");
      localFormData.append("profileImage", data?.user?.profileImage || "");

      return await clientApiService.addExistingClientToProvider(localFormData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["allclients"] });
      queryClient.invalidateQueries({ queryKey: ["allproviders"] });
      toast.success("Client added successfully");
    },
    onError: showAPIError,
  });

  const handleAddClient = (client: ClientType) => {
    const currentUserId = loginUserDetail?.id;
    const isOwnClient = client?.createdByProviderId === currentUserId;
    if (isTrialActive && !isOwnClient) {
      toast.info(
        "Adding another provider's client is a premium feature. Please upgrade your plan.",
      );
      return;
    }
    updateMutation.mutate(client);
  };

  return (
    <ModalLayout
      heading="Add Existing Client"
      onClose={onClose}
      widthClass="w-[90%] md:w-[60%] lg:w-[50%]"
      modalBodyContent={
        <div className="flex flex-col w-full min-h-75">
          {updateMutation.isPending && <Loader text="Adding client..." />}

          <div className="mb-4 relative">
            <SearchBar
              placeholder="Search existing clients by name, email, etc..."
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              value={searchQuery}
              showClearButton={!!searchQuery}
              borderRounded="rounded-lg"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-87.5 pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500 font-medium">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primaryColorDark mr-2" />
                {isSearchEmpty ? "Loading clients..." : "Searching clients..."}
              </div>
            ) : displayResults.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm font-medium">
                {isSearchEmpty
                  ? "No clients found in the system."
                  : `No clients found for "${searchQuery}"`}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayResults.map((client: ClientType) => {
                  const isAlreadyAdded =
                    myClients.some(
                      (existingClient) => existingClient.id === client.id,
                    ) ||
                    client?.providerList?.some(
                      (p) => p.providerId === loginUserDetail?.id,
                    );

                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition-colors duration-150 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Profile Image */}
                        <div className="shrink-0">
                          {client?.user?.profileImage &&
                          client?.user?.profileImage !== "null" ? (
                            <img
                              src={client.user.profileImage}
                              alt={client.user?.fullName || "Client"}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                              <UserIcon className="text-gray-400 text-lg" />
                            </div>
                          )}
                        </div>

                        {/* Name and Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {client?.user?.isApprove === "APPROVED" && (
                              <FaCheckCircle className="text-greenColor text-sm shrink-0" />
                            )}
                            <h4 className="text-sm font-semibold text-textColor capitalize truncate">
                              {client?.user?.fullName || "Unknown User"}
                            </h4>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-x-4 text-xs text-textGreyColor">
                            <span className="truncate">
                              {client?.user?.email || "-"}
                            </span>
                            {client?.clientId && (
                              <span className="shrink-0 text-gray-400 sm:before:content-['•'] sm:before:mr-2">
                                ID: {client.clientId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0 ml-4">
                        {isAlreadyAdded ? (
                          <button
                            disabled
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-md border border-gray-200 cursor-not-allowed"
                          >
                            Already Added
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddClient(client)}
                            disabled={updateMutation.isPending}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-greenColor hover:bg-greenColor/85 disabled:opacity-50 rounded-md transition-colors duration-200 cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default AddExistingClientModal;
