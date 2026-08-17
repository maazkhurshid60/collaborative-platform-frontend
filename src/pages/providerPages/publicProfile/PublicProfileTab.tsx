import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Check, Loader } from "lucide-react";
import { AxiosError } from "axios";

import { providerProfileApiService } from "../../../services/providerProfileApiService";
import { LANDING_SITE_URL } from "../../../constantData/LandingSite";
import {
  CATEGORIES,
  toFormState,
  type CategoryKey,
  type ProfileFormState,
} from "./types";
import { ProfileHeader } from "./components/ProfileHeader";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProfileCategorySections } from "./components/ProfileCategorySections";

const PublicProfileTab = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(
    CATEGORIES[0].key,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["providerProfile", "me"],
    queryFn: async () => {
      const response = await providerProfileApiService.getMyProfile();
      return response?.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { control, register, handleSubmit, reset, watch } =
    useForm<ProfileFormState>({
      defaultValues: toFormState(data),
    });

  useEffect(() => {
    if (data) {
      reset(toFormState(data));
    }
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: async (formValues: ProfileFormState) => {
      const payload = {
        ...formValues,
        yearsOfExperience: formValues.yearsOfExperience
          ? Number(formValues.yearsOfExperience)
          : null,
        consultationFee: formValues.consultationFee
          ? Number(formValues.consultationFee)
          : null,
        followUpFee: formValues.followUpFee
          ? Number(formValues.followUpFee)
          : null,
      };
      const response = await providerProfileApiService.updateMyProfile(payload);
      return response?.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["providerProfile", "me"], updated);
      reset(toFormState(updated));
      toast.success("Profile saved successfully.");
    },
    onError: () => toast.error("Failed to save profile."),
  });

  const publishMutation = useMutation({
    mutationFn: async (nextIsPublished: boolean) => {
      const response =
        await providerProfileApiService.setPublished(nextIsPublished);
      return response?.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["providerProfile", "me"], updated);
      reset(toFormState(updated));
      toast.success(
        updated?.isPublished
          ? "Profile is now public."
          : "Profile is now private.",
      );
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err?.response?.data?.message || "Failed to update publish status.");
    },
  });

  const formValues = watch();
  const publicUrl = `${LANDING_SITE_URL}/p/${formValues.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => toast.success("Link copied to clipboard."))
      .catch(() => toast.error("Failed to copy link."));
  };

  const onSubmit = (values: ProfileFormState) => updateMutation.mutate(values);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader
          size={30}
          className="animate-spin text-transaction-summary-ammont"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-2">
      <ProfileHeader
        formValues={formValues}
        isPublishPending={publishMutation.isPending}
        onPublishToggle={(nextPublished) =>
          publishMutation.mutate(nextPublished)
        }
        onCopyLink={handleCopyLink}
      />

      <CategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <ProfileCategorySections
        activeCategory={activeCategory}
        control={control}
        register={register}
      />

      <div className="flex justify-end pb-6">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-transaction-summary-ammont text-white font-bold text-[16px] hover:bg-[#237c76] shadow-lg shadow-[#2c9993]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            "Saving..."
          ) : (
            <>
              <Check size={18} /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PublicProfileTab;
