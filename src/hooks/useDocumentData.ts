import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import documentApiService from "../apiServices/documentApi/DocumentApi";
import clientApiService from "../apiServices/clientApi/ClientApi";
import axiosInstance from "../apiServices/axiosInstance/AxiosInstance";
import { MasterDocument } from "../types/documentType/DocumentType";
import { ClientType } from "../types/clientType/ClientType";

export const useDocumentData = (
  providerId: string | undefined,
  loginUserId: string | undefined,
) => {
  const {
    data: documents,
    isLoading: docsLoading,
    isError: docsError,
  } = useQuery<MasterDocument[]>({
    queryKey: ["master-documents", providerId],
    queryFn: async () => {
      const response =
        await documentApiService.getAllMasterDocuments(providerId);
      return response?.data?.data?.documents || [];
    },
    enabled: Boolean(providerId),
  });

  const { data: forms = [] } = useQuery({
    queryKey: ["form-templates"],
    queryFn: async () => {
      const response = await axiosInstance.get("/form/templates");
      return response.data.data.templates || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // ----- Provider's clients -----
  const { data: clients } = useQuery<ClientType[]>({
    queryKey: ["clients", loginUserId],
    queryFn: async () => {
      const response = await clientApiService.getAllClient(loginUserId!);
      return response?.data?.clients || [];
    },
    enabled: Boolean(loginUserId),
  });

  const myClients = useMemo(() => {
    return (
      clients?.filter(
        (client) =>
          client?.providerList?.some(
            (p) => p?.provider?.user?.id === loginUserId,
          ) ||
          client?.createdByProviderId === providerId ||
          client?.createdByProviderId === loginUserId,
      ) || []
    );
  }, [clients, loginUserId, providerId]);

  const combinedDocs = useMemo(() => {
    const docs = Array.isArray(documents)
      ? documents.map((d) => ({ ...d, isForm: false }))
      : [];
    const frms = Array.isArray(forms)
      ? forms.map((f: any) => ({
          ...f,
          isForm: true,
          name: f.title,
          type: "Form Template",
        }))
      : [];
    return [...docs, ...frms];
  }, [documents, forms]);

  return {
    combinedDocs,
    myClients,
    docsLoading,
    docsError,
  };
};
