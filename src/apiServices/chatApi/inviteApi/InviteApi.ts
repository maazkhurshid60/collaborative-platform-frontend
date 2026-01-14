import axios from "axios";

const inviteApiService = {
  inviteProviderSignup: async (payload: { invitationEmail: string; invitedByUserId: string }) => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:8000/api/v1/individual-invites/provider-signup",
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
