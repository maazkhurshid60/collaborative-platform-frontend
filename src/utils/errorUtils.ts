import { toast } from "react-toastify";

export const showAPIError = () => {
  (err: any) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.data?.error ||
      "Failed to delete the expired document.";
    toast.error(msg, { position: "bottom-right" });
    return msg;
  };
};
