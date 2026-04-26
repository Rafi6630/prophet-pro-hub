import { useTranslation } from "react-i18next";
import { Users, Clock } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";

export function SellerLeadsPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title="Leads | IraqProperty Seller" noIndex />
      <div className="px-4 pt-8 pb-6 max-w-2xl mx-auto lg:px-8 lg:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">{t("sellerPortal.title")}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{t("sellerPortal.leads")}</h1>

        <div className="mt-10 flex flex-col items-center gap-5 py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="font-bold text-slate-700">{t("sellerPortal.noLeads")}</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">{t("sellerPortal.noLeadsDesc")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            {t("sellerPortal.comingSoon")}
          </div>
        </div>
      </div>
    </>
  );
}

export default SellerLeadsPage;
