export interface OpenCallPayload {
  appointmentId: string;
  token: string;
  audioOnly?: boolean;
}

export const startCallSession = (payload: OpenCallPayload) => {
  window.dispatchEvent(
    new CustomEvent("open_call_session", {
      detail: payload,
    }),
  );
};

export const startCallFromUrl = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    const appointmentId = parsed.pathname.split("/call/")[1] || "";
    const token = parsed.searchParams.get("token") || "";
    const audioOnly = parsed.searchParams.get("audioOnly") === "true";

    if (appointmentId && token) {
      startCallSession({ appointmentId, token, audioOnly });
    }
  } catch (err) {
    console.error("Failed to parse call URL:", err);
  }
};
