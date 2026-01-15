
export type SuperAdminMeResponse = {
  id: string;
  email: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: any; // replace with your real User type if you want
};

export async function fetchSuperAdmin() {
  const res = await fetch(`${import.meta.env.VITE_LOCAL_BASE_URL}/super-admin/first`);
  const json = await res.json();
  return json.data;
}

