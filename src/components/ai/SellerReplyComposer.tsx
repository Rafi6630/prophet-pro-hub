import { useState } from "react";
import {
  Sparkles,
  Copy,
  CheckCheck,
  MessageSquare,
  Languages,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { generateSellerReply, type BuyerInquiry, type SellerReplyDraft } from "@/lib/ai/sellerReply";

interface SellerReplyComposerProps {
  inquiry: BuyerInquiry;
  onSend?: (text: string, lang: "en" | "ar") => void;
}

export function SellerReplyComposer({ inquiry, onSend }: SellerReplyComposerProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");
  const [draft, setDraft] = useState<SellerReplyDraft | null>(null);
  const [editedText, setEditedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    // Simulate a short processing delay for UX
    setTimeout(() => {
      const result = generateSellerReply(inquiry);
      setDraft(result);
      setEditedText(activeLang === "en" ? result.replyEn : result.replyAr);
      setLoading(false);
    }, 600);
  };

  const handleLangSwitch = (lang: "en" | "ar") => {
    setActiveLang(lang);
    if (draft) {
      setEditedText(lang === "en" ? draft.replyEn : draft.replyAr);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onSend?.(editedText, activeLang);
  };

  return (
    <div className="mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white overflow-hidden">
      {/* Toggle header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {isAr ? "مسوّدة رد ذكي للمشتري" : "AI-Drafted Buyer Reply"}
          </p>
          <p className="text-xs text-slate-500">
            {isAr
              ? "رد متوافق وموثوق بالعربية والإنجليزية"
              : "Compliant, trust-first reply in Arabic & English"}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-primary/10 px-4 pb-4 pt-3 space-y-3">
          {/* Original message preview */}
          {inquiry.message && (
            <div className="rounded-xl bg-slate-100 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
                {isAr ? "رسالة المشتري" : "Buyer's message"}
              </p>
              <p className="text-xs text-slate-600 leading-5 line-clamp-3">{inquiry.message}</p>
            </div>
          )}

          {!draft ? (
            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading
                ? (isAr ? "جاري التوليد..." : "Generating…")
                : (isAr ? "توليد مسوّدة رد" : "Generate Reply Draft")}
            </Button>
          ) : (
            <>
              {/* Tone badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                  {isAr ? "نبرة الرد:" : "Tone:"}
                </span>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {isAr ? draft.toneLabelAr : draft.toneLabel}
                </span>
              </div>

              {/* Language toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-0.5 w-fit">
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeLang === "en"
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => handleLangSwitch("en")}
                >
                  <Languages className="h-3 w-3" />
                  English
                </button>
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeLang === "ar"
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => handleLangSwitch("ar")}
                >
                  <Languages className="h-3 w-3" />
                  العربية
                </button>
              </div>

              {/* Editable draft */}
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={10}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />

              {/* Compliance notes */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700"
                  onClick={() => setComplianceOpen((v) => !v)}
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">
                    {isAr ? "ملاحظات الامتثال" : "Compliance Notes"}
                  </span>
                  {complianceOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {complianceOpen && (
                  <ul className="border-t border-amber-200 px-3 pb-2 pt-2 space-y-1.5">
                    {(isAr ? draft.complianceNotesAr : draft.complianceNotes).map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                        <span className="mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-slate-200"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied
                    ? (isAr ? "تم النسخ!" : "Copied!")
                    : (isAr ? "نسخ" : "Copy")}
                </Button>
                {onSend && (
                  <Button size="sm" className="gap-1.5 flex-1" onClick={handleSend}>
                    <MessageSquare className="h-3.5 w-3.5" />
                    {isAr ? "إرسال عبر واتساب" : "Send via WhatsApp"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500"
                  onClick={() => { setDraft(null); setEditedText(""); }}
                >
                  {isAr ? "إعادة توليد" : "Regenerate"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
