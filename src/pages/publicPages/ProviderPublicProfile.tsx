import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, ExternalLink, FileText, Globe, Loader, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { providerProfileApiService } from "../../services/providerProfileApiService";

interface EducationEntry {
    degree?: string;
    university?: string;
    graduationYear?: string;
}

interface LicenseEntry {
    licenseType?: string;
    licenseNumber?: string;
    state?: string;
    country?: string;
}

interface LocationEntry {
    clinicName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number | string;
    longitude?: number | string;
}

interface MembershipEntry {
    organization?: string;
    membershipType?: string;
}

interface AwardEntry {
    title?: string;
    type?: string;
    year?: string;
    url?: string;
}

interface PublicProviderProfile {
    fullName: string;
    profileImage?: string;
    isVerified?: boolean;
    professionalTitle?: string;
    credentials?: string;
    shortIntroduction?: string;
    state?: string;
    country?: string;
    contactNo?: string;
    websiteUrl?: string;
    yearsOfExperience?: number;
    acceptingNewPatients?: boolean;
    aboutMe?: string;
    professionalPhilosophy?: string;
    whyIDoThisWork?: string;
    specialties?: string[];
    conditionsTreated?: string[];
    areasOfExpertise?: string[];
    services?: string[];
    clientFocus?: string[];
    treatmentApproaches?: string[];
    languages?: string[];
    offersOnlineSessions?: boolean;
    offersInPersonSessions?: boolean;
    offersHomeVisits?: boolean;
    officeHours?: string;
    previousOrganizations?: string[];
    clinicalExperience?: string;
    locations?: LocationEntry[];
    consultationFee?: number;
    followUpFee?: number;
    slidingScale?: boolean;
    insuranceAccepted?: string[];
    paymentMethods?: string[];
    education?: EducationEntry[];
    licenses?: LicenseEntry[];
    memberships?: MembershipEntry[];
    awards?: AwardEntry[];
    clinicPhotos?: string[];
    introVideoUrl?: string;
    email?: string;
    socialLinks?: { linkedin?: string; facebook?: string; instagram?: string; twitter?: string };
    emergencyContactInstructions?: string;
    crisisResources?: string;
    consentFormUrl?: string;
    intakeFormUrl?: string;
    privacyPolicyUrl?: string;
    hipaaNoticeUrl?: string;
    identityVerified?: boolean;
    backgroundChecked?: boolean;
    licenseVerified?: boolean;
}

const TagRow = ({ label, values }: { label: string; values?: string[] }) => {
    if (!values || values.length === 0) return null;
    return (
        <div className="mb-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-2">{label}</h3>
            <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                    <span key={value} className="bg-primaryColorLight text-primaryColorDark text-[13px] px-3 py-1 rounded-full">
                        {value}
                    </span>
                ))}
            </div>
        </div>
    );
};

const TextBlock = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className="mb-5">
            <h3 className="text-[14px] font-semibold text-[#101828] mb-2">{label}</h3>
            <p className="text-[14px] text-[#475467] whitespace-pre-line">{value}</p>
        </div>
    );
};

