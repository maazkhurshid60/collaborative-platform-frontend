import { z } from "zod";

const strongPassword = z
    .string()
    .min(8, { message: "Minimum password length should be 8 charcters" })
    .regex(/[a-z]/, { message: "One sohuld be lower case letter" })
    .regex(/[A-Z]/, { message: "One sohuld be upper case letter" })
    .regex(/[0-9]/, { message: "One sohuld be numeric number" })
    .regex(/[^A-Za-z0-9]/, { message: "One sohuld be special character" });

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .nonempty("Password is required"),
})
export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
})
export const ResetPasswordSchema = z.object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
});



export const LicenseNoSchema = z.object({
    licenseNo: z.string().min(1, "License number is required."),
})





export const ClientSignupSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1, "Full Name is required"),
    licenseNo: z.string().min(1, "License number is required"),
    country: z.string().nonempty("Country is required"),
    state: z.string().nonempty("State is required"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
});


export const ProviderSignupSchema = z.object({
    email: z.string().email(),
    country: z.string().nonempty("Country is required"),
    state: z.string().nonempty("State is required"),
    fullName: z.string().min(1, "Full Name is required"),
    department: z.string().min(1, "Department is required"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    licenseNo: z.string().min(1, "License number is required."),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Error will be associated with confirmPassword field
});

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(10, "Old Password is required and should not less then 10 characters"),
    newPassword: strongPassword,
    confirmPassword: z.string().min(10, "Confirm Password is required and should not less then 10 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New and Confirm Password must matched",
    path: ["confirmPassword"]
}
)