import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { GoDotFill } from "react-icons/go";
import { z } from "zod";

import Button from "../../../button/Button";
import InputField from "../../../inputField/InputField";
import Dropdown from "../../../dropdown/Dropdown";
import LabelData from "../../../labelText/LabelData";

import { clientSchema } from "../../../../schema/clientSchema/ClientSchema";
import { statusOption } from "../../../../constantData/statusOptions";
import UserIcon from "../../../icons/user/User";
import { RootState } from "../../../../redux/store";
import DeleteClientModal from "../../../modals/providerModal/deleteClientModal/DeleteClientModal";
import { ClientType, Provider } from "../../../../types/clientType/ClientType";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientApiService from "../../../../apiServices/clientApi/ClientApi";

import Loader from "../../../loader/Loader";
import Checkbox from "../../../checkbox/Checkbox";
import CountryStateSelect from "../../../dropdown/CountryStateSelect";

type FormFields = z.infer<typeof clientSchema>;

interface EditClientDetailProps {
  clientData?: ClientType;
}

const EditClientetails: React.FC<EditClientDetailProps> = ({ clientData }) => {
  const isShowDeleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete,
  );
  const loginUser = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails,
  );

  const isSuperAdmin = loginUser?.user?.role === "superAdmin";
  const isCreator =
    clientData?.createdByProviderId === loginUser?.id ||
    clientData?.createdByProviderId === loginUser?.user?.id;
  const canEdit = isSuperAdmin || isCreator;

  const methods = useForm<FormFields>({
    resolver: zodResolver(clientSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = methods;
  const queryClient = useQueryClient();
  const [wantToBeSeen, setWantToBeSeen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);

  const handleCheckboxChange = () => {
    setWantToBeSeen((prev) => !prev);
  };
  useEffect(() => {
    if (clientData) {
      // licenseNo is replaced by clientId and is not a form field
      setValue("email", clientData?.user?.email ?? "");
      setValue("fullName", clientData?.user?.fullName ?? "");
      setValue("status", (clientData?.user?.status ?? "").toLowerCase());
      setValue("address", clientData?.user?.address ?? "");
      setValue("contactNo", clientData?.user?.contactNo ?? "");
      setValue("age", Number(clientData?.user?.age ?? 0));
      setValue("gender", (clientData?.user?.gender ?? "").toLowerCase());
      //           setValue("country", (clientData?.user?.country as "US") || "US")
      setValue("state", clientData?.user?.state ?? "");
      setWantToBeSeen(clientData?.clientShowToOthers ?? false);

      const img = clientData?.user?.profileImage;
      setPreviewUrl(img && img !== "null" ? img : null);
      setImageChanged(false);
    }
  }, [clientData, setValue]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowUploader(false);
    setImageChanged(true);
  };

  const updateFunction = (data: FormFields) => {
    // if (selectedFile === null) {
    //     return toast.error("Profile Image is require.")
    // }
    // if (selectedFile === null) {
    //     return toast.error("Profile Image is require.")
    // }
    const formData = new FormData();
    formData.append("clientId", clientData?.id || "");
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    // licenseNo is no longer sent or updated for clients
    formData.append("age", data?.age?.toString() || "");
    formData.append("status", data.status ?? "active");
    formData.append("gender", data.gender ?? "Male");
    formData.append("address", data.address ?? "");
    formData.append("contactNo", data.contactNo);
    formData.append("state", data.state);
    //      formData.append('country', data.country ?? '')
    formData.append("clientShowToOthers", wantToBeSeen.toString());

    if (imageChanged) {
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      } else {
        formData.append("profileImage", "null");
      }
    }

    updateMutation.mutate(formData);
  };

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await clientApiService.updateClientApi(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client information updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update the client!");
    },
  });
  if (updateMutation.isPending) {
    return <Loader text="Updating Client..." />;
  }
  return (
    <div className="relative pl-2">
      {isShowDeleteModal && <DeleteClientModal />}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(updateFunction)} className="mt-6">
          {!canEdit && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
              Only the original creator of this client can modify their profile
              information.
            </div>
          )}
          {canEdit && (
            <div className="mb-5">
              <LabelData label="Client Image" />
              <div className="relative w-32 h-32">
                {!showUploader ? (
                  previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Client"
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                      <div
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                        onClick={() => {
                          setPreviewUrl(null);
                          setSelectedFile(null);
                          setImageChanged(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primaryColorDark transition-colors"
                      onClick={() => setShowUploader(true)}
                    >
                      <UserIcon className="text-4xl text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        Add Image
                      </span>
                    </div>
                  )
                ) : (
                  <div className="relative">
                    <div
                      className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 cursor-pointer z-10"
                      onClick={() => setShowUploader(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    {/* Assuming FileUploader has its own UI, but we need to pass handleFileSelect */}
                    <div className="w-32 h-32 rounded-lg overflow-hidden border">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="w-full h-full opacity-0 absolute cursor-pointer"
                      />
                      <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 text-xs text-center px-2">
                        Click to Upload
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
            <InputField
              disabled={!canEdit}
              required
              label="Full Name"
              register={register("fullName")}
              placeHolder="Enter Full Name."
              error={errors.fullName?.message}
            />

            <InputField
              disabled
              label="Client ID"
              value={clientData?.clientId ?? "-"}
            />

            <InputField
              disabled={!canEdit}
              label="Age"
              type="number"
              register={register("age")}
              placeHolder="Enter Age."
              error={errors.age?.message}
            />
            <InputField
              disabled={!canEdit}
              required
              label="Email"
              register={register("email")}
              placeHolder="Enter Email."
              error={errors.email?.message}
            />
            <InputField
              disabled={!canEdit}
              required
              label="Contact Number"
              type="number"
              register={register("contactNo")}
              placeHolder="Enter contact."
              error={errors.contactNo?.message}
            />
            <Dropdown<FormFields>
              name="gender"
              label="Gender"
              control={control}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ]}
              placeholder="Choose an option"
              error={errors.gender?.message}
              disable={!canEdit}
            />
            {/* 
                        <CountryStateSelect isFlex
                            defaultCountry={clientData?.user?.country}
                            defaultState={clientData?.user?.state}
                        /> */}
            {/* 
                        <CountryStateSelect
                            isCountryView={true}
                            isStateView={false}
                            defaultCountry={clientData?.user?.country}
                            required={false}
                            disable={!canEdit}
                        // defaultState={getMeData?.user?.state}
                        /> */}

            <CountryStateSelect
              // isCountryView={false}
              isStateView={true}
              required={false}
              disable={!canEdit}
            />
            <InputField
              disabled={!canEdit}
              label="Address"
              register={register("address")}
              placeHolder="Enter Address."
              error={errors.address?.message}
            />

            <div className="flex flex-col gap-y-5">
              <Dropdown<FormFields>
                name="status"
                label="Status"
                control={control}
                options={statusOption}
                placeholder="Choose an option"
                error={errors.status?.message}
                disable={!canEdit}
              />

              <div>
                <LabelData label="List of Providers" />
                <ul className="text-[14px] font-medium text-textGreyColor list-disc ">
                  {clientData?.providerList?.length === 0 ||
                  clientData?.providerList === undefined ? (
                    <p>No Providers Found</p>
                  ) : (
                    clientData?.providerList.map(
                      (provider: Provider, index) => (
                        <li
                          className="flex items-center gap-x-1 capitalize"
                          key={index}
                        >
                          <GoDotFill size={10} />{" "}
                          {provider?.provider?.user?.fullName}
                        </li>
                      ),
                    )
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Checkbox
                text="Allow other providers to access and collaborate on this client’s care "
                checked={wantToBeSeen}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center justify-end">
              <div className="mt-10 w-25">
                <Button text="Update" />
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default EditClientetails;
