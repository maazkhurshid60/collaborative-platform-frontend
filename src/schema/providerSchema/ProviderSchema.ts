import { z } from "zod";

export const providerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License string is required"),
    age: z.coerce.number().min(7, "Age must be at least 7").max(150, "Age must be at most 150"),
    contactNo: z.string().min(1, "Contact No is required"),
    address: z.string().min(3, "Address is required and should be at least 3 characters"),
    department: z.string().min(1, "Department No is required"),
    email: z.string().email(),
    country: z.literal("US", { message: "Only United States is supported" }),
    state: z.string().min(1, "State is required"),

})