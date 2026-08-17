import { Copy, ExternalLink } from "lucide-react";
import Toggle from "../../../../components/toggle/Toggle";
import { LANDING_SITE_URL } from "../../../../constantData/LandingSite";
import type { ProfileFormState } from "../types";
import { ProfileCompletenessBar, PUBLISH_THRESHOLD_PERCENT } from "./ProfileCompletenessBar";

interface ProfileHeaderProps {
  formValues: ProfileFormState;
  isPublishPending: boolean;
  onPublishToggle: (nextIsPublished: boolean) => void;
  onCopyLink: () => void;
}

export const ProfileHeader = ({
  formValues,
  isPublishPending,
  onPublishToggle,
  onCopyLink,
}: ProfileHeaderProps) => {
  const publicUrl = `${LANDING_SITE_URL}/p/${formValues.slug}`;
  const completenessPercent = formValues.completenessPercent ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6 drop-shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#101828]">Public Profile</h1>
          <p className="text-[14px] text-[#667085] mt-1">
            Build the profile new clients see, and share it anywhere.
          </p>
        </div>
        <div className={`flex items-center gap-2.5 ${isPublishPending ? "opacity-50 pointer-events-none" : ""}`}>
          <span
            className={`text-[14px] font-medium transition-colors ${
              !formValues.isPublished ? "text-[#333333]" : "text-[#98A2B3]"
            }`}
          >
            Private
          </span>
          <Toggle
            checked={formValues.isPublished}
            onChange={(e) => onPublishToggle(e.target.checked)}
            dataTestId="public-profile-publish-toggle"
          />
          <span
            className={`text-[14px] font-medium transition-colors ${
              formValues.isPublished ? "text-primaryColorDark" : "text-[#98A2B3]"
            }`}
          >
            Public
          </span>
        </div>
      </div>

      <ProfileCompletenessBar
        completenessPercent={completenessPercent}
        helperText={
          formValues.isPublished
            ? `Your profile is below the ${PUBLISH_THRESHOLD_PERCENT}% mark recommended for a strong public listing — fill in more details to improve it.`
            : `Fill in at least ${PUBLISH_THRESHOLD_PERCENT}% of your public profile before you can publish it.`
        }
        className="mt-5"
      />

      {formValues.isPublished && (
        <div className="mt-5 flex items-center gap-2 bg-inputBgColor rounded-lg px-4 py-3">
          <span className="text-[14px] text-[#333333] truncate flex-1">
            {publicUrl}
          </span>
          <button
            type="button"
            onClick={onCopyLink}
            className="text-[#2C9993] cursor-pointer"
            title="Copy link"
          >
            <Copy size={18} />
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#2C9993]"
            title="Open"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`text-[12px] px-3 py-1 rounded-full font-medium ${
            formValues.identityVerified
              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {formValues.identityVerified
            ? "✓ Identity Verified"
            : "Identity Not Verified"}
        </span>
        <span
          className={`text-[12px] px-3 py-1 rounded-full font-medium ${
            formValues.backgroundChecked
              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {formValues.backgroundChecked
            ? "✓ Background Checked"
            : "Background Not Checked"}
        </span>
        <span className="text-[12px] text-[#667085] px-1 py-1">
          These are set by Kolab Me admin review, not by you.
        </span>
      </div>
    </div>
  );
};
