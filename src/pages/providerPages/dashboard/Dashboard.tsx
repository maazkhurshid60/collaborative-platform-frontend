import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Eye, Users, Activity, Clock } from "lucide-react";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
// import CardDashboardLayout from "../../../layouts/dashboardLayout/CardDashboardLayout";
// import Collaboration from "../../../components/pagesComponent/dashboard/collaboration/Collaboration";
// import ClientList from "../../../components/pagesComponent/dashboard/clientList/ClientList";
// import ProviderList from "../../../components/pagesComponent/dashboard/providerList/ProviderList";
// import TrialBanner from "../../../components/pagesComponent/dashboard/trialBanner/TrialBanner";
import providerApiService from "../../../apiServices/providerApi/ProviderApi";
import clientApiService from "../../../apiServices/clientApi/ClientApi";
import { ClientType } from "../../../types/clientType/ClientType";
import { RootState } from "../../../redux/store";
import SubscriptionHistoryCard from "../../../components/pagesComponent/dashboard/subscriptionHistory/SubscriptionHistoryCard";
import RecentActivities from "./RecentActivities";
import DashboardActionCardSection from "./DashboardActionCardSection";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id,
  );
  const { plan } = useSubscription();

  // Fetch total provider using React Query
  const {
    data: totalNoOfProvider = 0,
    isLoading: isLoadingProviders,
    isError: isErrorProviders,
  } = useQuery<number>({
    queryKey: ["dashboard_providers_count", loginUserId],
    queryFn: async () => {
      const response = await providerApiService.getAllProviders(loginUserId);
      const providers = response?.data?.providers ?? [];
      return providers.filter(
        (p: any) => !p?.user?.blockedMembers?.includes(loginUserId),
      ).length;
    },
    enabled: Boolean(loginUserId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: totalNoOfClient = 0,
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useQuery<number>({
    queryKey: ["totalclients", loginUserId],
    queryFn: async () => {
      const response = await clientApiService.getAllClient(loginUserId);
      const matchedClient = response?.data?.clients?.filter(
        (client: ClientType) =>
          client?.providerList?.some(
            (provider) => provider?.provider?.user?.id === loginUserId,
          ),
      );
      return matchedClient?.length ?? 0;
    },
    enabled: Boolean(loginUserId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const cardData = [
    {
      icon: Eye,
      heading: "Total Providers & Clients",
      numbers: totalNoOfClient + totalNoOfProvider,
      isLoading: isLoadingClients || isLoadingProviders,
      error:
        isErrorClients || isErrorProviders ? "Error loading total users" : "",
      className: "",
    },
    {
      icon: Users,
      heading: "Clients",
      numbers: totalNoOfClient,
      isLoading: isLoadingClients,
      error: isErrorClients ? "Error loading clients" : "",
      className: "",
    },
    {
      icon: Activity,
      heading: "Providers on the platform",
      numbers: totalNoOfProvider,
      isLoading: isLoadingProviders,
      error: isErrorProviders ? "Error loading providers" : "",
      className: "",
    },
    {
      icon: Clock,
      heading: "Current Plan",
      numbers: plan,
      isLoading: false,
      error: "",
      className: "text-lg font-bold mt-4",
    },
  ];

  return (
    <div className="flex flex-col w-full  h-full p-3 overflow-y-auto rounded-lg  bg-white">
      {/* <TrialBanner /> */}
      <OutletLayout heading="Dashboard">
        <div className="flex flex-col gap-6 ">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 font-[Montserrat]">
              Your Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cardData?.map((data, id: number) => {
                const Icon = data?.icon;
                return (
                  <div
                    className="bg-slate-50 p-6 rounded-xl flex flex-col justify-center border border-gray-100"
                    key={id}
                  >
                    <div className="flex items-center gap-x-2 text-slate-500 font-medium">
                      <Icon className="w-5 h-5 text-teal-600" />
                      <p className="text-sm">{data?.heading}</p>
                    </div>
                    <p
                      className={`font-semibold text-gray-800 text-3xl mt-3 ${data.className}`}
                    >
                      {data?.numbers}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 font-[Montserrat]">
              Overview
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Activity */}
              <RecentActivities />

              {/* Action Cards */}
              <DashboardActionCardSection />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 font-[Montserrat]">
              Subscription History
            </h2>
            <div>
              {/* Recent Activity */}
              <SubscriptionHistoryCard />
            </div>
          </div>

          {/* <div className="flex flex-col gap-3 lg:gap-0 lg:flex-row items-start justify-evenly flex-wrap mt-2">
            <div className=" flex flex-col gap-2 flex-wrap w-full lg:w-[68%] ">
              <div className=" w-full  max-h-screen lg:w-[98%] overflow-x-auto rounded-md">
                <CardDashboardLayout heading="Clients List">
                  <ClientList />
                </CardDashboardLayout>
              </div>
              <div className="w-full lg:w-[98%] max-h-screen overflow-x-auto rounded-md">
                <CardDashboardLayout heading="Providers on the platform">
                  <ProviderList />
                </CardDashboardLayout>
              </div>
              <div className="w-full lg:w-[98%] max-h-screen overflow-x-auto rounded-md">
                <CardDashboardLayout heading="Subscription History">
                  <SubscriptionHistoryCard />
                </CardDashboardLayout>
              </div>
            </div>
            <div className="w-[110%] min-h-screen  lg:w-[32%] overflow-y-auto">
              <CardDashboardLayout heading="Conversations">
                <Collaboration />
              </CardDashboardLayout>
            </div>
          </div> */}
        </div>
      </OutletLayout>
    </div>
  );
};

export default Dashboard;
