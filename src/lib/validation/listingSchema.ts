import { z } from "zod";

const PROPERTY_KINDS = [
  "house", "apartment", "villa", "land", "commercial", "office", "shop",
] as const;

// URL must be https and point to a known image extension or hosting domain
const imageUrlSchema = z
  .string()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return url.protocol === "https:" && val.length <= 2000;
      } catch {
        return false;
      }
    },
    { message: "Image URL must be a valid https:// link" }
  )
  .optional()
  .or(z.literal(""));

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title too long (max 200 characters)")
    .refine((v) => v.trim().length >= 5, "Title cannot be only whitespace"),

  title_ar: z
    .string()
    .max(200, "Arabic title too long")
    .optional(),

  description: z
    .string()
    .min(20, "Please provide at least 20 characters of description")
    .max(5000, "Description too long (max 5 000 characters)")
    .optional()
    .or(z.literal("")),

  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(1000, "Minimum price is $1,000")
    .max(100_000_000, "Maximum price is $100,000,000"),

  area_m2: z
    .number({ invalid_type_error: "Area must be a number" })
    .min(10, "Minimum area is 10 m²")
    .max(100_000, "Maximum area is 100,000 m²"),

  kind: z.enum(PROPERTY_KINDS, {
    errorMap: () => ({ message: "Please select a valid property type" }),
  }),

  city: z
    .string()
    .min(1, "City is required")
    .max(100),

  district: z
    .string()
    .max(100, "District name too long")
    .optional(),

  bedrooms: z
    .number()
    .int("Bedrooms must be a whole number")
    .min(0)
    .max(50, "Maximum 50 bedrooms")
    .optional(),

  bathrooms: z
    .number()
    .int("Bathrooms must be a whole number")
    .min(0)
    .max(50, "Maximum 50 bathrooms")
    .optional(),

  image_url: imageUrlSchema,
});

export type ListingFormData = z.infer<typeof listingSchema>;

// ── Offer schema ─────────────────────────────────────────────────────────────

export const offerSchema = z.object({
  offer_price: z
    .number({ invalid_type_error: "Offer price must be a number" })
    .min(1000, "Minimum offer is $1,000")
    .max(100_000_000, "Offer exceeds maximum"),

  currency: z.enum(["USD", "IQD"]).default("USD"),

  message: z
    .string()
    .max(1000, "Message too long (max 1 000 characters)")
    .optional(),
});

export type OfferFormData = z.infer<typeof offerSchema>;

// ── Verification submission schema ────────────────────────────────────────────

export const verificationSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(150),

  national_id: z
    .string()
    .regex(/^\d{12}$/, "Iraqi National ID must be exactly 12 digits")
    .optional()
    .or(z.literal("")),

  document_url: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          return url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Document URL must be a valid https:// link" }
    )
    .optional()
    .or(z.literal("")),
});

export type VerificationFormData = z.infer<typeof verificationSchema>;
