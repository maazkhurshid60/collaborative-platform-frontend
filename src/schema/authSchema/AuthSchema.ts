import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z
        .string({ required_error: "Password is required" })
        .nonempty("Password is required")
        .min(10, "Password should not be less than 10 characters"),
})



export const LicenseNoSchema = z.object({
    licenseNo: z.string().min(1, "License number is required."),
})





export const ClientSignupSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(12, "License number is required and should not less then 12 characters"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
});


export const ProviderSignupSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1, "Full Name is required"),
    department: z.string().min(1, "Department is required"),
    password: z.string().min(10, "Password is required and should not less then 10 characters"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    licenseNo: z.string().min(12, "License number is required and should not less then 12 characters"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
});

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(10, "Old Password is required and should not less then 10 characters"),
    newPassword: z.string().min(10, "New Password is required and should not less then 10 characters"),
    confirmPassword: z.string().min(10, "Confirm Password is required and should not less then 10 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New and Confirm Password must matched",
    path: ["confirmPassword"]
})
