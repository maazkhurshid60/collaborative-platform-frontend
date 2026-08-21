import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader, MapPin, Search } from "lucide-react";

import { providerProfileApiService } from "../../services/providerProfileApiService";
import NoRecordFound from "../../components/noRecordFound/NoRecordFound";

const SPECIALTY_OPTIONS = [
    "Psychiatry",
    "Psychology",
    "Therapy / Counseling",
    "Social Work",
    "Primary Care",
    "Family Medicine",
    "Internal Medicine",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Obstetrics & Gynecology (OB/GYN)",
    "Nutrition / Dietetics",
    "Physical Therapy",
    "Occupational Therapy",
    "Speech Therapy",
];

interface ProviderSearchResult {
    slug: string;
    fullName: string;
    profileImage: string | null;
    professionalTitle: string | null;
    credentials: string | null;
    specialties: string[];
    city: string | null;
    state: string | null;
    country: string | null;
}

const inputClassName =
    "w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-[14px] bg-white focus:outline-none focus:border-[#2C9993]";

const FindAProvider = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [draft, setDraft] = useState({
        q: searchParams.get("q") ?? "",
        specialty: searchParams.get("specialty") ?? "",
    });

    const filters = {
        q: searchParams.get("q") ?? "",
        specialty: searchParams.get("specialty") ?? "",
    };

    const { data, isLoading } = useQuery<ProviderSearchResult[]>({
        queryKey: ["providerProfile", "publicSearch", filters],
        queryFn: async () => {
            const response = await providerProfileApiService.searchPublic(filters);
            return response?.data ?? [];
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const next = new URLSearchParams();
        if (draft.q) next.set("q", draft.q);
        if (draft.specialty) next.set("specialty", draft.specialty);
        setSearchParams(next);
    };

    const results = data ?? [];

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-[Poppins] px-4 md:px-8 py-10">
            <div className="max-w-[1100px] mx-auto">
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 drop-shadow-sm">
                    <h1 className="text-[26px] font-bold text-[#101828] mb-1">Find a Provider</h1>
                    <p className="text-[14px] text-[#667085] mb-6">
                        Search our network of therapists, psychiatrists, physicians, and more.
                    </p>

                    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            placeholder="Search by name, city, or state"
                            value={draft.q}
                            onChange={(e) => setDraft((prev) => ({ ...prev, q: e.target.value }))}
                            className={`${inputClassName} md:col-span-1`}
                        />
                        <select
                            value={draft.specialty}
                            onChange={(e) => setDraft((prev) => ({ ...prev, specialty: e.target.value }))}
                            className={inputClassName}
                        >
                            <option value="">All Specialties</option>
                            {SPECIALTY_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#2C9993] text-white font-bold text-[14px] hover:bg-[#237c76] transition-all cursor-pointer"
                        >
                            <Search size={16} /> Search
                        </button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader size={30} className="animate-spin text-[#2C9993]" />
                    </div>
                ) : results.length === 0 ? (
                    <NoRecordFound />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((provider) => (
                            <Link
                                key={provider.slug}
                                to={`/p/${provider.slug}`}
                                className="flex flex-col rounded-2xl border border-[#EAEAEA] bg-white p-6 drop-shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-inputBgColor">
                                        {provider.profileImage && (
                                            <img
                                                src={provider.profileImage}
                                                alt={provider.fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-bold text-[#101828]">{provider.fullName}</h3>
                                        {provider.professionalTitle && (
                                            <p className="text-[13px] text-[#667085]">
                                                {provider.professionalTitle}
                                                {provider.credentials ? `, ${provider.credentials}` : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {provider.specialties?.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {provider.specialties.slice(0, 3).map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="rounded-full bg-primaryColorLight text-primaryColorDark px-3 py-1 text-[12px] font-medium"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {(provider.city || provider.state) && (
                                    <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[#667085]">
                                        <MapPin size={14} />
                                        {[provider.city, provider.state].filter(Boolean).join(", ")}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindAProvider;
