import { z } from "zod";

export const clientSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    cnic: z.string().min(10, "CNIC is required"),
    age: z.string().min(1, "age is required"),
    contact: z.string().min(1, "Contact No is required"),
    address: z.string().min(1, "Address No is required"),
    status: z.string().min(1, "Status No is required"),
    email: z.string().email(),
    // profileImg: z.string().optional()

})
export const accountSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    cnic: z.string().min(10, "CNIC is required"),

    email: z.string().email(),
    password: z.string().min(10, "Password is required and should not less then 10characters"),

})