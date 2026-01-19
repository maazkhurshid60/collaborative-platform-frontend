import { useEffect, useMemo, useState } from "react";
import {
  fetchSuperAdmin,
  updateSuperAdmin,
  SuperAdminMeResponse,
} from "../../../apiServices/superAdmin/superAdmin";

type InfoItemProps = { label: string; value?: string | number | null };

type FormState = {
  fullName: string;
  licenseNumber: string;
  age: string;
  email: string;
  address: string;
  country: string;
  state: string;
};

export default function SuperAdminMePage() {
  const [data, setData] = useState<SuperAdminMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");


  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    fullName: "",
    licenseNumber: "",
    age: "",
    email: "",
    address: "",
    country: "",
    state: "",
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const result = await fetchSuperAdmin();

        console.log("data", result)
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

  // Sync form from fetched data (so Edit starts with current values)
  useEffect(() => {
    if (!data) return;
    const user: any = data.user ?? {};

    setForm({
      fullName: user.fullName ?? user.name ?? "",
      licenseNumber: user.licenseNumber ?? user.licenseNo ?? "",
      age: user.age != null ? String(user.age) : "",
      email: data.email ?? user.email ?? "",
      address: user.address ?? user.streetAddress ?? "",
      country: user.country ?? "",
      state: user.state ?? user.province ?? "",
    });
  }, [data]);

  function DefaultUserIcon({ className = "" }: { className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
      </svg>
    );
  }

  const user = data?.user ?? {};

  // Read-only mapping for display
  const viewModel = useMemo(() => {
    return {
      fullName: user?.fullName ?? user?.name ?? "—",
      licenseNumber: user?.licenseNumber ?? user?.licenseNo ?? "—",
      age: user?.age ?? "—",
      email: data?.email ?? user?.email ?? "—",
      address: user?.address ?? user?.streetAddress ?? "—",
      country: user?.country ?? "—",
      state: user?.state ?? user?.province ?? "—",
      profileImage: user?.profileImage ?? user?.avatar ?? user?.imageUrl ?? null,
    };
  }, [data, user]);

  async function onSave() {
    if (!data) return;

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const payload = {
        fullName: form.fullName || undefined,
        licenseNumber: form.licenseNumber || undefined,
        age: form.age ? Number(form.age) : undefined,
        address: form.address || undefined,
        country: form.country || undefined,
        state: form.state || undefined,
        email: form.email || undefined,
      };

      const updated = await updateSuperAdmin(data.id, payload);

      setData(updated);
      setEditing(false);
      setSaveSuccess("Profile updated successfully.");
    } catch (e: any) {
      setSaveError(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    setEditing(false);
    setSaveError("");
    setSaveSuccess("");

    // Reset form back to data
    if (!data) return;
    const u: any = data.user ?? {};
    setForm({
      fullName: u.fullName ?? u.name ?? "",
      licenseNumber: u.licenseNumber ?? u.licenseNo ?? "",
      age: u.age != null ? String(u.age) : "",
      email: data.email ?? u.email ?? "",
      address: u.address ?? u.streetAddress ?? "",
      country: u.country ?? "",
      state: u.state ?? u.province ?? "",
    });
  }

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        {/* Title + actions */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">User Profile</h1>

          {!loading && !error && data && (
            <div className="flex items-center gap-3">
              {saveError && <span className="text-xs text-red-600">{saveError}</span>}
              {saveSuccess && <span className="text-xs text-green-600">{saveSuccess}</span>}

              {!editing ? (
                <button
                  onClick={() => {
                    setSaveError("");
                    setSaveSuccess("");
                    setEditing(true);
                  }}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSave}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                </>
              )}
            </div>
          )}
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
              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">
                {editing ? (
                  <>
                    <FormField
                      label="Full Name"
                      value={form.fullName}
                      onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
                    />
                    <FormField
                      label="License Number"
                      value={form.licenseNumber}
                      onChange={(v) => setForm((f) => ({ ...f, licenseNumber: v }))}
                    />
                    <FormField
                      label="Age"
                      value={form.age}
                      type="number"
                      onChange={(v) => setForm((f) => ({ ...f, age: v }))}
                    />
                  </>
                ) : (
                  <>
                    <InfoItem label="Full Name" value={viewModel.fullName} />
                    <InfoItem label="License Number" value={viewModel.licenseNumber} />
                    <InfoItem label="Age" value={viewModel.age} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">
                {editing ? (
                  <>
                    <FormField
                      label="Email"
                      value={form.email}
                      type="email"
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    />
                    <FormField
                      label="Address"
                      value={form.address}
                      onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                    />
                    <FormField
                      label="Country"
                      value={form.country}
                      onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                    />
                  </>
                ) : (
                  <>
                    <InfoItem label="Email" value={viewModel.email} />
                    <InfoItem label="Address" value={viewModel.address} />
                    <InfoItem label="Country" value={viewModel.country} />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-y-8 gap-x-14 md:grid-cols-3">
                {editing ? (
                  <FormField
                    label="State"
                    value={form.state}
                    onChange={(v) => setForm((f) => ({ ...f, state: v }))}
                  />
                ) : (
                  <InfoItem label="State" value={viewModel.state} />
                )}
              </div>

              <div className="pt-2">
                <div className="text-xs text-gray-500">SuperAdmin ID: {data.id}</div>
                <div className="text-xs text-gray-500">User ID: {data.userId}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: InfoItemProps) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div>
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <div className="mt-2 text-base text-gray-500">{display}</div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
