import { CheckCircle, Clock, Shield, Star, Mail, Phone, IdCard, FileText, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type VerificationStatus = "unverified" | "pending" | "verified" | "trusted";

interface VerificationBannerProps {
  status: VerificationStatus;
  onStartVerification: () => void;
}

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  key: string;
}

const STEPS: Step[] = [
  { icon: Mail,     label: "Email",   key: "email" },
  { icon: Phone,    label: "Phone",   key: "phone" },
  { icon: IdCard,   label: "ID",      key: "id" },
  { icon: FileText, label: "License", key: "license" },
  { icon: Crown,    label: "Pro",     key: "pro" },
];

function getCompletedSteps(status: VerificationStatus): number {
  switch (status) {
    case "unverified": return 1;
    case "pending":    return 2;
    case "verified":   return 4;
    case "trusted":    return 5;
  }
}

export default function VerificationBanner({
  status,
  onStartVerification,
}: VerificationBannerProps) {
  const completed = getCompletedSteps(status);

  const bannerClass =
    status === "trusted"
      ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50"
      : status === "verified"
      ? "border-emerald-200 bg-emerald-50"
      : status === "pending"
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-slate-50";

  const headlineColor =
    status === "trusted" || status === "verified"
      ? "text-emerald-900"
      : status === "pending"
      ? "text-amber-900"
      : "text-slate-800";

  const subColor =
    status === "trusted" || status === "verified"
      ? "text-emerald-700"
      : status === "pending"
      ? "text-amber-700"
      : "text-slate-600";

  const headline =
    status === "trusted"   ? "You're a Trusted Pro Seller!" :
    status === "verified"  ? "Verified Seller" :
    status === "pending"   ? "Verification In Progress" :
    "Get Verified to Build Trust";

  const subtext =
    status === "trusted"   ? "Your profile has maximum trust level. Enjoy priority placement and the Pro badge." :
    status === "verified"  ? "Your listing shows the Verified badge. Upgrade to Trusted Pro for even more visibility." :
    status === "pending"   ? "Your documents are under review. We'll notify you within 1–2 business days." :
    "Verified sellers get 3× more leads and appear higher in search results.";

  return (
    <div className={`rounded-2xl border p-5 ${bannerClass}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Shield className={`h-6 w-6 shrink-0 mt-0.5 ${status === "trusted" ? "text-emerald-600" : status === "verified" ? "text-emerald-600" : status === "pending" ? "text-amber-600" : "text-slate-500"}`} />
          <div>
            <h3 className={`font-bold ${headlineColor}`}>{headline}</h3>
            <p className={`mt-0.5 text-sm ${subColor}`}>{subtext}</p>
          </div>
        </div>

        {status !== "trusted" && (
          <Button
            onClick={onStartVerification}
            className={`shrink-0 rounded-xl ${
              status === "verified"
                ? "bg-emerald-700 hover:bg-emerald-800"
                : status === "pending"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-slate-800 hover:bg-slate-900"
            } text-white`}
          >
            {status === "verified" ? "Upgrade to Trusted Pro" : status === "pending" ? "View Status" : "Start Verification"}
          </Button>
        )}
      </div>

      {/* Steps progress */}
      <div className="mt-4 flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isDone = idx < completed;
          const isCurrent = idx === completed - 1 && status !== "trusted";
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                    isDone && status === "trusted"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isCurrent
                      ? "bg-amber-400 border-amber-400 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isDone ? "text-emerald-700" : isCurrent ? "text-amber-700" : "text-slate-400"}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 ${idx < completed - 1 ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
