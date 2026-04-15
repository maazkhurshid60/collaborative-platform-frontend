
import OutletLayout from "../../../../layouts/outletLayout/OutletLayout";
import BackIcon from "../../../icons/back/Back";
import { useNavigate } from "react-router-dom";
import Button from "../../../button/Button";
import InputField from "../../../inputField/InputField";
import Dropdown from "../../../dropdown/Dropdown";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { clientSchema } from "../../../../schema/clientSchema/ClientSchema";
import { statusOption } from "../../../../constantData/statusOptions";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clientApiService from "../../../../apiServices/clientApi/ClientApi";
import { useMemo, useState } from "react";
import Loader from "../../../loader/Loader";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import Checkbox from "../../../checkbox/Checkbox";
import CountryStateSelect from "../../../dropdown/CountryStateSelect";
import type { AxiosError } from "axios";
import type { z } from "zod";

type FormFields = z.infer<typeof clientSchema>;

type BackendFieldErrors =
  | Record<string, string>
  | Record<string, string[]>
  | Array<{ field?: string; property?: string; message?: string; constraints?: Record<string, string> }>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeBackendErrors(payload: unknown): Array<{ field?: string; message: string }> {
  if (!payload) return [];

  // Case: { statusCode: 400, data: { error: [{ message: "...", path: ["fullName"] }] }, ... }
  if (isObject(payload) && isObject((payload as any).data) && Array.isArray((payload as any).data?.error)) {
    const errors = (payload as any).data.error;
    return errors.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path[0] : e.field || e.property,
      message: e.message
    })).filter((e: any) => e.message);
  }

  // Case: { message: ["email must be an email", ...], error: "Bad Request", statusCode: 400 }
  if (isObject(payload) && Array.isArray(payload.message)) {
    const msgs = payload.message.filter((m) => typeof m === "string") as string[];
    return msgs.map((m) => ({ message: m }));
  }

  // Case: { errors: [{ field: "email", message: "Invalid email" }, ...] }
  if (isObject(payload) && Array.isArray((payload as any).errors)) {
    const errors = (payload as any).errors as BackendFieldErrors;
    if (Array.isArray(errors)) {
      return errors
        .map((e) => {
          const field = (e as any).field ?? (e as any).property;
          const msg =
            (e as any).message ||
              (e as any).msg ||
              (e as any)?.constraints
              ? Object.values((e as any).constraints || {}).join(", ")
              : "";
          return msg ? { field, message: msg } : null;
        })
        .filter(Boolean) as Array<{ field?: string; message: string }>;
    }
  }

  // Case: { error: { email: "Invalid email", age: "Required" } }
  if (isObject(payload) && isObject((payload as any).error)) {
    const errObj = (payload as any).error as Record<string, unknown>;
    const out: Array<{ field?: string; message: string }> = [];
    for (const [k, v] of Object.entries(errObj)) {
      if (typeof v === "string") out.push({ field: k, message: v });
      else if (Array.isArray(v)) out.push({ field: k, message: (v as any[]).join(", ") });
    }
    return out;
  }

  // Case: { message: "Validation failed" }
  if (isObject(payload) && typeof (payload as any).message === "string") {
    return [{ message: (payload as any).message as string }];
  }

  return [];
}

// Optional: map backend field names to your RHF fields
const FIELD_MAP: Record<string, keyof FormFields> = {
  fullName: "fullName",
  // licenseNo removed
  age: "age",
  email: "email",
  contactNo: "contactNo",
  address: "address",
  gender: "gender",
  status: "status",
  // country: "country",
  state: "state",
};

