import { useState } from "react";
import { CheckCircle, Clock, Lock, Mail, Phone, IdCard, FileText, Crown, Upload } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface VerifStep {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
}

const STEPS: VerifStep[] = [
  {
    key: "email",
    icon: Mail,
    title: "Email Verification",
    description: "Confirm your email address to establish your identity.",
    badge: "Basic",
  },
  {
    key: "phone",
    icon: Phone,
    title: "Phone Verification",
    description: "Add and verify your phone number.",
    badge: "Basic",
  },
  {
    key: "id",
    icon: IdCard,
    title: "National ID Upload",
    description: "Upload a clear photo of your national ID or passport.",
    badge: "Verified",
  },
  {
    key: "license",
    icon: FileText,
    title: "Business License",
    description: "If you're a real estate agent or company, upload your license.",
    badge: "Verified",
  },
  {
    key: "pro",
    icon: Crown,
    title: "Trusted Pro Review",
    description: "Our team reviews your documents for the Trusted Pro badge.",
    badge: "Trusted Pro",
  },
];

type StepStatus = "complete" | "pending" | "locked";

function getStepStatuses(verifStatus: string | null): StepStatus[] {
  if (verifStatus === "approved") return ["complete", "complete", "complete", "complete", "locked"];
  if (verifStatus === "pending")  return ["complete", "complete", "pending", "locked", "locked"];
  return ["complete", "locked", "locked", "locked", "locked"];
}

export function SellerVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: verifData, refetch } = useQuery({
    queryKey: ["verification-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("verification_requests")
        .select("status, full_name, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const verifStatus = verifData?.status ?? null;
  const stepStatuses = getStepStatuses(verifStatus);
  const hasPending = verifStatus === "pending";
  const isApproved = verifStatus === "approved";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        full_name: fullName.trim(),
        national_id: nationalId.trim() || null,
        document_url: documentUrl.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Verification request submitted!", description: "We'll review your documents within 1–2 business days." });
      refetch();
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Verification | IraqProperty Seller"
        description="Get verified as a trusted seller on IraqProperty"
        noIndex
      />

      <div className="px-4 pt-8 pb-12 max-w-2xl mx-auto lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Seller Verification</h1>
          <p className="mt-1 text-sm text-slate-500">Complete these steps to earn trust badges and boost your listings.</p>
        </div>

        {/* Badge Levels */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Basic",       color: "bg-slate-100 text-slate-700 border-slate-200",   icon: "🔘" },
            { label: "Verified",    color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
            { label: "Trusted Pro", color: "bg-amber-50 text-amber-700 border-amber-300",     icon: "⭐" },
          ].map((b) => (
            <div key={b.label} className={`rounded-2xl border p-4 text-center ${b.color}`}>
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-xs font-bold">{b.label}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {STEPS.map((step, idx) => {
            const status = stepStatuses[idx];
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className={`rounded-2xl border p-4 flex items-start gap-4 ${
                  status === "complete" ? "border-emerald-200 bg-emerald-50"
                  : status === "pending" ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    status === "complete" ? "bg-emerald-500 text-white"
                    : status === "pending" ? "bg-amber-400 text-white"
                    : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {status === "complete" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : status === "pending" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold text-sm ${status === "locked" ? "text-slate-400" : "text-slate-800"}`}>
                      {step.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      status === "complete" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {step.badge}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${status === "locked" ? "text-slate-400" : "text-slate-600"}`}>
                    {step.description}
                  </p>
                  {status === "pending" && (
                    <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Under review — 1–2 business days
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submission form (show if not pending/approved) */}
        {!hasPending && !isApproved && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-1">Submit Verification Request</h2>
            <p className="text-sm text-slate-500 mb-5">Provide your details to begin the verified seller process.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As shown on your ID"
                  className="mt-1 rounded-xl border-slate-200"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">National ID Number</Label>
                <Input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Optional — speeds up review"
                  className="mt-1 rounded-xl border-slate-200"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Document URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://... (Google Drive, Dropbox, etc.)"
                    className="rounded-xl border-slate-200 flex-1"
                  />
                  <div className="h-10 w-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <Upload className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">Upload your ID photo to a cloud service and paste the link.</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </form>
          </div>
        )}

        {hasPending && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <Clock className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <h3 className="font-bold text-amber-900">Under Review</h3>
            <p className="text-sm text-amber-700 mt-1">Your documents have been submitted and are being reviewed. We'll notify you by email within 1–2 business days.</p>
          </div>
        )}

        {isApproved && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-emerald-900">You're Verified!</h3>
            <p className="text-sm text-emerald-700 mt-1">Your seller profile is verified. The Verified badge is now shown on all your listings.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default SellerVerificationPage;
