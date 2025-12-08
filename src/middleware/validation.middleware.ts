import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(["user", "admin"]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().optional(),
  biography: z.string().optional(),
  interest: z.string().optional(),
});
export const userUpdateSchema = userSchema.partial();

export const jobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  jobType: z.string().optional(),
  experience: z.string().optional(),
  education: z.string(),
  languages: z.array(z.string()).optional(),
  shortDescription: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  salary: z.string().optional(),
  postedOn: z.string().optional(),
  publishedTime: z.string().optional(),
});

export const favoriteSchema = z.object({
  userId: z.string(),
  jobId: z.string(),
  savedAt: z.date().optional(),
});
