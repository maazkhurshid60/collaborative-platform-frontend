import { z } from "zod";

export const superAdminSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License string is required"),
    age: z.coerce.number().min(7, "Age must be at least 7").max(150, "Age must be at most 150"),
    contactNo: z.string().min(1, "Contact No is required"),
    address: z.string().min(10, "Address is required and should not be less than 10 characters"),
    email: z.string().email(),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    gender: z.string().min(1, "Gender is required"),
});
