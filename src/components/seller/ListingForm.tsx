import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, ChevronLeft, Check, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, fullListingSchema,
  type FullListingData,
} from "@/lib/listingValidation";
import { iraqCities } from "@/data/iraqCities";

const DRAFT_KEY = "listing_draft";

const PROPERTY_KINDS = [
  { value: "house",      label: "House" },
  { value: "apartment",  label: "Apartment" },
  { value: "villa",      label: "Villa" },
  { value: "land",       label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "office",     label: "Office" },
  { value: "shop",       label: "Shop" },
] as const;

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema];

interface StepIndicatorProps {
  currentStep: number;
  total: number;
  labels: string[];
}

function StepIndicator({ currentStep, total, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < currentStep
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : i === currentStep
                  ? "bg-amber-400 border-amber-400 text-amber-900"
                  : "bg-white border-slate-300 text-slate-400"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${i === currentStep ? "text-amber-700" : i < currentStep ? "text-emerald-600" : "text-slate-400"}`}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all ${i < currentStep ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface ListingFormProps {
  initialData?: Partial<FullListingData>;
  onSubmit: (data: FullListingData) => Promise<void>;
  isEditing?: boolean;
}

type PublishOption = "standard" | "featured" | "premium";

export default function ListingForm({ initialData, onSubmit, isEditing = false }: ListingFormProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishOption, setPublishOption] = useState<PublishOption>("standard");
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<FullListingData>({
    resolver: zodResolver(fullListingSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      kind: "apartment",
      price: undefined as unknown as number,
      currency: "USD",
      city: "",
      district: "",
      address: "",
      area_m2: undefined as unknown as number,
      bedrooms: undefined,
      bathrooms: undefined,
      parking: false,
      furnished: false,
      building_age: undefined,
      description: "",
      image_url: "",
      video_url: "",
      legal_status: "unknown",
      ownership_confirmed: false,
      ...initialData,
    },
  });

  const { control, handleSubmit, watch, trigger, formState: { errors } } = form;

  // Autosave draft to localStorage
  useEffect(() => {
    const sub = watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Load draft on mount (only if no initialData)
  useEffect(() => {
    if (!initialData) {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          Object.entries(parsed).forEach(([key, val]) => {
            form.setValue(key as keyof FullListingData, val as never);
          });
        }
      } catch {
        // ignore
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imageUrl = watch("image_url");
  useEffect(() => {
    if (imageUrl && imageUrl.startsWith("http")) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const stepLabels = ["Basic Info", "Specs", "Media", "Publish"];

  const getStepFields = (s: number): (keyof FullListingData)[] => {
    if (s === 0) return ["title", "kind", "price", "currency", "city"];
    if (s === 1) return ["area_m2", "description"];
    if (s === 2) return [];
    return ["legal_status", "ownership_confirmed"];
  };

  async function handleNext() {
    const fields = getStepFields(step);
    const valid = await trigger(fields as (keyof FullListingData)[]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFormSubmit(data: FullListingData) {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      localStorage.removeItem(DRAFT_KEY);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass = "rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400/20";
  const errText = (msg?: string) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <StepIndicator currentStep={step} total={4} labels={stepLabels} />

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">Title *</Label>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Modern Apartment in Mansour" className={`mt-1 ${fieldClass}`} />
              )}
            />
            {errText(errors.title?.message)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-slate-700">Property Type *</Label>
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <select {...field} className={`mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:border-amber-400`}>
                    {PROPERTY_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                )}
              />
              {errText(errors.kind?.message)}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <select {...field} className={`mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:border-amber-400`}>
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (ع.د)</option>
                  </select>
                )}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Price *</Label>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="e.g. 150000"
                  className={`mt-1 ${fieldClass}`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errText(errors.price?.message)}
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">City *</Label>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <select {...field} className={`mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:border-amber-400`}>
                  <option value="">Select city...</option>
                  {iraqCities.map((c) => (
                    <option key={c.id} value={c.nameEn}>{c.nameEn}</option>
                  ))}
                </select>
              )}
            />
            {errText(errors.city?.message)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-slate-700">District</Label>
              <Controller
                control={control}
                name="district"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} placeholder="e.g. Mansour" className={`mt-1 ${fieldClass}`} />
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Address</Label>
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} placeholder="Street address" className={`mt-1 ${fieldClass}`} />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Property Specs */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">Area (m²) *</Label>
            <Controller
              control={control}
              name="area_m2"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="e.g. 120"
                  className={`mt-1 ${fieldClass}`}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
            {errText(errors.area_m2?.message)}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm font-medium text-slate-700">Bedrooms</Label>
              <Controller
                control={control}
                name="bedrooms"
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0} max={20}
                    placeholder="0"
                    className={`mt-1 ${fieldClass}`}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Bathrooms</Label>
              <Controller
                control={control}
                name="bathrooms"
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0} max={20}
                    placeholder="0"
                    className={`mt-1 ${fieldClass}`}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Building Age</Label>
              <Controller
                control={control}
                name="building_age"
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0} max={100}
                    placeholder="yrs"
                    className={`mt-1 ${fieldClass}`}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Controller
              control={control}
              name="parking"
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500"
                  />
                  <span className="text-sm text-slate-700">Parking</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="furnished"
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500"
                  />
                  <span className="text-sm text-slate-700">Furnished</span>
                </label>
              )}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Description *</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Describe the property in detail..."
                  className={`mt-1 min-h-[120px] ${fieldClass}`}
                />
              )}
            />
            {errText(errors.description?.message)}
          </div>
        </div>
      )}

      {/* Step 3: Media */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">Cover Image URL</Label>
            <Controller
              control={control}
              name="image_url"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://..."
                  className={`mt-1 ${fieldClass}`}
                />
              )}
            />
            {errText(errors.image_url?.message)}
          </div>

          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-slate-200 h-48">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImagePreview("")}
              />
            </div>
          )}

          {!imagePreview && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Image className="h-10 w-10" />
              <p className="text-sm">Enter an image URL above to preview</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-slate-700">Video Tour URL (optional)</Label>
            <Controller
              control={control}
              name="video_url"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="https://youtube.com/..."
                  className={`mt-1 ${fieldClass}`}
                />
              )}
            />
            {errText(errors.video_url?.message)}
          </div>
        </div>
      )}

      {/* Step 4: Trust & Publish */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-medium text-slate-700">Legal Status</Label>
            <Controller
              control={control}
              name="legal_status"
              render={({ field }) => (
                <select {...field} className={`mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:border-amber-400`}>
                  <option value="unknown">Unknown</option>
                  <option value="clear">Clear Title</option>
                  <option value="disputed">Disputed</option>
                </select>
              )}
            />
          </div>

          <Controller
            control={control}
            name="ownership_confirmed"
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-amber-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">I confirm ownership</p>
                  <p className="text-xs text-slate-500 mt-0.5">I confirm that I am the owner or authorized agent for this property.</p>
                </div>
              </label>
            )}
          />

          {/* Publish options */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Listing Placement</p>
            <div className="space-y-2">
              {[
                { value: "standard" as const, label: "Standard", desc: "Free — appears in regular search results", price: "Free" },
                { value: "featured" as const, label: "Featured", desc: "Highlighted in search with Featured badge", price: "$9/week", pro: true },
                { value: "premium" as const, label: "Premium", desc: "Top placement + Homepage spotlight", price: "$19/week", pro: true },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    publishOption === opt.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="publishOption"
                      value={opt.value}
                      checked={publishOption === opt.value}
                      onChange={() => setPublishOption(opt.value)}
                      className="text-amber-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${opt.pro ? "text-amber-600" : "text-emerald-600"}`}>
                    {opt.price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl gap-1"
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            type="button"
            className="rounded-xl gap-1 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleNext}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditing ? "Saving..." : "Publishing..."}
              </span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {isEditing ? "Save Changes" : "Publish Listing"}
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
