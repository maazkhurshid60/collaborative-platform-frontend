import { z } from "zod";

export const providerSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License string is required"),
    age: z.coerce.number().min(0, "Age must be a valid number").max(150, "Age must be at most 150"),
    contactNo: z.string().min(1, "Contact No is required"),
    address: z.string().min(3, "Address is required and should be at least 3 characters"),
    specialty: z.string().min(1, "Specialty is required"),
    otherSpecialty: z.string().optional(),
    email: z.string().email(),
    // country: z.literal("US", { message: "Only United States is supported" }),
    state: z.string().min(1, "State must be selected"),

})
.refine(
    (data) => {
        if (data.specialty === "Other") {
            return !!data.otherSpecialty && data.otherSpecialty.trim().length > 0;
        }
        return true;
    },
    {
        message: "Please write your specialty",
        path: ["otherSpecialty"],
    }
);