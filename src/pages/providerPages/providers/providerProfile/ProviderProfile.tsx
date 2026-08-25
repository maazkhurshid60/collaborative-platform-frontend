import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GoDotFill } from "react-icons/go";

import OutletLayout from "../../../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../../../components/icons/back/Back";
import { useNavigate, useParams } from "react-router-dom";
import LabelData from "../../../../components/labelText/LabelData";
import UserIcon from "../../../../components/icons/user/User";
import Loader from "../../../../components/loader/Loader";
import { useQuery } from "@tanstack/react-query";
import {
  Client,
  ProviderType,
} from "../../../../types/providerType/ProviderType";
import providerApiService from "../../../../apiServices/providerApi/ProviderApi";

import { RootState } from "../../../../redux/store";
import { Video } from "lucide-react";
import BookProviderSessionModal from "@/components/modals/providerModal/BookProviderSessionModal";

const ProviderProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const loginUserDetail = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails,
  );
  const loginUserId = loginUserDetail?.user?.id;
  const [selectedProviderData, setSelectedProviderData] =
    useState<ProviderType>();
  const [bookingProvider, setBookingProvider] = useState<{
    id: string;
    name: string;
    slug?: string;
  } | null>(null);

  const {
    data: providerData,
    isLoading,
    isError,
  } = useQuery<ProviderType[]>({
    queryKey: ["providers", loginUserId],
    queryFn: async () => {
      const response = await providerApiService.getAllProviders(loginUserId);
      return response?.data?.providers;
    },
  });

  useEffect(() => {
    if (providerData) {
      const selected = providerData.find((data) => data?.id === id);
      setSelectedProviderData(selected);
    }
  }, [providerData, id]);

  if (isLoading) {
    return <Loader text="Loading..." />;
  }
  if (isError) {
    return <p>somethingwent wrong</p>;
  }
  const isBlocked = loginUserDetail?.user?.blockedMembers?.includes(
    selectedProviderData?.user?.id || "",
  );

  return (
    <OutletLayout
      heading="Provider profile"
      backButton={<BackIcon onClick={() => navigate(-1)} />}
    >
      <div className="mt-6">
        {isBlocked ? (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <UserIcon className="text-6xl text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500 text-center">
              {selectedProviderData?.user?.fullName || "Provider"} is blocked
            </p>
            <p className="text-sm text-red-500 font-medium mt-2 text-center">
              To see the details please unblock the user at setting
            </p>
          </div>
        ) : (
          <>
            <div>
              <LabelData label="Provider Image" />
              {selectedProviderData?.user?.profileImage ? (
                <img
                  src={selectedProviderData?.user?.profileImage}
                  alt="Provider Image"
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <UserIcon className="text-6xl mt-2" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
              <div className="">
                <LabelData
                  label="Full Name"
                  data={selectedProviderData?.user?.fullName}
                />
              </div>
              <div className="">
                <LabelData
                  label="License Number"
                  data={selectedProviderData?.user?.licenseNo}
                />
              </div>
              <div className="">
                <LabelData
                  label="Age"
                  data={selectedProviderData?.user?.age ?? "-"}
                />
              </div>
              <div className="">
                <LabelData
                  label="Email"
                  data={selectedProviderData?.user?.email ?? "-"}
                />
              </div>
              <div className="">
                <LabelData
                  label="Contact Number"
                  data={selectedProviderData?.user?.contactNo ?? "-"}
                />
              </div>

              <div className="">
                <LabelData
                  label="Gender"
                  data={selectedProviderData?.user?.gender ?? "-"}
                />
              </div>

              <div className="">
                <LabelData
                  label="Speciality"
                  data={selectedProviderData?.speciality ?? "-"}
                />
              </div>

              <div className="">
                <LabelData
                  label="Address"
                  data={selectedProviderData?.user?.address ?? "-"}
                />
              </div>
              {/* 
                            <div className=''>
                                <LabelData label='Country' data={getCountryNameFromCode(selectedProviderData?.user?.country ?? "") ?? "-"} />
                            </div> */}

              <div className="">
                <LabelData
                  label="State"
                  data={selectedProviderData?.user?.state ?? "-"}
                />
              </div>

              <div className=" ">
                <LabelData label="List of Active Verified Clients" />

                {selectedProviderData?.clientList === undefined ||
                selectedProviderData?.clientList?.filter(
                  (data) => data.client?.clientShowToOthers === true,
                ).length === 0 ? (
                  <p className="text-[14px] py-0.5 font-medium text-textGreyColor">
                    No Clients
                  </p>
                ) : (
                  selectedProviderData?.clientList
                    ?.filter(
                      (client: Client) =>
                        client?.client?.clientShowToOthers === true,
                    )
                    .map((client: Client, index) => (
                      <p
                        className="flex items-center gap-x-1 capitalize text-[14px] py-0.5 font-medium text-textGreyColor"
                        key={index}
                      >
                        <GoDotFill className="text-[6px]" />
                        {client?.client?.user?.fullName}
                      </p>
                    ))
                )}
              </div>
            </div>

            <div className="flex justify-start mt-6">
              {selectedProviderData?.user?.id !== loginUserId &&
                Boolean(selectedProviderData?.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedProviderData?.id) {
                        setBookingProvider({
                          id: selectedProviderData.id,
                          name:
                            selectedProviderData?.user?.fullName || "Provider",
                          slug: (selectedProviderData as any)?.profile?.slug,
                        });
                      }
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-primaryColorDark px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#237c76] transition-all cursor-pointer"
                  >
                    <Video size={16} /> Schedule Session / Call
                  </button>
                )}
            </div>
          </>
        )}
      </div>

      {bookingProvider && (
        <BookProviderSessionModal
          isOpen={Boolean(bookingProvider)}
          onClose={() => setBookingProvider(null)}
          targetProvider={bookingProvider}
        />
      )}
    </OutletLayout>
  );
};

export default ProviderProfile;
