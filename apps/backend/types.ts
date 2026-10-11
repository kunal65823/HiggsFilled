
import { z } from "zod";

export const CreateuserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SigninuserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

export const AvtarSchema = z.object({
  image: z.string().url("Please provide a valid image URL"),
});
