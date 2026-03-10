import { z } from "zod";

const strongPassword = z
  .string()
  .min(10, { message: "Password must be at least 10 characters long" })
  .regex(/[a-z]/, { message: "One sohuld be lower case letter" })
  .regex(/[A-Z]/, { message: "One sohuld be upper case letter" })
  .regex(/[0-9]/, { message: "One sohuld be numeric number" })
  .regex(/[^A-Za-z0-9]/, { message: "One sohuld be special character" });

// ✅ Put validators FIRST (before schemas that use them)
export const fullNameValidator = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(80, "Full name must be 80 characters or less.")
  .refine((val) => /^[\p{L}.'-]+(?:\s[\p{L}.'-]+)*$/u.test(val), {
    message:
      "Full name can contain only letters, spaces, hyphens (-), apostrophes ('), and periods (.).",
  });

export const licenseNoValidator = z
  .string()
  .trim()
  .min(1, "License number is required.");

// ✅ Schemas AFTER validators
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty("Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const ClientIdSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
});

export const ClientSignupSchema = z
  .object({
    email: z.string().email(),
    fullName: fullNameValidator,      // ✅ use here too (optional but recommended)
    // licenseNo is not needed for clients
    country: z.string().nonempty("Country is required"),
    state: z.string().nonempty("State is required"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

interface ClientIdData {
  clientId?: string;
  licenseNo?: string;
}

export const ProviderSignupSchema = z
  .object({
    email: z.string().email("Email is required"),
    country: z.string().nonempty("Country is required"),
    state: z.string().nonempty("State is required"),
    fullName: fullNameValidator,      // ✅ now no error
    department: z.string().min(1, "Department is required"),
    licenseNo: licenseNoValidator,
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });


export const ChangePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Old Password is required"),
    newPassword: strongPassword,
    confirmPassword: z
      .string()
      .min(1, "Confirm Password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New and Confirm Password must match",
    path: ["confirmPassword"],
  });
