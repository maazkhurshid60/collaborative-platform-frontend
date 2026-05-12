import { z } from "zod";

const strongPassword = z
  .string()
  .min(10, { message: "Password must be at least 10 characters long" })
  .regex(/[a-z]/, { message: "One sohuld be lower case letter" })
  .regex(/[A-Z]/, { message: "One sohuld be upper case letter" })
  .regex(/[0-9]/, { message: "One sohuld be numeric number" })
  .regex(/[^A-Za-z0-9]/, { message: "One sohuld be special character" });

export const fullNameValidator = z
  .string()
  .trim()
  .min(2, "Enter a valid name")
  .max(80, "Full name must be 80 characters or less.")
  .refine((val) => /^[\p{L}.'-]+(?:\s[\p{L}.'-]+)*$/u.test(val), {
    message:
      "Full name can contain only letters, spaces, hyphens (-), apostrophes ('), and periods (.).",
  });

export const licenseNoValidator = z
  .string()
  .trim()
  .min(1, "License number is required.");

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
    fullName: fullNameValidator,
    gender: z.string().nonempty("Gender is required"),

    state: z.string().nonempty("State must be selected"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    hipaaConsent: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the HIPAA compliance terms to continue." }),
    }),
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
    state: z.string().nonempty("State is required"),
    fullName: fullNameValidator,
    gender: z.string().nonempty("Gender is required"),
    speciality: z.string().min(1, "Speciality is required"),
    otherSpeciality: z.string().optional(),
    licenseNo: licenseNoValidator,
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    hipaaConsent: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the HIPAA compliance terms to continue." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
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
