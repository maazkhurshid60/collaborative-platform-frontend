export interface ProfileFormState {
  slug: string;
  isPublished: boolean;
  professionalTitle: string;
  credentials: string;
  yearsOfExperience: string;
  shortIntroduction: string;
  aboutMe: string;
  professionalPhilosophy: string;
  whyIDoThisWork: string;
  specialties: string[];
  conditionsTreated: string[];
  areasOfExpertise: string[];
  services: string[];
  clientFocus: string[];
  treatmentApproaches: string[];
  languages: string[];
  acceptingNewPatients: boolean;
  allowQueries: boolean;
  offersOnlineSessions: boolean;
  offersInPersonSessions: boolean;
  offersHomeVisits: boolean;
  officeHours: string;
  previousOrganizations: string[];
  clinicalExperience: string;
  websiteUrl: string;
  introVideoUrl: string;
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  education: Record<string, unknown>[];
  licenses: Record<string, unknown>[];
  locations: Record<string, unknown>[];
  memberships: Record<string, unknown>[];
  awards: Record<string, unknown>[];
  clinicPhotos: string[];
  certificates: string[];
  consultationFee: string;
  followUpFee: string;
  slidingScale: boolean;
  paymentMethods: string[];
  insuranceAccepted: string[];
  emergencyContactInstructions: string;
  crisisResources: string;
  consentFormUrl: string;
  intakeFormUrl: string;
  privacyPolicyUrl: string;
  hipaaNoticeUrl: string;
  identityVerified: boolean;
  backgroundChecked: boolean;
  licenseVerified: boolean;
  completenessPercent: number;
}

export const emptyState: ProfileFormState = {
  slug: "",
  isPublished: false,
  professionalTitle: "",
  credentials: "",
  yearsOfExperience: "",
  shortIntroduction: "",
  aboutMe: "",
  professionalPhilosophy: "",
  whyIDoThisWork: "",
  specialties: [],
  conditionsTreated: [],
  areasOfExpertise: [],
  services: [],
  clientFocus: [],
  treatmentApproaches: [],
  languages: [],
  acceptingNewPatients: true,
  allowQueries: true,
  offersOnlineSessions: false,
  offersInPersonSessions: false,
  offersHomeVisits: false,
  officeHours: "",
  previousOrganizations: [],
  clinicalExperience: "",
  websiteUrl: "",
  introVideoUrl: "",
  socialLinks: {},
  education: [],
  licenses: [],
  locations: [],
  memberships: [],
  awards: [],
  clinicPhotos: [],
  certificates: [],
  consultationFee: "",
  followUpFee: "",
  slidingScale: false,
  paymentMethods: [],
  insuranceAccepted: [],
  emergencyContactInstructions: "",
  crisisResources: "",
  consentFormUrl: "",
  intakeFormUrl: "",
  privacyPolicyUrl: "",
  hipaaNoticeUrl: "",
  identityVerified: false,
  backgroundChecked: false,
  licenseVerified: false,
  completenessPercent: 0,
};

export type ProviderProfileApiResponse = Omit<
  ProfileFormState,
  "yearsOfExperience" | "consultationFee" | "followUpFee"
> & {
  yearsOfExperience?: number | null;
  consultationFee?: number | null;
  followUpFee?: number | null;
};

export const toFormState = (
  profile: Partial<ProviderProfileApiResponse> | undefined,
): ProfileFormState => ({
  ...emptyState,
  ...profile,
  slug: profile?.slug ?? "",
  professionalTitle: profile?.professionalTitle ?? "",
  credentials: profile?.credentials ?? "",
  shortIntroduction: profile?.shortIntroduction ?? "",
  aboutMe: profile?.aboutMe ?? "",
  professionalPhilosophy: profile?.professionalPhilosophy ?? "",
  whyIDoThisWork: profile?.whyIDoThisWork ?? "",
  officeHours: profile?.officeHours ?? "",
  clinicalExperience: profile?.clinicalExperience ?? "",
  websiteUrl: profile?.websiteUrl ?? "",
  introVideoUrl: profile?.introVideoUrl ?? "",
  emergencyContactInstructions: profile?.emergencyContactInstructions ?? "",
  crisisResources: profile?.crisisResources ?? "",
  consentFormUrl: profile?.consentFormUrl ?? "",
  intakeFormUrl: profile?.intakeFormUrl ?? "",
  privacyPolicyUrl: profile?.privacyPolicyUrl ?? "",
  hipaaNoticeUrl: profile?.hipaaNoticeUrl ?? "",
  yearsOfExperience: profile?.yearsOfExperience?.toString() ?? "",
  consultationFee: profile?.consultationFee?.toString() ?? "",
  followUpFee: profile?.followUpFee?.toString() ?? "",
  socialLinks: profile?.socialLinks ?? {},
  previousOrganizations: profile?.previousOrganizations ?? [],
  education: profile?.education ?? [],
  licenses: profile?.licenses ?? [],
  locations: profile?.locations ?? [],
  memberships: profile?.memberships ?? [],
  awards: profile?.awards ?? [],
  identityVerified: profile?.identityVerified ?? false,
  backgroundChecked: profile?.backgroundChecked ?? false,
  allowQueries: profile?.allowQueries ?? true,
  completenessPercent: profile?.completenessPercent ?? 0,
});

export const availabilityToggles: { key: keyof ProfileFormState; label: string }[] = [
  { key: "acceptingNewPatients", label: "Accepting New Patients" },
  { key: "allowQueries", label: "Allow Public Queries" },
  { key: "offersOnlineSessions", label: "Online Sessions" },
  { key: "offersInPersonSessions", label: "In-Person Sessions" },
  { key: "offersHomeVisits", label: "Home Visits" },
];

export const CATEGORIES = [
  { key: "basic", label: "Basic Information" },
  { key: "summary", label: "Professional Summary" },
  { key: "specialties", label: "Specialties & Focus" },
  { key: "availability", label: "Availability" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "licenses", label: "Licenses & Certifications" },
  { key: "locations", label: "Locations" },
  { key: "fees", label: "Fees & Insurance" },
  { key: "memberships", label: "Professional Memberships" },
  { key: "awards", label: "Awards & Recognition" },
  { key: "media", label: "Media" },
  { key: "web", label: "Web Presence" },
  { key: "emergency", label: "Emergency Information" },
  { key: "documents", label: "Documents" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
