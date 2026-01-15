import { useEffect, useMemo, useState } from "react";
import { fetchSuperAdmin, SuperAdminMeResponse } from "../../../apiServices/superAdmin/superAdmin";

type InfoItemProps = { label: string; value?: string | number | null };

export default function SuperAdminMePage() {
  const [data, setData] = useState<SuperAdminMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const result = await fetchSuperAdmin();
        if (mounted) setData(result);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function DefaultUserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  );
}


  const user = data?.user ?? {};

  // Adjust these mappings to your actual user fields
  const viewModel = useMemo(() => {
    return {
      fullName: user?.fullName ?? user?.name ?? "—",
      licenseNumber: user?.licenseNumber ?? user?.licenseNo ?? "—",
      age: user?.age ?? "—",
      department: user?.department ?? user?.speciality ?? user?.specialty ?? "—",
      email: data?.email ?? user?.email ?? "—",
      contactNumber: user?.contactNumber ?? user?.phone ?? user?.phoneNumber ?? "—",
      address: user?.address ?? user?.streetAddress ?? "—",
      country: user?.country ?? "—",
      state: user?.state ?? user?.province ?? "—",
      profileImage: user?.profileImage ?? user?.avatar ?? user?.imageUrl ?? null,
    };
  }, [data, user]);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">User Profile</h1>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-sm text-gray-600">Loading…</div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="text-sm font-medium text-red-800">Request failed</div>
            <div className="mt-1 text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
            {/* Left: Image */}
            <div>
              <div className="text-sm font-medium text-gray-900">User Image</div>

              <div className="mt-4">
                <div className="h-44 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-sky-200 via-violet-200 to-indigo-200">
                  {viewModel.profileImage ? (
                    <img
                      src={viewModel.profileImage}
                      alt="User"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                          <DefaultUserIcon className="h-14 w-14 text-white/80" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Fields */}
            <div className="space-y-10">
              {/* Top row (3 columns like screenshot) */}
              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">
                <InfoItem label="Full Name" value={viewModel.fullName} />
                <InfoItem label="License Number" value={viewModel.licenseNumber} />
                <InfoItem label="Age" value={viewModel.age} />
              </div>

              {/* Second row */}
              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">
                {/* <InfoItem label="Department" value={viewModel.department} /> */}
                <InfoItem label="Email" value={viewModel.email} />
                {/* <InfoItem label="Contact Number" value={viewModel.contactNumber} /> */}
                <InfoItem label="Address" value={viewModel.address} />
                <InfoItem label="Country" value={viewModel.country} />
              </div>

              {/* Third row */}
              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">

                <InfoItem label="State" value={viewModel.state} />
              </div>

              {/* Optional: keep your existing IDs/timestamps but subdued */}
              <div className="pt-2">
                <div className="text-xs text-gray-500">SuperAdmin ID: {data.id}</div>
                <div className="text-xs text-gray-500">User ID: {data.userId}</div>
              </div>

              {/* Optional: remove this if you want it identical to screenshot */}
              {/* <pre className="overflow-auto rounded-lg border bg-gray-50 p-3 text-xs">
                {JSON.stringify(data, null, 2)}
              </pre> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: InfoItemProps) {
  const display =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div>
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <div className="mt-2 text-base text-gray-500">{display}</div>
    </div>
  );
}
