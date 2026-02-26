



import OutletLayout from "../../../layouts/outletLayout/OutletLayout";
import LabelData from "../../../components/labelText/LabelData";
import Button from "../../../components/button/Button";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "../../../components/inputField/InputField";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { isModalDeleteReducer } from "../../../redux/slices/ModalSlice";
import { accountSchema } from "../../../schema/clientSchema/ClientSchema";
import BackIcon from "../../../components/icons/back/Back";
import UploadFile from "../../../components/inputField/UploadFile";
import { AiOutlineDelete } from "react-icons/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import loginUserApiService from "../../../apiServices/loginUserApi/LoginUserApi";
import Loader from "../../../components/loader/Loader";
import { saveLoginUserDetailsReducer } from "../../../redux/slices/LoginUserDetailSlice";
import { GetMeType } from "../../../types/clientType/ClientType";
import DeleteClientModal from "../../../components/modals/providerModal/deleteClientModal/DeleteClientModal";
import { useNavigate } from "react-router-dom";
import CrossIcon from "../../../components/icons/cross/Cross";
import { getCountryNameFromCode } from "../../../utils/GetCountryName";
import CountryStateSelect from "../../../components/dropdown/CountryStateSelect";

type FormFields = z.infer<typeof accountSchema>;

/**
 * Make the Edit icon clickable.
 * - role="button" + tabIndex + onKeyDown for keyboard access
 * - Pass onClick into the SVG wrapper
 */
const EditIcon = ({
  onClick,
  ...props
}: React.SVGProps<SVGSVGElement> & { onClick?: () => void }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onClick?.();
    }}
    aria-label="Edit account settings"
    {...props}
  >

  </svg>
);

type ESignatureAction = "keep" | "replace" | "remove";