const AddClient = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const methods = useForm<FormFields>({
    resolver: zodResolver(clientSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setError,
    clearErrors,
  } = methods;

  const [isLoader, setIsLoader] = useState(false);
  const [wantToBeSeen, setWantToBeSeen] = useState(true);

  // ✅ Make this consistent with the rest of your app:
  // const providerId =
  //   useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.user?.id) ||
  //   useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);

  const providerId = useSelector((state: RootState) => state?.LoginUserDetail?.userDetails?.id);


  const handleCheckboxChange = () => setWantToBeSeen((prev) => !prev);


  console.log("Redux userDetails:", useSelector((s: RootState) => s.LoginUserDetail?.userDetails));
  console.log("providerId being sent:", providerId);

  const mutation = useMutation({
    mutationFn: async (data: FormFields) => {
      const formData = new FormData();

      // Normalize values before sending
      formData.append("fullName", data.fullName);
      // licenseNo is removed
      formData.append("age", data.age ? String(data.age) : "");
      formData.append("email", data.email);
      formData.append("contactNo", String(data.contactNo));
      formData.append("address", data.address ?? "");
      formData.append("gender", data.gender ?? "male");
      formData.append("status", data.status ?? "active");
      //    formData.append("country", data.country ?? "");
      formData.append("state", data.state ?? "");

      formData.append("isAccountCreatedByOwnClient", "false");
      formData.append("role", "client");
      formData.append("isApprove", "pending");

      // Required server side
      formData.append("providerId", String(providerId ?? ""));
      formData.append("clientShowToOthers", String(wantToBeSeen));

      await clientApiService.addClientApi(formData);
    },

    onMutate: () => setIsLoader(true),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("New Client has been added successfully");
      navigate("/clients");
      setIsLoader(false);
    },

    onError: (err: unknown) => {
      setIsLoader(false);

      // Clear old server errors so UI updates cleanly
      clearErrors();

      const axiosErr = err as AxiosError<any>;
      const payload = axiosErr?.response?.data;

      const normalized = normalizeBackendErrors(payload);

      // If we have per-field errors → attach them to fields
      if (normalized.length > 0) {
        let mappedCount = 0;

        for (const e of normalized) {
          if (e.field && FIELD_MAP[e.field]) {
            const fieldName = FIELD_MAP[e.field];
            setError(fieldName as any, { type: "server", message: e.message });
            mappedCount++;
          }
        }

        // Toast: show first message + count
        const firstMsg = normalized[0]?.message || "Validation failed";
        const extra = Math.max(0, normalized.length - 1);
        toast.error(extra ? `${firstMsg} (+${extra} more)` : firstMsg);



        return;
      }

      // Fallback
      const fallbackMsg =
        payload?.data?.error ||
        payload?.error ||
        payload?.message ||
        axiosErr?.message ||
        "Validation failed";
      toast.error(String(fallbackMsg));
    },
  });

  const addFunction = (data: FormFields) => {
    // If RHF already has client-side errors, stop here.
    // RHF will display errors under fields via your InputField error prop.
    mutation.mutate(data);
  };

  return (
    <OutletLayout heading="Add Client" backButton={<BackIcon onClick={() => navigate(-1)} />}>
      {isLoader && <Loader text="Adding..." />}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(addFunction)} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-5 sm:gap-y-6 md:gap-y-10 mt-5 md:mt-10">
            <InputField
              required
              label="Full Name"
              register={register("fullName")}
              placeHolder="Enter Full Name."
              error={errors.fullName?.message}
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
            />

            <InputField
              label="Age"
              register={register("age")}
              placeHolder="Enter Age."
              required
              error={errors.age?.message}
            />

            {/* License Number input removed */}

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
              required
              error={errors.address?.message}
            />

            {/* IMPORTANT:
               These components MUST write into RHF fields named "country" and "state"
               Otherwise backend validation will fail but UI can’t highlight.
            */}
            {/* <CountryStateSelect  isStateView={false} required={false} /> */}
            <CountryStateSelect isStateView={true} />

            <Dropdown<FormFields>
              name="status"
              label="Status"
              control={control}
              options={statusOption}
              placeholder="Choose an option"
            />
          </div>

          <div className="mt-8">
            <Checkbox
              text="Allow other providers to access and collaborate on this client’s care for this client"
              checked={wantToBeSeen}
              onChange={handleCheckboxChange}
            />
          </div>

          <div className="flex items-center justify-end">
            {/* Button component has no disabled prop, so we disable via wrapper */}
            <div className={`mt-10 w-[120px] ${mutation.isPending ? "opacity-60 pointer-events-none" : ""}`}>
              <Button text={mutation.isPending ? "Saving..." : "Save"} />
            </div>
          </div>
        </form>
      </FormProvider>
    </OutletLayout>
  );
};

export default AddClient;
