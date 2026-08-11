import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import Table from "../../../components/table/Table";
import ViewIcon from "../../../components/icons/view/View";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "../../../components/noRecordFound/NoRecordFound";
import superAdminApi from "../../../apiServices/superAdminApi/SuperAdminApi";
import { getFormatedDateAndTime } from "@/utils/dataTimeUtils";

const heading = [
  "#",
  "Name",
  "Email",
  "Speciality",
  "Accepted Date & Time",
  "Status",
  "Action",
];

interface BaaProvider {
  id: string;
  fullName: string;
  email: string;
  baaAcceptedAt: string;
  status: string;
  provider?: {
    speciality: string;
  };
}

const BaaAcceptedProviders: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["baa_accepted_providers"],
    queryFn: async () => {
      const response = await superAdminApi.getBaaAcceptedProviders();
      return response?.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const providers: BaaProvider[] = data || [];

  return (
    <OutletLayout heading="BAA Accepted Providers">
      <div className="bg-white rounded-2xl overflow-hidden p-4 sm:p-6 mt-4">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader text="Loading providers..." />
          </div>
        ) : providers.length === 0 ? (
          <NoRecordFound />
        ) : (
          <div className="overflow-x-auto w-full">
            <Table heading={heading}>
              {providers.map((user, idx) => (
                <tr
                  key={user.id}
                  className="border-b border-b-solid border-b-lightGreyColor pb-4"
                >
                  <td className="px-4 py-3 align-middle">{idx + 1}</td>
                  <td className="px-4 py-3 align-middle font-medium text-gray-900">
                    {user.fullName}
                  </td>
                  <td className="px-4 py-3 align-middle text-gray-600">
                    {user.email.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 align-middle text-gray-600">
                    {user.provider?.speciality || "N/A"}
                  </td>
                  <td className="px-4 py-3 align-middle text-gray-600">
                    {getFormatedDateAndTime(user.baaAcceptedAt)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Accepted
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-start justify-start ">
                    <ViewIcon
                      onClick={() =>
                        navigate(`/all-users/view-user/${user.id}`)
                      }
                    />
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>
    </OutletLayout>
  );
};

export default BaaAcceptedProviders;
