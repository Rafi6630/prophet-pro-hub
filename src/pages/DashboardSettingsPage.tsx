import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "iraqproperty-settings";

export default function DashboardSettingsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [marketReports, setMarketReports] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        emailAlerts?: boolean;
        whatsappAlerts?: boolean;
        marketReports?: boolean;
      };
      setEmailAlerts(parsed.emailAlerts ?? true);
      setWhatsappAlerts(parsed.whatsappAlerts ?? true);
      setMarketReports(parsed.marketReports ?? true);
    } catch {
      // Ignore corrupted local preference payloads.
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ emailAlerts, whatsappAlerts, marketReports, language: i18n.language }),
    );
    toast({ title: t("account.settingsSaved") });
  };

  return (
    <div className="container-app py-6 lg:py-10 max-w-3xl">
      <PageMeta title={`${t("account.settingsTitle")} | IraqProperty`} description={t("account.settingsSubtitle")} noIndex />
      <div className="content-panel p-6 lg:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{t("dashboard.settings")}</p>
        <h1 className="mt-2 text-3xl font-extrabold">{t("account.settingsTitle")}</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("account.settingsSubtitle")}</p>

        <div className="mt-8 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">{t("account.preferredLanguage")}</label>
            <select
              value={i18n.language}
              onChange={(event) => i18n.changeLanguage(event.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="ckb">کوردی سۆرانی</option>
            </select>
          </div>

          {[
            [t("account.emailAlerts"), emailAlerts, setEmailAlerts],
            [t("account.whatsappAlerts"), whatsappAlerts, setWhatsappAlerts],
            [t("account.marketReports"), marketReports, setMarketReports],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/20 px-4 py-4">
              <span className="text-sm font-medium">{label as string}</span>
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(event) => (setter as (next: boolean) => void)(event.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
            </label>
          ))}
        </div>

        <Button onClick={saveSettings} className="mt-6 w-full sm:w-fit">
          {t("account.saveSettings")}
        </Button>
      </div>
    </div>
  );
}
