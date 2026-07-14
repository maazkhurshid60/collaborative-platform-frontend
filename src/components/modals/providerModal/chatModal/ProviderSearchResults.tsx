import React from "react";
import { ProviderType } from "../../../../types/providerType/ProviderType";
import verifyBadge from "../../../../assets/images/verifyBadge.png";
import { HiMiniUserCircle } from "react-icons/hi2";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";

interface ProviderSearchResultsProps {
  providers: ProviderType[];
  onProviderSelect: (provider: ProviderType) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  searchQuery?: string;
  emptyMessage?: string;
}

const ProviderSearchResults: React.FC<ProviderSearchResultsProps> = ({
  providers,
  onProviderSelect,
  isLoading = false,
  isActionLoading = false,
  searchQuery = "",
  emptyMessage = "No providers found",
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-lightGreyColor">
        <div className="animate-pulse">Searching providers...</div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="p-6 text-center text-lightGreyColor">
        <div className="mb-2">
          <svg
            className="mx-auto w-12 h-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-sm">
          {searchQuery
            ? `No providers found for "${searchQuery}"`
            : emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto relative">
      {isActionLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColor" />
        </div>
      )}
      <div className="space-y-1">
        {providers.map((provider, index) => (
          <ProviderItem
            key={provider.id || index}
            provider={provider}
            onSelect={onProviderSelect}
            isLast={index === providers.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

interface ProviderItemProps {
  provider: ProviderType;
  onSelect: (provider: ProviderType) => void;
  isLast: boolean;
}

const ProviderItem: React.FC<ProviderItemProps> = ({
  provider,
  onSelect,
  isLast,
}) => {
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );
  const isBlocked = loginUserDetail?.user?.blockedMembers?.includes(
    provider?.user?.id,
  );

  if (isBlocked) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-md bg-gray-50 opacity-80 ${!isLast ? "border-b border-gray-100" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          import("react-toastify").then(({ toast }) =>
            toast.error("Please unblock this user to see their details."),
          );
        }}
      >
        <div className="shrink-0">
          <div className="w-[55px] h-[55px] rounded-full flex items-center justify-center bg-gray-200">
            <HiMiniUserCircle className="w-[40px] h-[40px] text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-500 capitalize truncate">
            {provider?.user?.fullName || "Unknown Provider"}
          </h4>
          <p className="text-[10px] text-red-500 font-medium mt-1">
            To see the details please unblock the user at setting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-primaryColorLight transition-colors duration-200 ${!isLast ? "border-b border-gray-100" : ""}`}
      onClick={() => onSelect(provider)}
    >
      {/* Profile Image */}
      <div className="shrink-0">
        {provider?.user?.profileImage &&
        provider?.user?.profileImage !== "null" ? (
          <img
            src={provider?.user.profileImage}
            alt={provider?.user?.fullName || "Provider"}
            className="w-12 h-12 rounded-full object-cover border-2 ml-1.5 border-gray-200"
          />
        ) : (
          <div className="w-[55px] h-[55px] rounded-full flex items-center justify-center">
            <HiMiniUserCircle className="w-[55px] h-[55px]" />
          </div>
        )}
      </div>

      {/* Provider Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {provider?.user?.isApprove === "APPROVED" && (
            <img
              src={verifyBadge}
              alt="Verified"
              className="h-4 w-4 shrink-0"
            />
          )}
          <h4 className="text-sm font-semibold text-gray-900 capitalize truncate">
            {provider?.user?.fullName || "Unknown Provider"}
          </h4>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-600 truncate">
            <span className="font-medium">Email:</span>{" "}
            {provider?.user?.email || "-"}
          </p>

          {provider?.speciality && (
            <p className="text-xs text-gray-600 truncate">
              <span className="font-medium">speciality:</span>{" "}
              {provider.speciality}
            </p>
          )}

          {provider?.user?.licenseNo && (
            <p className="text-xs text-gray-600 truncate">
              <span className="font-medium">License:</span>{" "}
              {provider.user.licenseNo}
            </p>
          )}

          <div className="flex items-center gap-2">
            {provider?.user?.status && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  provider.user.status?.toLowerCase() === "active"
                    ? "text-green-700 border bg-green-200 border-none"
                    : "bg-redColor text-primary"
                }`}
              >
                {provider.user.status?.toLowerCase()}
              </span>
            )}

            {provider?.user?.role && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium capitalize">
                {provider.user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Indicator */}
      <div className="shrink-0">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default ProviderSearchResults;
