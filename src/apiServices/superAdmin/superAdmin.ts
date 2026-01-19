export type SuperAdminMeResponse = {
  id: string;
  email: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: any; // replace with your real User type if you want
};

export type UpdateSuperAdminPayload = {
  fullName?: string;
  licenseNumber?: string;
  age?: number;
  address?: string;
  country?: string;
  state?: string;
  email?: string; 
};

export async function fetchSuperAdmin(): Promise<SuperAdminMeResponse> {
  // Read the token from localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found in localStorage");
  }

  const res = await fetch(
    `${import.meta.env.VITE_LOCAL_BASE_URL}/super-admin/first`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Change this line if your backend expects a different header name/value
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    // Optional: add better error handling/logging here
    throw new Error(`Failed to fetch super admin: ${res.status}`);
  }

  const json = await res.json();
  return json.data as SuperAdminMeResponse;
}



export async function updateSuperAdmin(
  id: string,
  payload: UpdateSuperAdminPayload
): Promise<SuperAdminMeResponse> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token found in localStorage");
  }

  const res = await fetch(
    `${import.meta.env.VITE_LOCAL_BASE_URL}/super-admin/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    // Backend returns 400 for "No fields provided" and 404 for "not found"
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to update super admin: ${res.status} ${
        text || res.statusText
      }`.trim()
    );
  }

  const json = await res.json();
  return json.data as SuperAdminMeResponse;
}