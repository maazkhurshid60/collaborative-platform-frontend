import axios from "axios";
import { getApiBaseUrl } from "../../config/api";

const API_BASE_URL = getApiBaseUrl();

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