const ProviderPublicProfile = () => {
    const { slug } = useParams<{ slug: string }>();

    const { data: profile, isLoading, isError } = useQuery<PublicProviderProfile>({
        queryKey: ["providerProfile", "public", slug],
        queryFn: async () => {
            const response = await providerProfileApiService.getPublicProfile(slug as string);
            return response?.data;
        },
        enabled: Boolean(slug),
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
                <Loader size={30} className="animate-spin text-[#2C9993]" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] font-[Poppins] px-6 text-center">
                <h1 className="text-[28px] font-bold text-[#101828] mb-2">Profile Not Found</h1>
                <p className="text-[16px] text-[#667085]">This provider profile doesn't exist or isn't public yet.</p>
            </div>
        );
    }

    const hasLocations = profile.locations && profile.locations.length > 0;
    const hasEducation = profile.education && profile.education.length > 0;
    const hasLicenses = profile.licenses && profile.licenses.length > 0;
    const hasMemberships = profile.memberships && profile.memberships.length > 0;
    const hasAwards = profile.awards && profile.awards.length > 0;

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins] px-4 md:px-8 py-10">
            <div className="max-w-[900px] mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <img
                        src={profile.profileImage || "/assets/logo.png"}
                        alt={profile.fullName}
                        className="w-24 h-24 rounded-full object-cover bg-inputBgColor"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[26px] font-bold text-[#101828]">{profile.fullName}</h1>
                            {profile.isVerified && (
                                <span className="flex items-center gap-1 text-[#2C9993] text-[13px] font-medium">
                                    <BadgeCheck size={16} /> Verified
                                </span>
                            )}
                        </div>

                        {(profile.identityVerified || profile.backgroundChecked || profile.licenseVerified) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.licenseVerified && (
                                    <span className="flex items-center gap-1 bg-[#ECFDF5] text-[#059669] text-[12px] font-medium px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                                        <ShieldCheck size={12} /> License Verified
                                    </span>
                                )}
                                {profile.identityVerified && (
                                    <span className="flex items-center gap-1 bg-[#ECFDF5] text-[#059669] text-[12px] font-medium px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                                        <ShieldCheck size={12} /> Identity Verified
                                    </span>
                                )}
                                {profile.backgroundChecked && (
                                    <span className="flex items-center gap-1 bg-[#ECFDF5] text-[#059669] text-[12px] font-medium px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                                        <ShieldCheck size={12} /> Background Checked
                                    </span>
                                )}
                            </div>
                        )}
                        {profile.professionalTitle && (
                            <p className="text-[16px] text-[#475467] mt-1">
                                {profile.professionalTitle}
                                {profile.credentials ? `, ${profile.credentials}` : ""}
                            </p>
                        )}
                        {profile.shortIntroduction && (
                            <p className="text-[14px] text-[#667085] mt-2">{profile.shortIntroduction}</p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-4 text-[13px] text-[#667085]">
                            {(profile.state || profile.country) && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} /> {[profile.state, profile.country].filter(Boolean).join(", ")}
                                </span>
                            )}
                            {profile.contactNo && (
                                <span className="flex items-center gap-1">
                                    <Phone size={14} /> {profile.contactNo}
                                </span>
                            )}
                            {profile.websiteUrl && (
                                <a
                                    href={profile.websiteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-[#2C9993] hover:underline"
                                >
                                    <Globe size={14} /> Website
                                </a>
                            )}
                        </div>

                        {typeof profile.yearsOfExperience === "number" && profile.yearsOfExperience > 0 && (
                            <p className="text-[13px] text-[#667085] mt-2">{profile.yearsOfExperience} years of experience</p>
                        )}

                        {profile.acceptingNewPatients && (
                            <span className="inline-block mt-3 bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-[13px] font-medium border border-[#A7F3D0]">
                                Accepting New Patients
                            </span>
                        )}
                    </div>
                </div>

                {/* About */}
                {(profile.aboutMe || profile.professionalPhilosophy || profile.whyIDoThisWork) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <TextBlock label="About Me" value={profile.aboutMe} />
                        <TextBlock label="Professional Philosophy" value={profile.professionalPhilosophy} />
                        <TextBlock label="Why I Do This Work" value={profile.whyIDoThisWork} />
                    </div>
                )}

                {/* Specialties */}
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                    <TagRow label="Specialties" values={profile.specialties} />
                    <TagRow label="Conditions Treated" values={profile.conditionsTreated} />
                    <TagRow label="Areas of Expertise" values={profile.areasOfExpertise} />
                    <TagRow label="Services" values={profile.services} />
                    <TagRow label="Client Focus" values={profile.clientFocus} />
                    <TagRow label="Treatment Approaches" values={profile.treatmentApproaches} />
                    <TagRow label="Languages" values={profile.languages} />
                </div>

                {/* Availability */}
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#101828] mb-4">Session Options</h2>
                    <div className="flex flex-wrap gap-2">
                        {profile.offersOnlineSessions && (
                            <span className="bg-inputBgColor text-[13px] px-3 py-1 rounded-full">Online Sessions</span>
                        )}
                        {profile.offersInPersonSessions && (
                            <span className="bg-inputBgColor text-[13px] px-3 py-1 rounded-full">In-Person Sessions</span>
                        )}
                        {profile.offersHomeVisits && (
                            <span className="bg-inputBgColor text-[13px] px-3 py-1 rounded-full">Home Visits</span>
                        )}
                    </div>
                    {profile.officeHours && (
                        <p className="text-[13px] text-[#667085] mt-3">Office Hours: {profile.officeHours}</p>
                    )}
                </div>

                {((profile.previousOrganizations?.length ?? 0) > 0 || profile.clinicalExperience) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Experience</h2>
                        <TagRow label="Previous Organizations" values={profile.previousOrganizations} />
                        <TextBlock label="Clinical Experience" value={profile.clinicalExperience} />
                    </div>
                )}

                {hasLocations && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Locations</h2>
                        <div className="flex flex-col gap-3">
                            {(profile.locations ?? []).map((loc: LocationEntry, i: number) => {
                                const addressLine = [loc.address, loc.city, loc.state, loc.country].filter(Boolean).join(", ");
                                const mapQuery = loc.latitude && loc.longitude ? `${loc.latitude},${loc.longitude}` : addressLine;
                                const mapUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null;
                                return (
                                    <div key={i} className="bg-inputBgColor rounded-lg p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[14px] font-semibold text-[#101828]">{loc.clinicName}</p>
                                            <p className="text-[13px] text-[#667085]">{addressLine}</p>
                                        </div>
                                        {mapUrl && (
                                            <a
                                                href={mapUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-[#2C9993] text-[13px] hover:underline shrink-0"
                                            >
                                                <MapPin size={14} /> View on Map
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(profile.consultationFee || profile.followUpFee || (profile.insuranceAccepted && profile.insuranceAccepted.length > 0)) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Fees & Insurance</h2>
                        <div className="flex flex-wrap gap-6 mb-4">
                            {profile.consultationFee && (
                                <div>
                                    <span className="block text-[12px] text-[#667085]">Consultation Fee</span>
                                    <span className="text-[16px] font-bold text-[#101828]">${profile.consultationFee}</span>
                                </div>
                            )}
                            {profile.followUpFee && (
                                <div>
                                    <span className="block text-[12px] text-[#667085]">Follow-up Fee</span>
                                    <span className="text-[16px] font-bold text-[#101828]">${profile.followUpFee}</span>
                                </div>
                            )}
                            {profile.slidingScale && (
                                <span className="bg-[#ECFDF5] text-[#059669] px-3 py-1 h-fit rounded-full text-[13px] font-medium border border-[#A7F3D0]">
                                    Sliding Scale Available
                                </span>
                            )}
                        </div>
                        <TagRow label="Insurance Accepted" values={profile.insuranceAccepted} />
                        <TagRow label="Payment Methods" values={profile.paymentMethods} />
                    </div>
                )}

                {hasEducation && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Education</h2>
                        <ul className="flex flex-col gap-2">
                            {(profile.education ?? []).map((edu: EducationEntry, i: number) => (
                                <li key={i} className="text-[14px] text-[#475467]">
                                    {edu.degree} — {edu.university} {edu.graduationYear ? `(${edu.graduationYear})` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasLicenses && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Licenses & Certifications</h2>
                        <ul className="flex flex-col gap-2">
                            {(profile.licenses ?? []).map((lic: LicenseEntry, i: number) => (
                                <li key={i} className="text-[14px] text-[#475467]">
                                    {lic.licenseType} — {lic.licenseNumber} ({[lic.state, lic.country].filter(Boolean).join(", ")})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasMemberships && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Professional Memberships</h2>
                        <ul className="flex flex-col gap-2">
                            {(profile.memberships ?? []).map((m: MembershipEntry, i: number) => (
                                <li key={i} className="text-[14px] text-[#475467]">
                                    {m.organization} {m.membershipType ? `— ${m.membershipType}` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasAwards && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Awards & Recognition</h2>
                        <ul className="flex flex-col gap-2">
                            {(profile.awards ?? []).map((a: AwardEntry, i: number) => (
                                <li key={i} className="text-[14px] text-[#475467]">
                                    {a.title} {a.year ? `(${a.year})` : ""} {a.type ? `— ${a.type}` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {((profile.clinicPhotos?.length ?? 0) > 0 || profile.introVideoUrl) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Media</h2>
                        {(profile.clinicPhotos?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-3 mb-4">
                                {(profile.clinicPhotos ?? []).map((url: string, i: number) => (
                                    <img key={i} src={url} alt="Clinic" className="w-32 h-32 object-cover rounded-lg bg-inputBgColor" />
                                ))}
                            </div>
                        )}
                        {profile.introVideoUrl && (
                            <a href={profile.introVideoUrl} target="_blank" rel="noreferrer" className="text-[#2C9993] text-[14px] hover:underline">
                                Watch Introduction Video
                            </a>
                        )}
                    </div>
                )}

                {(profile.emergencyContactInstructions || profile.crisisResources) && (
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-6 md:p-8 mb-6">
                        <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#78350F] mb-4">
                            <AlertTriangle size={20} className="text-[#D97706]" /> Emergency Information
                        </h2>
                        {profile.emergencyContactInstructions && (
                            <p className="text-[14px] text-[#78350F] whitespace-pre-line mb-3">{profile.emergencyContactInstructions}</p>
                        )}
                        {profile.crisisResources && (
                            <p className="text-[14px] text-[#78350F] whitespace-pre-line">{profile.crisisResources}</p>
                        )}
                    </div>
                )}

                {(profile.consentFormUrl || profile.intakeFormUrl || profile.privacyPolicyUrl || profile.hipaaNoticeUrl) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Documents</h2>
                        <div className="flex flex-col gap-2">
                            {profile.consentFormUrl && (
                                <a href={profile.consentFormUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#2C9993] text-[14px] hover:underline">
                                    <FileText size={16} /> Consent Form <ExternalLink size={12} />
                                </a>
                            )}
                            {profile.intakeFormUrl && (
                                <a href={profile.intakeFormUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#2C9993] text-[14px] hover:underline">
                                    <FileText size={16} /> Intake Form <ExternalLink size={12} />
                                </a>
                            )}
                            {profile.privacyPolicyUrl && (
                                <a href={profile.privacyPolicyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#2C9993] text-[14px] hover:underline">
                                    <FileText size={16} /> Privacy Policy <ExternalLink size={12} />
                                </a>
                            )}
                            {profile.hipaaNoticeUrl && (
                                <a href={profile.hipaaNoticeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#2C9993] text-[14px] hover:underline">
                                    <FileText size={16} /> HIPAA Notice <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {(profile.email || Object.values(profile.socialLinks || {}).some(Boolean)) && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 drop-shadow-sm">
                        <h2 className="text-[18px] font-bold text-[#101828] mb-4">Contact</h2>
                        <div className="flex flex-wrap gap-4">
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-[#2C9993] text-[14px]">
                                    <Mail size={16} /> {profile.email}
                                </a>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-[#2C9993] text-[14px] hover:underline">
                                    LinkedIn
                                </a>
                            )}
                            {profile.socialLinks?.facebook && (
                                <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-[#2C9993] text-[14px] hover:underline">
                                    Facebook
                                </a>
                            )}
                            {profile.socialLinks?.instagram && (
                                <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-[#2C9993] text-[14px] hover:underline">
                                    Instagram
                                </a>
                            )}
                            {profile.socialLinks?.twitter && (
                                <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-[#2C9993] text-[14px] hover:underline">
                                    Twitter / X
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderPublicProfile;
