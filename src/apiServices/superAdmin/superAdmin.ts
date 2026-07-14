import axiosInstance from "../axiosInstance/AxiosInstance";

export type SuperAdminMeResponse = {
  id: string;
  email: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
};

export async function fetchSuperAdmin(): Promise<SuperAdminMeResponse> {
  const res = await axiosInstance.get("/super-admin/first");
  return res.data.data;
}

export async function updateSuperAdmin(
  id: string,
  payload: FormData
): Promise<SuperAdminMeResponse> {
  const res = await axiosInstance.patch(`/super-admin/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
}