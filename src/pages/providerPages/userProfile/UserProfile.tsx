/* eslint-disable @typescript-eslint/no-unused-vars */

import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import LabelData from "../../../components/labelText/LabelData";
import Button from "../../../components/button/Button";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import Dropdown from "../../../components/dropdown/Dropdown";
import { toast } from "react-toastify";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { providerSchema } from "../../../schema/providerSchema/ProviderSchema";
import UserIcon from "../../../components/icons/user/User";
import BackIcon from "../../../components/icons/back/Back";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProviderType } from "../../../types/providerType/ProviderType";
import Loader from "../../../components/loader/Loader";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import { saveLoginUserDetailsReducer } from "../../../redux/slices/LoginUserDetailSlice";
import { GoDotFill } from "react-icons/go";
import FileUploader from "../../../components/uploader/fileUploader/FileUploader";
import CrossIcon from "../../../components/icons/cross/Cross";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";
import CountryStateSelect from "../../../components/dropdown/CountryStateSelect";

import { Country } from "country-state-city";
import { useNavigate } from "react-router-dom";

type FormFields = z.infer<typeof providerSchema>;

const departmentOptions = [
  { value: "Nutritionist", label: "Nutritionist" },
  { value: "Psychiatrist", label: "Psychiatrist" },
  { value: "Therapist", label: "Therapist" },
  { value: "Eye Specialist", label: "Eye Specialist" },
  { value: "Heart Specialist", label: "Heart Specialist" },
  { value: "General Medicine", label: "General Medicine" },
];

// Ensure Dropdown gets a value that matches one of the option values (case-insensitive)
function normalizeDepartmentValue(dep?: string | null) {
  if (!dep) return "";
  const trimmed = dep.trim();
  const match = departmentOptions.find(
    (o) => o.value.toLowerCase() === trimmed.toLowerCase()
  );
  return match?.value ?? trimmed;
}

// Helper to find ISO2 code from name or code (e.g. "USA" -> "US")
function getCountryIsoCode(val?: string | null) {
  if (!val) return "";
  const countries = Country.getAllCountries();
  const exact = countries.find(c => c.isoCode === val);
  if (exact) return exact.isoCode;

  // Try matching by name
  const byName = countries.find(c => c.name.toLowerCase() === val.toLowerCase());
  if (byName) return byName.isoCode;

  // Handle specific "USA" case if "United States" is the name
  if (val === "USA") return "US";

  return val; // Fallback
}

const UserProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();

  const isShowDeleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete
  );
  const loginUserDetail = useSelector(
    (state: RootState) => state.LoginUserDetail.userDetails
  );

  const [getMeDetail, setGetMeDetail] = useState<ProviderType | undefined>(undefined);

  const [isLoader, setIsLoader] = useState(false);

  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Key change: validate while editing so we can disable Update button
  const methods = useForm<FormFields>({
    resolver: zodResolver(providerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      licenseNo: "",
      age: 0 as any,
      department: "",
      email: "",
      contactNo: "" as any,
      address: "",
      country: "",
      state: "",
    } as any,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    reset,
    getValues,
    watch,
  } = methods;

  const loginUserId = loginUserDetail?.user?.id ?? loginUserDetail?.id;

  const { data: getMeData, isLoading, isError } = useQuery<ProviderType>({
    queryKey: ["loginUser"],
    queryFn: async () => {
      const dataSendToBackend = {
        role: loginUserDetail?.user?.role,
        loginUserId: loginUserDetail?.user?.id || loginUserDetail?.id,
      };
      const response = await loginUserApiService.getMeApi(dataSendToBackend);
      return response?.data?.data;
    },
    enabled: Boolean(loginUserDetail?.id),
  });

  // Snapshot of initial values from backend
  const initialFormValues = useMemo(() => {
    if (!getMeData) return null;

    return {
      fullName: getMeData?.user?.fullName ?? "",
      licenseNo: getMeData?.user?.role === "provider" ? (getMeData?.user?.licenseNo ?? "") : "",
      clientId: getMeData?.user?.role === "client" ? (getMeData?.client?.clientId ?? getMeData?.user?.licenseNo) : "",
      age: Number(getMeData?.user?.age ?? 0) || 0,
      contactNo: getMeData?.user?.contactNo ?? "",
      email: getMeData?.user?.email ?? "",
      department: normalizeDepartmentValue(getMeData?.department),
      address: getMeData?.user?.address ?? "",
      country: getCountryIsoCode(getMeData?.user?.country),
      state: getMeData?.user?.state ?? "",
    } as Partial<FormFields>;
  }, [getMeData]);

  // Load values into form using reset() (prevents dropdown/value clearing bugs)
  useEffect(() => {
    if (!getMeData) return;

    setGetMeDetail(getMeData);

    if (initialFormValues) {
      reset(initialFormValues as any, { keepDirty: false, keepTouched: false });
    }

    const img = getMeData?.user?.profileImage;
    setPreviewUrl(img && img !== "null" ? img : null);

    setSelectedFile(null);
    setShowUploader(false);
    setImageChanged(false);
  }, [getMeData, initialFormValues, reset]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowUploader(false);
    setImageChanged(true);
  };

  // Live values (re-render on change so canSubmitUpdate updates)
  const live = watch();

  // No longer using custom requiredMissing, relying on isValid from useForm

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await loginUserApiService.updateMeApi(data);
      dispatch(saveLoginUserDetailsReducer(response?.data));
    },
    onMutate: () => setIsLoader(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loginUser"] });
      toast.success("Account has updated successfully");
      setIsEdit(false);
      setSelectedFile(null);
      setImageChanged(false);
      setIsLoader(false);
    },
    onError: () => {
      toast.error("Failed to update your account!");
      setIsLoader(false);
    },
  });

  const canSubmitUpdate = isValid && !updateMutation.isPending;

  const updateFunction = (data: FormFields) => {
    // Extra safety: do not submit if incomplete
    if (!canSubmitUpdate) {
      toast.error("Please fill all required fields before updating.");
      return;
    }

    // Ensure department doesn’t get wiped due to casing/mismatch
    const safeDepartment =
      (data?.department && String(data.department).trim() !== ""
        ? data.department
        : normalizeDepartmentValue(getMeData?.department)) || "";

    const safeCountry =
      (data?.country && String(data.country).trim() !== ""
        ? data.country
        : getMeData?.user?.country) || "";

    const safeState =
      (data?.state && String(data.state).trim() !== ""
        ? data.state
        : getMeData?.user?.state) || "";

    const formData = new FormData();
    formData.append("address", data?.address ?? "");
    formData.append("fullName", data?.fullName ?? "");
    formData.append("email", (data?.email ?? "").toLowerCase());
    if (getMeData?.user?.role === "provider") {
      formData.append("licenseNo", data?.licenseNo ?? "");
    }
    formData.append("age", data?.age?.toString() ?? "0");
    formData.append("department", safeDepartment);
    formData.append("loginUserId", getMeData?.user?.id ?? loginUserId ?? "");
    formData.append("role", getMeData?.user?.role ?? loginUserDetail?.user?.role ?? "");
    formData.append("state", safeState);
    formData.append("country", safeCountry);
    formData.append("contactNo", String(data?.contactNo ?? ""));

    // Only include profileImage if user explicitly changed it
    if (imageChanged) {
      if (selectedFile !== null) {
        formData.append("profileImage", selectedFile);
      } else {
        formData.append("profileImage", "");
      }
    }

    updateMutation.mutate(formData);
  };

  const handleEditClick = () => {
    setIsEdit(true);

    setShowUploader(false);
    setSelectedFile(null);
    setImageChanged(false);

    const img = getMeData?.user?.profileImage;
    setPreviewUrl(img && img !== "null" ? img : null);

    if (initialFormValues) {
      reset(initialFormValues as any, { keepDirty: false, keepTouched: false });
    }
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setImageChanged(false);
    setShowUploader(false);
    setSelectedFile(null);

    const img = getMeData?.user?.profileImage;
    setPreviewUrl(img && img !== "null" ? img : null);

    if (initialFormValues) {
      reset(initialFormValues as any, { keepDirty: false, keepTouched: false });
    }
  };

  if (isLoading) return <Loader text="Loading..." />;
  if (isError) return <p>something went wrong</p>;

  return (
    <OutletLayout
      heading="User profile"
      backButton={
        isEdit ? (
          <BackIcon onClick={handleCancelEdit} />
        ) : (
          <BackIcon onClick={() => navigate(-1)} />
        )
      }
    >
      {isLoader && <Loader text="Updating..." />}
      {isShowDeleteModal && <DeleteClientModal />}

      {isEdit ? (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(updateFunction)} className="mt-6 space-y-5">
            <div>
              <LabelData label="User Image" />
              <div className="relative w-32 h-32">
                {!showUploader ? (
                  previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Client"
                      crossOrigin="use-credentials"
                      className="w-32 h-32 rounded-md object-cover"
                    />
                  ) : (
                    <UserIcon
                      className="text-8xl text-textColor"
                      profileImg={getMeDetail?.user?.profileImage}
                    />
                  )
                ) : (
                  <FileUploader onFileSelect={handleFileSelect} />
                )}

                {!showUploader && (
                  <CrossIcon
                    onClick={() => {
                      // If image exists, remove; else open uploader
                      if (previewUrl) {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setImageChanged(true);
                      } else {
                        setShowUploader(true);
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-[33px] mt-5 md:mt-10">
              <InputField
                required
                label="Full Name"
                register={register("fullName")}
                placeHolder="Enter Full Name."
                error={errors.fullName?.message}
              />

              {getMeData?.user?.role === "provider" ? (
                <InputField
                  required
                  label="License Number"
                  type="text"
                  register={register("licenseNo")}
                  placeHolder="Enter license number."
                  error={errors.licenseNo?.message}
                />
              ) : (
                <InputField disabled label="Client ID" value={getMeData?.client?.clientId || getMeData?.user?.licenseNo || "-"} />
              )}

              <InputField
                required
                label="Age"
                type="number"
                register={register("age")}
                placeHolder="Enter Age."
                error={errors.age?.message}
              />

              <Dropdown<FormFields>
                name="department"
                label="Department"
                control={control}
                options={departmentOptions}
                placeholder="Choose an option"
                error={errors.department?.message}
              />

              <InputField
                required
                label="Email"
                register={register("email")}
                placeHolder="Enter Email."
                error={errors.email?.message}
              />

              <InputField
                required
                label="Contact Number"
                type="number"
                register={register("contactNo")}
                placeHolder="Enter contact."
                error={errors.contactNo?.message}
              />

              <InputField
                label="Address"
                register={register("address")}
                placeHolder="Enter Address."
                error={errors.address?.message}
              />

              <CountryStateSelect
                isCountryView={true}
                isStateView={false}
                defaultCountry={getMeData?.user?.country}
                required={true}
              />
              <CountryStateSelect
                isCountryView={false}
                isStateView={true}
                defaultState={getMeData?.user?.state}
                required={true}
              />

              <div className="">
                <LabelData label="List of Active Clients" />
                <ul className="text-[14px] font-medium text-textGreyColor">
                  {getMeDetail?.clientList?.map((c, index) => (
                    <li key={index}>
                      <div className="flex items-center gap-x-3">
                        <div className="flex items-center gap-x-2 whitespace-nowrap">
                          <GoDotFill className="text-[6px]" />
                          {c?.client?.user?.fullName}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ✅ Update is disabled until required fields are valid/filled */}
            <div className="flex items-center justify-end -mt-8">
              <div
                className="w-[120px]"
                title={
                  !canSubmitUpdate
                    ? "Fill all required fields to enable Update"
                    : "Update profile"
                }
              >
                <Button
                  text={updateMutation.isPending ? "Updating..." : "Update"}
                  sm
                />
              </div>

              {/* {!canSubmitUpdate && (
                <p className="ml-3 text-xs text-red-600">
                  Fill all required fields to enable Update.
                </p>
              )} */}
            </div>
          </form>
        </FormProvider>
      ) : (
        <>
          <div className="mt-6 space-y-5">
            <div>
              <LabelData label="User Image" />
              <div className="relative w-32 h-32">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Client"
                    crossOrigin="use-credentials"
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                ) : (
                  <UserIcon
                    className="text-8xl text-textColor"
                    profileImg={getMeData?.user?.profileImage}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
              <LabelData label="Full Name" data={getMeData?.user?.fullName} />
              {getMeData?.user?.role === "provider" ? (
                <LabelData label="License Number" data={getMeData?.user?.licenseNo} />
              ) : (
                <LabelData label="Client ID" data={getMeData?.client?.clientId || getMeData?.user?.licenseNo} />
              )}
              <LabelData label="Age" data={getMeData?.user?.age ?? ""} />
              <LabelData label="Department" data={getMeData?.department} />
              <LabelData label="Email" data={getMeData?.user?.email} />
              <LabelData label="Contact Number" data={getMeData?.user?.contactNo ?? ""} />
              <LabelData label="Address" data={getMeData?.user?.address ?? "-"} />
              <LabelData
                label="Country"
                data={getCountryNameFromCode(getMeData?.user?.country ?? "")}
              />
              <LabelData label="State" data={getMeData?.user?.state} />

              <div className="">
                <LabelData label="List of Active Clients" />
                <ul className="text-[14px] font-medium text-textGreyColor">
                  {getMeDetail?.clientList && getMeDetail?.clientList?.length > 0 ? (
                    getMeDetail?.clientList?.map((c, index) => (
                      <li key={index}>
                        <div className="flex items-center gap-x-3">
                          <div className="flex items-center gap-x-2 whitespace-nowrap">
                            <GoDotFill className="text-[6px]" />
                            {c?.client?.user?.fullName}
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p>No Clients Found</p>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end w-full -mt-8">
              <div className="w-[100px]">
                <Button text="Edit" sm onclick={handleEditClick} />
              </div>
            </div>
          </div>
        </>
      )}
    </OutletLayout>
  );
};

export default UserProfile;
