import { z } from "zod";

export const providerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License string is required"),
    age: z.coerce.number().min(0, "Age must be a valid number").max(150, "Age must be at most 150"),
    contactNo: z.string().min(1, "Contact No is required"),
    address: z.string().min(3, "Address is required"),
    speciality: z.string().min(1, "Speciality is required"),
    otherSpeciality: z.string().optional(),
    email: z.string().email(),
    gender: z.string().min(1, "Gender is required"),
    // country: z.literal("US", { message: "Only United States is supported" }),
    state: z.string().min(1, "State must be selected"),

})
    .refine(
        (data) => {
            if (data.speciality === "Other") {
                return !!data.otherSpeciality && data.otherSpeciality.trim().length > 0;
            }
            return true;
        },
        {
            message: "Please write your speciality",
            path: ["otherSpeciality"],
        }
    );