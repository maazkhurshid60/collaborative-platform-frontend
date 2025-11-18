import { z } from "zod";

export const providerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License Number is required"),
    age: z.string().min(1, "age is required"),
    contactNo: z.string().min(1, "Contact No is required"),
    address: z.string().min(10, "Address No is required and should not less then 10characters"),
    department: z.string().min(1, "Department No is required"),
    email: z.string().email(),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),

})