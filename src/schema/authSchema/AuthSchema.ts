import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
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
  .min(6, "License number must be at least 6 characters.")
  .max(50, "License number must be 50 characters or less.")
  .refine((val) => /[A-Za-z]/.test(val), {
    message: "License number must include at least one letter.",
  })
  .refine((val) => /\d/.test(val), {
    message: "License number must include at least one number.",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "License number must include at least one special character.",
  });

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

export const LicenseNoSchema = z.object({
  licenseNo: licenseNoValidator,
});

export const ClientSignupSchema = z
  .object({
    email: z.string().email(),
    fullName: fullNameValidator,      // ✅ use here too (optional but recommended)
    licenseNo: licenseNoValidator,
    country: z.string().nonempty("Country is required"),
    state: z.string().nonempty("State is required"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const ProviderSignupSchema = z
  .object({
    email: z.string().email(),
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
