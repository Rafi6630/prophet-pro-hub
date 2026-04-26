import { z } from "zod";

export const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  kind: z.enum(["house", "apartment", "villa", "land", "commercial", "office", "shop"]),
  price: z.number({ invalid_type_error: "Price is required" }).min(1000).max(100_000_000),
  currency: z.enum(["USD", "IQD"]).default("USD"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  address: z.string().optional(),
});

export const step2Schema = z.object({
  area_m2: z.number().min(10).max(100_000),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  parking: z.boolean().default(false),
  furnished: z.boolean().default(false),
  building_age: z.number().int().min(0).max(100).optional(),
  description: z.string().min(10, "Description required").max(5000),
});

export const step3Schema = z.object({
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const step4Schema = z.object({
  legal_status: z.enum(["clear", "disputed", "unknown"]).default("unknown"),
  ownership_confirmed: z.boolean().default(false),
});

export const fullListingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

export type FullListingData = z.infer<typeof fullListingSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
