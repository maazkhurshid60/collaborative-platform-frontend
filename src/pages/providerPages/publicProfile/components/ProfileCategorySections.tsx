import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { availabilityToggles, type CategoryKey, type ProfileFormState } from "../types";
import { Section, TextField, TagListField } from "./FormControls";
import RepeatableList from "../RepeatableList";

interface ProfileCategorySectionsProps {
  activeCategory: CategoryKey;
  control: Control<ProfileFormState>;
  register: UseFormRegister<ProfileFormState>;
}

export const ProfileCategorySections = ({
  activeCategory,
  control,
  register,
}: ProfileCategorySectionsProps) => {
  return (
    <div className="mb-6">
      {activeCategory === "basic" && (
        <Section title="Basic Information">
          <TextField
            label="Professional Title"
            registration={register("professionalTitle")}
          />
          <TextField
            label="Credentials (e.g. LMFT, PhD)"
            registration={register("credentials")}
          />
          <TextField
            label="Years of Experience"
            type="number"
            registration={register("yearsOfExperience")}
          />
        </Section>
      )}

      {activeCategory === "summary" && (
        <Section title="Professional Summary">
          <TextField
            label="Short Introduction"
            registration={register("shortIntroduction")}
          />
          <TextField
            label="About Me"
            registration={register("aboutMe")}
            multiline
          />
          <TextField
            label="Professional Philosophy"
            registration={register("professionalPhilosophy")}
            multiline
          />
          <TextField
            label="Why I Do This Work"
            registration={register("whyIDoThisWork")}
            multiline
          />
        </Section>
      )}

      {activeCategory === "specialties" && (
        <Section title="Specialties & Focus">
          <TagListField
            control={control}
            name="specialties"
            label="Primary Specialties"
          />
          <TagListField
            control={control}
            name="conditionsTreated"
            label="Conditions Treated"
          />
          <TagListField
            control={control}
            name="areasOfExpertise"
            label="Areas of Expertise"
          />
          <TagListField
            control={control}
            name="services"
            label="Services Offered"
            placeholder="e.g. Individual Therapy, Couples Therapy"
          />
          <TagListField
            control={control}
            name="clientFocus"
            label="Client Focus"
            placeholder="e.g. Children, Teens, Adults, Seniors, Couples"
          />
          <TagListField
            control={control}
            name="treatmentApproaches"
            label="Treatment Approaches"
            placeholder="e.g. CBT, DBT, EMDR"
          />
          <TagListField
            control={control}
            name="languages"
            label="Languages Spoken"
          />
        </Section>
      )}

      {activeCategory === "availability" && (
        <Section title="Availability">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availabilityToggles.map(({ key, label }) => (
              <Controller
                key={key}
                name={key}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <div
                    onClick={() => onChange(!value)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm cursor-pointer hover:border-transaction-summary-ammont transition-all"
                  >
                    <span className="text-[14px] font-medium text-gray-800 pr-2">
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(value)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        value ? "bg-transaction-summary-ammont" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}
              />
            ))}
          </div>
          <TextField
            label="Office Hours"
            registration={register("officeHours")}
            placeholder="e.g. Mon–Fri, 9am–5pm"
          />
        </Section>
      )}

      {activeCategory === "experience" && (
        <Section title="Experience">
          <TagListField
            control={control}
            name="previousOrganizations"
            label="Previous Organizations"
          />
          <TextField
            label="Clinical Experience"
            registration={register("clinicalExperience")}
            multiline
          />
        </Section>
      )}

      {activeCategory === "education" && (
        <Section title="Education">
          <Controller
            control={control}
            name="education"
            render={({ field }) => (
              <RepeatableList
                label="Education"
                items={field.value}
                onChange={field.onChange}
                emptyItem={{
                  degree: "",
                  university: "",
                  graduationYear: "",
                }}
                fields={[
                  { key: "degree", label: "Degree" },
                  { key: "university", label: "University" },
                  { key: "graduationYear", label: "Graduation Year" },
                ]}
              />
            )}
          />
        </Section>
      )}

      {activeCategory === "licenses" && (
        <Section title="Licenses & Certifications">
          <Controller
            control={control}
            name="licenses"
            render={({ field }) => (
              <RepeatableList
                label="Licenses"
                items={field.value}
                onChange={field.onChange}
                emptyItem={{
                  licenseType: "",
                  licenseNumber: "",
                  state: "",
                  country: "",
                  expirationDate: "",
                  boardCertification: "",
                }}
                fields={[
                  { key: "licenseType", label: "License Type" },
                  { key: "licenseNumber", label: "License Number" },
                  { key: "state", label: "State" },
                  { key: "country", label: "Country" },
                  {
                    key: "expirationDate",
                    label: "Expiration Date",
                    type: "date",
                  },
                  {
                    key: "boardCertification",
                    label: "Board Certification",
                  },
                ]}
              />
            )}
          />
        </Section>
      )}

      {activeCategory === "locations" && (
        <Section title="Locations">
          <Controller
            control={control}
            name="locations"
            render={({ field }) => (
              <RepeatableList
                label="Locations"
                items={field.value}
                onChange={field.onChange}
                emptyItem={{
                  clinicName: "",
                  address: "",
                  city: "",
                  state: "",
                  country: "",
                  latitude: "",
                  longitude: "",
                  isPrimary: false,
                }}
                fields={[
                  { key: "clinicName", label: "Clinic Name" },
                  { key: "address", label: "Address" },
                  { key: "city", label: "City" },
                  { key: "state", label: "State" },
                  { key: "country", label: "Country" },
                  {
                    key: "latitude",
                    label: "Latitude (for map link)",
                    type: "number",
                  },
                  {
                    key: "longitude",
                    label: "Longitude (for map link)",
                    type: "number",
                  },
                  {
                    key: "isPrimary",
                    label: "Primary Location",
                    type: "checkbox",
                  },
                ]}
              />
            )}
          />
        </Section>
      )}

      {activeCategory === "fees" && (
        <Section title="Fees & Insurance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField
              label="Consultation Fee ($)"
              type="number"
              registration={register("consultationFee")}
            />
            <TextField
              label="Follow-up Fee ($)"
              type="number"
              registration={register("followUpFee")}
            />
          </div>
          <label className="flex items-center gap-2 text-[14px] text-[#333333] cursor-pointer">
            <input
              type="checkbox"
              {...register("slidingScale")}
              className="w-4 h-4"
            />
            Offers Sliding Scale
          </label>
          <TagListField
            control={control}
            name="paymentMethods"
            label="Payment Methods"
            placeholder="e.g. Credit Card, Cash, HSA"
          />
          <TagListField
            control={control}
            name="insuranceAccepted"
            label="Insurance Accepted"
            placeholder="e.g. Aetna, Cigna"
          />
        </Section>
      )}

      {activeCategory === "memberships" && (
        <Section title="Professional Memberships">
          <Controller
            control={control}
            name="memberships"
            render={({ field }) => (
              <RepeatableList
                label="Memberships"
                items={field.value}
                onChange={field.onChange}
                emptyItem={{ organization: "", membershipType: "" }}
                fields={[
                  { key: "organization", label: "Organization" },
                  { key: "membershipType", label: "Membership Type" },
                ]}
              />
            )}
          />
        </Section>
      )}

      {activeCategory === "awards" && (
        <Section title="Awards & Recognition">
          <Controller
            control={control}
            name="awards"
            render={({ field }) => (
              <RepeatableList
                label="Awards"
                items={field.value}
                onChange={field.onChange}
                emptyItem={{ title: "", type: "Award", year: "", url: "" }}
                fields={[
                  { key: "title", label: "Title" },
                  {
                    key: "type",
                    label: "Type (Award/Publication/Research/Speaking)",
                  },
                  { key: "year", label: "Year" },
                  { key: "url", label: "Link" },
                ]}
              />
            )}
          />
        </Section>
      )}

      {activeCategory === "media" && (
        <Section title="Media">
          <TagListField
            control={control}
            name="clinicPhotos"
            label="Clinic Photo URLs"
            placeholder="Paste an image URL and press Enter"
          />
          <TagListField
            control={control}
            name="certificates"
            label="Certificate URLs"
            placeholder="Paste an image URL and press Enter"
          />
          <TextField
            label="Introduction Video URL"
            registration={register("introVideoUrl")}
          />
        </Section>
      )}

      {activeCategory === "web" && (
        <Section title="Web Presence">
          <TextField
            label="Website"
            registration={register("websiteUrl")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField
              label="LinkedIn"
              registration={register("socialLinks.linkedin")}
            />
            <TextField
              label="Facebook"
              registration={register("socialLinks.facebook")}
            />
            <TextField
              label="Instagram"
              registration={register("socialLinks.instagram")}
            />
            <TextField
              label="Twitter / X"
              registration={register("socialLinks.twitter")}
            />
          </div>
        </Section>
      )}

      {activeCategory === "emergency" && (
        <Section title="Emergency Information">
          <TextField
            label="Emergency Contact Instructions"
            registration={register("emergencyContactInstructions")}
            multiline
          />
          <TextField
            label="Crisis Resources"
            registration={register("crisisResources")}
            multiline
            placeholder="e.g. If this is an emergency, call 911 or the 988 Suicide & Crisis Lifeline"
          />
        </Section>
      )}

      {activeCategory === "documents" && (
        <Section title="Documents">
          <TextField
            label="Consent Form Link"
            registration={register("consentFormUrl")}
          />
          <TextField
            label="Intake Form Link"
            registration={register("intakeFormUrl")}
          />
          <TextField
            label="Privacy Policy Link"
            registration={register("privacyPolicyUrl")}
          />
          <TextField
            label="HIPAA Notice Link"
            registration={register("hipaaNoticeUrl")}
          />
        </Section>
      )}
    </div>
  );
};
