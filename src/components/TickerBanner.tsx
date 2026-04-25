// Meridian Growth Advisory - Ticker Banner Component

import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Badge } from '@/components/ui/badge';

export function TickerBanner() {
  const { currentLanguage } = useApp();
  const t = translations[currentLanguage] || translations.en;
  const keywords = (t.ticker || []) as string[];

  // Duplicate keywords for seamless loop
  const allKeywords = [...keywords, ...keywords];

  return (
    <div className="w-full bg-primary overflow-hidden py-3">
      <div className="ticker-scroll flex gap-4 whitespace-nowrap">
        {allKeywords.map((keyword, index) => (
          <Badge
            key={`${keyword}-${index}`}
            variant="secondary"
            className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 px-4 py-1.5 text-sm font-medium"
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}
