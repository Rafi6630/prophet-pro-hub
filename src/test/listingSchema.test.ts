import { describe, it, expect } from "vitest";
import { listingSchema, offerSchema, verificationSchema } from "@/lib/validation/listingSchema";

describe("listingSchema", () => {
  const valid = {
    title:     "Modern Apartment in Baghdad",
    price:     120_000,
    area_m2:   150,
    kind:      "apartment" as const,
    city:      "Baghdad",
    bedrooms:  3,
    bathrooms: 2,
  };

  it("accepts a valid listing", () => {
    expect(() => listingSchema.parse(valid)).not.toThrow();
  });

  it("rejects title shorter than 5 chars", () => {
    const result = listingSchema.safeParse({ ...valid, title: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects price below $1 000", () => {
    const result = listingSchema.safeParse({ ...valid, price: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects price above $100 M", () => {
    const result = listingSchema.safeParse({ ...valid, price: 200_000_000 });
    expect(result.success).toBe(false);
  });

  it("rejects area_m2 below 10", () => {
    const result = listingSchema.safeParse({ ...valid, area_m2: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects area_m2 above 100 000", () => {
    const result = listingSchema.safeParse({ ...valid, area_m2: 200_000 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid property kind", () => {
    const result = listingSchema.safeParse({ ...valid, kind: "castle" });
    expect(result.success).toBe(false);
  });

  it("rejects empty city", () => {
    const result = listingSchema.safeParse({ ...valid, city: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional description if >= 20 chars", () => {
    const result = listingSchema.safeParse({
      ...valid,
      description: "This is a nice apartment with views.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description shorter than 20 chars", () => {
    const result = listingSchema.safeParse({ ...valid, description: "Short" });
    expect(result.success).toBe(false);
  });

  it("rejects non-https image URL", () => {
    const result = listingSchema.safeParse({
      ...valid,
      image_url: "http://insecure.com/img.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid https image URL", () => {
    const result = listingSchema.safeParse({
      ...valid,
      image_url: "https://cdn.example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });
});

describe("offerSchema", () => {
  it("accepts valid offer", () => {
    const result = offerSchema.safeParse({ offer_price: 90_000 });
    expect(result.success).toBe(true);
  });

  it("rejects offer below $1 000", () => {
    const result = offerSchema.safeParse({ offer_price: 0 });
    expect(result.success).toBe(false);
  });
});

describe("verificationSchema", () => {
  it("accepts valid submission", () => {
    const result = verificationSchema.safeParse({
      full_name:   "Ahmed Al-Karimi",
      national_id: "123456789012",
    });
    expect(result.success).toBe(true);
  });

  it("rejects national_id that is not 12 digits", () => {
    const result = verificationSchema.safeParse({
      full_name:   "Ahmed Al-Karimi",
      national_id: "1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-https document URL", () => {
    const result = verificationSchema.safeParse({
      full_name:    "Ahmed Al-Karimi",
      document_url: "ftp://files.gov.iq/doc.pdf",
    });
    expect(result.success).toBe(false);
  });
});
