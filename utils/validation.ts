import { z } from "zod";

// User validation schemas
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Suggestion validation schemas
export const suggestionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["image", "video", "document"]),
}).refine(data => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  return data.file.size <= maxSize;
}, {
  message: "File size must be less than 10MB",
  path: ["file"],
}).refine(data => {
  // Check file type based on the specified type
  if (data.type === "image") {
    return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(data.file.type);
  } else if (data.type === "video") {
    return ["video/mp4", "video/webm", "video/ogg"].includes(data.file.type);
  } else if (data.type === "document") {
    return ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(data.file.type);
  }
  return false;
}, {
  message: "Invalid file type for the selected category",
  path: ["file"],
});

// Admin validation schemas
export const updateUserStatusSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  isApproved: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export const updateSuggestionStatusSchema = z.object({
  suggestionId: z.string().uuid("Invalid suggestion ID"),
  status: z.enum(["pending", "approved", "rejected", "sent"]),
});