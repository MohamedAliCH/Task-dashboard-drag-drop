import { z } from "zod";

// ── Login ────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),

  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

// ── Register ─────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name is too long" })
      .trim(),

    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" })
      .trim(),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Task Form ────────────────────────────────────────────
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title is too long" })
    .trim(),

  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
    invalid_type_error: "Invalid priority value",
  }),

  due: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: "Please enter a valid date" }
    ),
  description: z.string().optional(),
});