import { z } from "zod";

export const clientSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "license number is required."),
    age: z.string().min(1, "age is required"),
    contactNo: z.string().min(10, "Contact No is required and not less then 10character").max(20, "Contact No not more then 20character"),
    address: z.string().min(1, "Address No is required and should not less then 10characters"),
    status: z.string().min(1, "Status No is required"),
    email: z.string().email(),
    gender: z.string().min(1, "Gender No is required"),
    // profileImg: z.string().optional()
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),

})
export const accountSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().nonempty().min(1, { message: "license number is required." }),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email(),
    password: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length >= 10,
            { message: "Password is required and should not be less than 10 characters" }
        )
})