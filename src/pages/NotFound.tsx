import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="container-app py-20 text-center">
      <div className="text-7xl font-extrabold text-gradient-gold mb-4">404</div>
      <p className="text-muted-foreground mb-6">{t("common.noResults")}</p>
      <Link to="/"><Button>{t("nav.home")}</Button></Link>
    </div>
  );
}
