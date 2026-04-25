import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGS = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "ku", label: "کوردی" },
];

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const current = LANGS.find(l => l.code === i18n.language?.split("-")[0]) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-border bg-card hover:bg-secondary text-sm font-medium transition">
        <Globe className="w-4 h-4" />
        {!compact && <span>{current.label}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGS.map(l => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={l.code === current.code ? "bg-secondary font-semibold" : ""}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
