import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useDispatch } from "react-redux";
import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import LabelData from "../../../components/labelText/LabelData";
import Button from "../../../components/button/Button";
import InputField from "../../../components/inputField/InputField";
import Dropdown from "../../../components/dropdown/Dropdown";
import Loader from "../../../components/loader/Loader";
import BackIcon from "../../../components/icons/back/Back";
import UserIcon from "../../../components/icons/user/User";
import FileUploader from "../../../components/uploader/fileUploader/FileUploader";
import CrossIcon from "../../../components/icons/cross/Cross";
import CountryStateSelect from "../../../components/dropdown/CountryStateSelect";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";

import {
  fetchSuperAdmin,
  updateSuperAdmin,
  SuperAdminMeResponse,
} from "../../../apiServices/superAdmin/superAdmin";
import { superAdminSchema } from "../../../schema/superAdminSchema/SuperAdminSchema";
import { saveLoginUserDetailsReducer } from "../../../redux/slices/LoginUserDetailSlice";

type FormFields = z.infer<typeof superAdminSchema>;

const genderOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

export default function SuperAdminMePage() {
  const [isEdit, setIsEdit] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const methods = useForm<FormFields>({
    resolver: zodResolver(superAdminSchema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = methods;

  const { data: adminData, isLoading, isError } = useQuery<SuperAdminMeResponse>({
    queryKey: ["superAdminMe"],
    queryFn: fetchSuperAdmin,
  });

  const initialFormValues = useMemo(() => {
    if (!adminData) return null;
    const user = adminData.user ?? {};

    return {
      fullName: user.fullName ?? "",
      licenseNo: user.licenseNo ?? "",
      age: Number(user.age ?? 0),
      contactNo: user.contactNo ?? "",
      email: user.email ?? "",
      address: user.address ?? "",
      country: user.country ?? "", // ISO2 code like "US"
      state: user.state ?? "",
      gender: user.gender ?? "MALE",
    } as FormFields;
  }, [adminData]);

  useEffect(() => {
    if (adminData && initialFormValues) {
      reset(initialFormValues);
      const img = adminData.user?.profileImage;
      setPreviewUrl(img && img !== "null" ? img : null);
    }
  }, [adminData, initialFormValues, reset]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowUploader(false);
    setImageChanged(true);
  };

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateSuperAdmin(adminData!.id, data),
    onMutate: () => setIsLoader(true),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["superAdminMe"] });

      // Update Redux so navbar and other components see the new data immediately
      dispatch(saveLoginUserDetailsReducer(updatedData as any));

      toast.success("Profile updated successfully");
      setIsEdit(false);
      setImageChanged(false);
      setIsLoader(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update profile");
      setIsLoader(false);
    },
  });

  const onSubmit = (data: FormFields) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("licenseNumber", data.licenseNo); // Backend maps licenseNumber to licenseNo
    formData.append("age", String(data.age));
    formData.append("contactNo", data.contactNo);
    formData.append("email", data.email);
    formData.append("address", data.address);
    formData.append("country", data.country);
    formData.append("state", data.state);
    formData.append("gender", data.gender);

    if (imageChanged) {
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      } else {
        formData.append("profileImage", "null");
      }
    }

    updateMutation.mutate(formData);
  };

  const handleEditClick = () => {
    setIsEdit(true);
    setShowUploader(false);
    setImageChanged(false);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setImageChanged(false);
    setShowUploader(false);
    setSelectedFile(null);
    if (initialFormValues) reset(initialFormValues);
    const img = adminData?.user?.profileImage;
    setPreviewUrl(img && img !== "null" ? img : null);
  };

  if (isLoading) return <Loader text="Loading profile..." />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load profile.</div>;

  return (
    <OutletLayout
      heading="User profile"
      backButton={isEdit ? <BackIcon onClick={handleCancelEdit} /> : undefined}
    >
      {isLoader && <Loader text="Updating profile..." />}

      {isEdit ? (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <LabelData label="User Image" />
              <div className="relative w-32 h-32">
                {!showUploader ? (
                  previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <UserIcon className="text-8xl text-textColor" />
                  )
                ) : (
                  <FileUploader onFileSelect={handleFileSelect} />
                )}

                {!showUploader && (
                  <CrossIcon
                    onClick={() => {
                      if (previewUrl) {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setImageChanged(true);
                      } else {
                        setShowUploader(true);
                      }
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 lg:grid-cols-3 gap-y-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
              <InputField
                required
                label="Full Name"
                register={register("fullName")}
                placeHolder="Enter Full Name"
                error={errors.fullName?.message}
              />

              <InputField
                required
                label="License Number"
                register={register("licenseNo")}
                placeHolder="Enter License Number"
                error={errors.licenseNo?.message}
              />

              <InputField
                required
                label="Age"
                type="number"
                register={register("age")}
                placeHolder="Enter Age"
                error={errors.age?.message}
              />

              <Dropdown<FormFields>
                name="gender"
                label="Gender"
                control={control}
                options={genderOptions}
                placeholder="Select Gender"
                error={errors.gender?.message}
              />

              <InputField
                required
                label="Email"
                register={register("email")}
                placeHolder="Enter Email"
                error={errors.email?.message}
              />

              <InputField
                required
                label="Contact Number"
                register={register("contactNo")}
                placeHolder="Enter Contact Number"
                error={errors.contactNo?.message}
              />

              <InputField
                required
                label="Address"
                register={register("address")}
                placeHolder="Enter Address"
                error={errors.address?.message}
              />

              <CountryStateSelect
                isCountryView={true}
                isStateView={false}
                defaultCountry={adminData?.user?.country}
              />
              <CountryStateSelect
                isCountryView={false}
                isStateView={true}
                defaultState={adminData?.user?.state}
              />
            </div>

            <div className="flex items-center justify-end">
              <div className="w-[120px]">
                <Button text={updateMutation.isPending ? "Updating..." : "Update"} sm />
              </div>
            </div>
          </form>
        </FormProvider>
      ) : (
        <div className="mt-6 space-y-8">
          <div>
            <LabelData label="User Image" />
            <div className="mt-3 relative w-32 h-32">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-lg object-cover shadow-sm border border-gray-100"
                />
              ) : (
                <UserIcon className="text-8xl text-textColor opacity-20" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 lg:grid-cols-3">
            <LabelData label="Full Name" data={adminData?.user?.fullName} />
            <LabelData label="License Number" data={adminData?.user?.licenseNo} />
            <LabelData label="Age" data={adminData?.user?.age} />
            <LabelData label="Gender" data={adminData?.user?.gender} />
            <LabelData label="Email" data={adminData?.user?.email} />
            <LabelData label="Contact Number" data={adminData?.user?.contactNo} />
            <LabelData label="Address" data={adminData?.user?.address} />
            <LabelData
              label="Country"
              data={getCountryNameFromCode(adminData?.user?.country ?? "")}
            />
            <LabelData label="State" data={adminData?.user?.state} />
          </div>

          <div className="flex items-center justify-end pt-4">
            <div className="w-[100px]">
              <Button text="Edit" sm onclick={handleEditClick} />
            </div>
          </div>
        </div>
      )}
    </OutletLayout>
  );
}
