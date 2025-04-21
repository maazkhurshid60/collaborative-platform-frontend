import { z } from "zod";

export const providerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    cnic: z.string().min(10, "CNIC is required"),
    age: z.string().min(1, "age is required"),
    contact: z.string().min(1, "Contact No is required"),
    address: z.string().min(1, "Address No is required"),
    department: z.string().min(1, "Department No is required"),
    email: z.string().email(),

})