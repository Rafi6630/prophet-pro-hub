import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useState } from "react";

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState("English");

  const languages = [
    { code: "en", name: "English", direction: "LTR" },
    { code: "ar", name: "العربية", direction: "RTL" },
    { code: "ckb", name: "کوردی", direction: "RTL" },
    { code: "tr", name: "Türkçe", direction: "LTR" },
  ];

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    // Here you would typically implement actual language switching logic
    console.log(`Language switched to: ${language}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline">{currentLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.name)}
            className="flex items-center justify-between px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{language.name}</span>
              <span className="text-xs text-muted-foreground">({language.direction})</span>
            </span>
            {currentLanguage === language.name && (
              <Check className="w-4 h-4 text-success" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;