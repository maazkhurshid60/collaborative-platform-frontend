import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_RENDER_BASE_URL;

const inviteApiService = {
  inviteProviderSignup: async (payload: { invitationEmail: string; invitedByUserId: string }) => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_BASE_URL}/individual-invites/provider-signup`,
      payload,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      }
    );

    return res.data;
  },
};

export default inviteApiService;
