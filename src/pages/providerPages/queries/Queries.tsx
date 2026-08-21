import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../../components/icons/back/Back";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import { providerQueryApiService } from "../../../services/providerQueryApiService";
import QueryItem, { type ProviderQueryRecord } from "./QueryItem";

const Queries = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<ProviderQueryRecord[]>({
    queryKey: ["providerQueries"],
    queryFn: async () => {
      const response = await providerQueryApiService.getMyQueries();
      return response?.data ?? [];
    },
  });

  const queries = data ?? [];

  return (
    <OutletLayout
      heading="Queries"
      backButton={<BackIcon onClick={() => navigate(-1)} />}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : queries.length === 0 ? (
        <NoRecordFound />
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {queries.map((q) => (
            <QueryItem key={q.id} query={q} />
          ))}
        </div>
      )}
    </OutletLayout>
  );
};

export default Queries;
