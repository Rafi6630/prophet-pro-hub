import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, TrendingUp } from "lucide-react";
import { SearchResultsPage } from "./SearchResultsPage";

export function DealPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.language === "ku" || i18n.language === "ckb";
  const tab = searchParams.get("tab") === "investment" ? "investment" : "buy";

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "investment") next.set("tab", "investment");
    else next.delete("tab");
    setSearchParams(next, { replace: true });
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="fixed inset-x-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm" style={{ top: 76 }}>
        <div className="container mx-auto flex gap-1 px-4 py-2">
          <button
            onClick={() => handleTabChange("buy")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "buy"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/60 hover:bg-slate-100 hover:text-foreground"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {t("deal.tabBuy", "Buy Property")}
          </button>
          <button
            onClick={() => handleTabChange("investment")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "investment"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/60 hover:bg-slate-100 hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {t("deal.tabInvestment", "Investment Deals")}
          </button>
        </div>
      </div>
      <SearchResultsPage mode={tab as "buy" | "investment"} topPadding="pt-[7.75rem]" />
    </div>
  );
}
