import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import dashboardApiService from "../../../apiServices/dashboardApi/DashboardApi";
import Loader from "../../../components/loader/Loader";
import NoRecordFound from "@/components/noRecordFound/NoRecordFound";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["superadmin_dashboard_stats"],
    queryFn: () => dashboardApiService.getSuperAdminDashboardStats(),
  });

  if (isLoading) return <Loader text="Loading Dashboard..." />;
  if (isError) return <NoRecordFound />;

  const statCards = [
    {
      title: "Active Providers",
      value: stats?.activeProviders ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    {
      title: "Pending Providers",
      value: stats?.pendingProviders ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      border: "border-yellow-200",
    },
    {
      title: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      border: "border-indigo-200",
    },
  ];

  return (
    <OutletLayout heading="Admin Dashboard">
      <div className="flex flex-col gap-8 pb-8">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${card.border} bg-white shadow-sm flex items-center gap-4`}
            >
              <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {card.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Pending Providers */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Pending Providers
              </h3>
              <button
                onClick={() => navigate("/all-users")}
                className="text-sm font-medium text-primaryColor flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="p-0 flex-1">
              {stats?.recentPendingProviders &&
              stats.recentPendingProviders.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {stats.recentPendingProviders.map((user: any) => (
                    <li
                      key={user.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primaryColor/10 flex items-center justify-center text-primaryColor font-bold uppercase">
                          {user.fullName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No pending providers found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Payments
              </h3>
              <button
                onClick={() => navigate("/transaction-details")}
                className="text-sm font-medium text-primaryColor flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="p-0 flex-1">
              {stats?.recentPayments && stats.recentPayments.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {stats.recentPayments.map((payment: any) => (
                    <li
                      key={payment.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          <DollarSign size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {payment.user?.fullName || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${(payment.amount / 100).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent payments found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Activities
            </h3>
            <button
              onClick={() => navigate("/audit-logs")}
              className="text-sm font-medium text-primaryColor flex items-center gap-1 hover:underline"
            >
              View All Logs <ArrowRight size={16} />
            </button>
          </div>
          <div className="p-0">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {stats.recentActivities.map((log: any) => (
                  <li
                    key={log.id}
                    className="p-4 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        <CheckCircle
                          size={20}
                          className="text-primaryColorDark"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="capitalize font-semibold">
                            {log.user?.fullName || "System"}
                          </span>{" "}
                          performed{" "}
                          <span className="font-semibold text-primaryColor">
                            {log.action}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Resource: {log.resource} &bull;{" "}
                          {formatDistanceToNow(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No recent activities found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </OutletLayout>
  );
};

export default SuperAdminDashboard;
