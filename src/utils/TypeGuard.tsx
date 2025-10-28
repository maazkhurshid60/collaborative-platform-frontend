import axios, { AxiosError } from "axios";
import { AuthErrorResponse } from "../types/axiosType/AxiosType";

export function isAxiosErrorWithAuthData(error: unknown): error is AxiosError<AuthErrorResponse> {
    return axios.isAxiosError(error) && !!error.response?.data?.data;
}