const Settings = () => {
  const [isEdit, setIsEdit] = useState(false);

  const [signPreviewUrl, setSignPreviewUrl] = useState<string | null>(null);

  const [existingSignature, setExistingSignature] = useState<string | null>(null);

  const [selectedSignatureFile, setSelectedSignatureFile] = useState<File | null>(
    null
  );

  const [eSignatureAction, setESignatureAction] =
    useState<ESignatureAction>("keep");

  const [isLoader, setIsLoader] = useState(false);
  const [getMeDetail, setGetMeDetail] = useState<GetMeType | undefined>(undefined);

  const loginUserId = useSelector(
    (state: RootState) => state?.LoginUserDetail?.userDetails
  );

  const isShowDeleteModal = useSelector(
    (state: RootState) => state.modalSlice.isModalDelete
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const methods = useForm<FormFields>({
    resolver: zodResolver(accountSchema),
    // Optional but useful: values are retained across toggles unless you reset.
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = methods;

  const {
    data: getMeData,
    isLoading,
    isError,
  } = useQuery<GetMeType>({
    queryKey: ["loginUser"],
    queryFn: async () => {
      const response = await loginUserApiService.getMeApi({
        role: loginUserId?.user?.role,
        loginUserId: loginUserId?.id,
      });
      console.log("response of client", response);
      return response?.data?.data;
    },
    enabled: Boolean(loginUserId?.id),
  });

  // Helper: normalize backend signature string
  const normalizedServerSignature = useMemo(() => {
    const raw = getMeData?.eSignature;
    if (!raw) return null;
    const lowered = String(raw).trim().toLowerCase();
    if (lowered === "" || lowered === "null") return null;
    return String(raw);
  }, [getMeData?.eSignature]);

  useEffect(() => {
    if (!getMeData) return;

    setGetMeDetail(getMeData);

    reset({
      fullName: getMeData?.user?.fullName ?? "",
      licenseNo: getMeData?.user?.role === "client"
        ? (getMeData?.clientId ?? "")
        : (getMeData?.user?.licenseNo ?? ""),
      email: getMeData?.user?.email ?? "",
      country: getMeData?.user?.country ?? "",
      state: getMeData?.user?.state ?? "",
      address: getMeData?.user?.address ?? "",
    } as any);

    setExistingSignature(normalizedServerSignature);
    setSignPreviewUrl(normalizedServerSignature);

    setSelectedSignatureFile(null);
    setESignatureAction("keep");
  }, [getMeData, normalizedServerSignature, reset]);

  useEffect(() => {
    return () => {
      if (signPreviewUrl && signPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(signPreviewUrl);
      }
    };
    // We only want to run cleanup on unmount; do not include signPreviewUrl as dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // cleanup old blob url if any
    if (signPreviewUrl && signPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(signPreviewUrl);
    }

    const imageUrl = URL.createObjectURL(file);
    setSignPreviewUrl(imageUrl);
    setSelectedSignatureFile(file);

    // Explicit intent: replace
    setESignatureAction("replace");
  };

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await loginUserApiService.updateMeApi(formData);
      if (!response) {
        throw new Error("Failed to update account");
      }
      dispatch(saveLoginUserDetailsReducer(response?.data));
      return response;
    },
    onMutate: () => setIsLoader(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loginUser"] });
      toast.success("Account updated successfully");
      setIsEdit(false);

      // After success, clear selection + action; server will be re-fetched
      setSelectedSignatureFile(null);
      setESignatureAction("keep");
      setIsLoader(false);
    },
    onError: () => {
      toast.error("Failed to update account");
      setIsLoader(false);
    },
  });

  /**
   * Critical fix:
   * Always send an explicit signature action so the backend does not interpret
   * “missing eSignature field” as “remove signature”.
   *
   * Backend contract (recommended):
   * - eSignatureAction=keep    => do not modify signature
   * - eSignatureAction=remove  => clear signature
   * - eSignatureAction=replace => replace with uploaded file
   */
  const updateFunction = async (data: FormFields) => {
    const formData = new FormData();

    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("address", (data.address ?? "") as any);
    formData.append("country", data.country);
    formData.append("state", data.state);

    // If schema is number: stringify
    formData.append("licenseNo", String((data as any).licenseNo ?? ""));

    formData.append("loginUserId", loginUserId?.user?.id);

    if (getMeDetail?.user?.role) {
      formData.append("role", getMeDetail.user.role);
    }

    // Decide action deterministically
    let action: ESignatureAction = eSignatureAction;

    // Defensive: if user never touched signature and there is an existing one,
    // keep it. If no existing and no selected file, keep (no-op).
    if (!selectedSignatureFile && action === "replace") action = "keep";

    formData.append("eSignatureAction", action);

    if (action === "replace" && selectedSignatureFile) {
      formData.append("eSignature", selectedSignatureFile);
    } else if (action === "remove") {
      // keep your existing backend behavior of using "null" to remove
      formData.append("eSignature", "null");
    } else {
      // keep: do not append eSignature at all (backend should ignore),
      // BUT action flag is present to prevent accidental clearing.
    }

    updateMutation.mutate(formData);
  };

  const deleteMeMutation = useMutation({
    mutationFn: async () =>
      await loginUserApiService.deleteMeApi(loginUserId?.user?.id),
    onSuccess: () => {
      dispatch(isModalDeleteReducer(false));
      toast.error("Your Account has been deleted.");
      navigate("/");
    },
    onError: () => toast.error("Failed to delete account!"),
  });

  const deleteMe = () => deleteMeMutation.mutate();

  // Edit icon click should enter edit mode
  const enterEditMode = () => {
    // Ensure form is populated with current data when entering edit mode
    if (getMeData) {
      reset({
        fullName: getMeData?.user?.fullName ?? "",
        licenseNo: getMeData?.user?.role === "client"
          ? (getMeData?.clientId ?? "")
          : (getMeData?.user?.licenseNo ?? ""),
        email: getMeData?.user?.email ?? "",
        country: getMeData?.user?.country ?? "",
        state: getMeData?.user?.state ?? "",
        address: getMeData?.user?.address ?? "",
      } as any);
    }
    setIsEdit(true);
  };

  const exitEditMode = () => {
    // Optional: revert UI signature changes when leaving edit mode without saving
    // Restore preview to existing signature and clear selection/action.
    if (signPreviewUrl && signPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(signPreviewUrl);
    }
    setSignPreviewUrl(existingSignature);
    setSelectedSignatureFile(null);
    setESignatureAction("keep");
    setIsEdit(false);
  };

  const onRemoveSignature = () => {
    if (signPreviewUrl && signPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(signPreviewUrl);
    }
    setSignPreviewUrl(null);
    setSelectedSignatureFile(null);
    setESignatureAction("remove");
  };

  if (isError) return <p>Something went wrong</p>;
  if (isLoading) return <Loader text="Loading..." />;

  return (
    <OutletLayout
      heading="Account Settings"
      button={
        !isEdit && (
          <Button
            icon={<AiOutlineDelete size={18} className="text-white" />}
            text="Delete Account"
            onclick={() => dispatch(isModalDeleteReducer(true))}
          />
        )
      }
      backButton={
        <BackIcon
          onClick={() => {
            if (isEdit) {
              exitEditMode();
            } else {
              navigate(-1);
            }
          }}
        />
      }
    >
      {!isEdit && (
        <div className="relative">
          <div className="absolute hidden md:block -top-[6px] md:-top-10 md:left-[230px] lg:-top-17 text-primaryColorDark">
            {/* Make icon functional */}
            <EditIcon onClick={enterEditMode} />
          </div>
        </div>
      )}

      {isLoader && <Loader text="Updating..." />}

      {isShowDeleteModal && (
        <DeleteClientModal
          onDeleteConfirm={deleteMe}
          heading="Delete Account"
          text={
            <div>
              By deleting your account, you won't be able to track your signed
              documents. Are you sure you want to{" "}
              <span className="font-semibold">Delete your Account</span>?
            </div>
          }
        />
      )}

      <p className="font-bold mt-6">General Settings</p>

      {isEdit ? (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(updateFunction)} className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              <InputField
                required
                label="Full Name"
                register={register("fullName")}
                placeHolder="Enter Full Name."
                error={errors.fullName?.message}
              />

              <InputField
                disabled
                required
                label={getMeData?.user?.role === "client" ? "Client ID" : "License Number"}
                type="text"
                register={register("licenseNo" as any)} // Still using licenseNo field in form but with clientId value for clients
                placeHolder={getMeData?.user?.role === "client" ? "Client ID" : "Enter license number."}
                error={(errors as any).licenseNo?.message}
              />

              <InputField
                required
                label="Email ID"
                register={register("email")}
                placeHolder="Enter Email."
                error={errors.email?.message}
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
              />
              <CountryStateSelect
                isCountryView={false}
                isStateView={true}
                defaultState={getMeData?.user?.state}
              />
            </div>

            <hr className="w-full h-[1px] text-greyColor mt-10" />

            <div className="w-[300px] mt-10">
              <div className="flex items-start gap-x-2.5">
                <p className="font-semibold mb-2">E-Signature</p>
                <p className="text-redColor">*</p>
              </div>

              {signPreviewUrl ? (
                <div className="relative">
                  <img
                    src={signPreviewUrl}
                    alt="Uploaded Signature"
                    style={{ maxHeight: "120px", objectFit: "contain" }}
                  />
                  <CrossIcon onClick={onRemoveSignature} />
                </div>
              ) : (
                <UploadFile
                  onChange={handleFileChange}
                  text="Add your signature here"
                  heading="Sign here"
                />
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="mt-1 w-[100px]">
                <Button text="Update" />
              </div>
            </div>
          </form>
        </FormProvider>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            <LabelData label="Full Name" data={getMeData?.user?.fullName} />
            <LabelData
              label={getMeData?.user?.role === "client" ? "Client ID" : "License Number"}
              data={getMeData?.user?.role === "client" ? getMeData?.clientId : getMeData?.user?.licenseNo}
            />
            <LabelData
              label="Email ID"
              data={getMeData?.user?.email?.toLowerCase()}
            />
            <LabelData label="Address" data={getMeData?.user?.address ?? "-"} />
            <LabelData
              label="Country"
              data={getCountryNameFromCode(getMeData?.user?.country ?? "")}
            />
            <LabelData label="State" data={getMeData?.user?.state} />
          </div>

          <hr className="w-full h-[1px] text-greyColor mt-10" />

          <div className="w-[300px] mt-10">
            <p className="font-semibold mb-2">E-Signature</p>
            {signPreviewUrl ? (
              <img
                src={signPreviewUrl}
                alt="E-Signature"
                style={{
                  maxHeight: "120px",
                  objectFit: "contain",
                  marginTop: "20px",
                }}
              />
            ) : (
              <p>Upload Your E-Signature</p>
            )}
          </div>

          <div className="flex items-center justify-end w-full mt-8">
            <div className="w-[100px]">
              <Button text="Edit" sm onclick={enterEditMode} />
            </div>
          </div>
        </>
      )}
    </OutletLayout>
  );
};

export default Settings;