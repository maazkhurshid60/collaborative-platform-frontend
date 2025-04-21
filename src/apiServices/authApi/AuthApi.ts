import axios, { AxiosInstance } from "axios";
import { baseUrl } from "../baseUrl/BaseUrl";

interface LoginData {
    email?: string;
    password: string;
}

class AuthService {
    private api: AxiosInstance;
    constructor() {
        this.api = axios.create({
            baseURL: `${baseUrl}/auth`,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    async login(data: LoginData) {

        try {
            const response = await this.api.post("/login", data);
            return response.data;
        } catch (error: unknown) {
            throw error || "Sign up failed";

        }
    }

    async signup(data: unknown) {

        try {
            const response = await this.api.post("/signup", data);
            return response.data;
        } catch (error: unknown) {
            console.log(error);


            throw error || "Sign up failed";

        }
    }


}
// Export a single instance
const authService = new AuthService();
export default authService;

