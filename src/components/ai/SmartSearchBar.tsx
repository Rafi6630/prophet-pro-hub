import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Sparkles, Clock, ArrowRight, Mic, Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { parseSearchQuery, buildFilterFromParsedQuery, type ParsedSearchQuery, SUGGESTED_SEARCHES } from "@/lib/ai/searchParser";

interface SmartSearchBarProps {
  onSearch: (query: string, filters: Record<string, unknown>) => void;
  isLoading?: boolean;
  recentSearches?: string[];
  onClearRecent?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export function SmartSearchBar({
  onSearch,
  isLoading = false,
  recentSearches = [],
  onClearRecent,
  placeholder,
  autoFocus = false,
  compact = false,
}: SmartSearchBarProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedSearchQuery | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderText = placeholder || (isRTL 
    ? "اكتب ما تبحث عنه... مثال: شقة في إربيل تحت 150 ألف"
    : "Describe what you need... e.g., apartment in Erbil under 150k"
  );

  useEffect(() => {
    if (query.length > 3) {
      try {
        const parsed = parseSearchQuery(query);
        setParsedQuery(parsed);
      } catch {
        setParsedQuery(null);
      }
    } else {
      setParsedQuery(null);
    }
  }, [query]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const filters = parsedQuery ? buildFilterFromParsedQuery(parsed) : {};
      onSearch(query, filters);
      setIsFocused(false);
    }
  }, [query, parsedQuery, onSearch]);

  const handleQuickSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    const parsed = parseSearchQuery(searchQuery);
    const filters = buildFilterFromParsedQuery(parsed);
    onSearch(searchQuery, filters);
    setIsFocused(false);
  }, [onSearch]);

  const clearQuery = () => {
    setQuery("");
    setParsedQuery(null);
    inputRef.current?.focus();
  };

  const activeFiltersCount = parsedQuery
    ? [
        parsedQuery.city,
        parsedQuery.propertyType,
        parsedQuery.bedrooms,
        parsedQuery.budget,
        parsedQuery.features.length > 0,
      ].filter(Boolean).length
    : 0;

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholderText}
          autoFocus={autoFocus}
          className="h-10 pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearQuery}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </form>
    );
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40`} />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholderText}
            autoFocus={autoFocus}
            className={`h-14 ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} bg-white/5 border-white/10 focus:border-primary text-lg`}
          />
          <div className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearQuery}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Button
                type="submit"
                size="sm"
                className="h-9 px-4"
                disabled={!query.trim()}
              >
                {isRTL ? (
                  <>
                    <span>{t("search", "ابحث")}</span>
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>{t("search", "Search")}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {isFocused && (
        <div className={`absolute ${isRTL ? "right-0" : "left-0"} top-full z-50 mt-2 w-full rounded-xl border border-white/10 bg-card p-4 shadow-xl`}>
          {parsedQuery && activeFiltersCount > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase text-foreground/50">
                {t("aiDetected", "AI Detected Filters")}
              </p>
              <div className="flex flex-wrap gap-2">
                {parsedQuery.city && (
                  <FilterPill label={parsedQuery.city} icon="📍" />
                )}
                {parsedQuery.propertyType && (
                  <FilterPill label={parsedQuery.propertyType} icon="🏠" />
                )}
                {parsedQuery.bedrooms && (
                  <FilterPill label={`${parsedQuery.bedrooms} bed`} icon="🛏️" />
                )}
                {parsedQuery.budget?.max && (
                  <FilterPill label={`under $${(parsedQuery.budget.max / 1000).toFixed(0)}K`} icon="💰" />
                )}
                {parsedQuery.verifiedOnly && (
                  <FilterPill label="verified" icon="✓" />
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-foreground/50">
                {t("suggestedSearches", "Suggested Searches")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(suggestion.query)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  {isRTL ? suggestion.label : suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-foreground/40" />
                  <p className="text-xs font-semibold text-foreground/50">
                    {t("recentSearches", "Recent Searches")}
                  </p>
                </div>
                {onClearRecent && (
                  <button
                    onClick={onClearRecent}
                    className="text-xs text-foreground/50 hover:text-foreground"
                  >
                    {t("clear", "Clear")}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(search)}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-foreground/70 transition-colors hover:bg-white/5"
                  >
                    <Clock className="h-3.5 w-3.5 text-foreground/40" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm">
      <span>{icon}</span>
      <span className="text-primary">{label}</span>
    </div>
  );
}

interface SearchResultsCountProps {
  count: number;
  query: string;
  isLoading?: boolean;
}

export function SearchResultsCount({ count, query, isLoading }: SearchResultsCountProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-foreground/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t("searching", "Searching...")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-foreground/60">
        {isRTL ? (
          <>تم العثور على <span className="font-semibold text-foreground">{count}</span> نتيجة لـ "{query}"</>
        ) : (
          <>Found <span className="font-semibold text-foreground">{count}</span> results for "{query}"</>
        )}
      </span>
    </div>
  );
}

interface ActiveFiltersProps {
  filters: Record<string, unknown>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const { t } = useTranslation();

  const filterEntries = Object.entries(filters).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ""
  );

  if (filterEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-foreground/60">{t("filters", "Filters")}:</span>
      {filterEntries.map(([key, value]) => (
        <Badge
          key={key}
          variant="outline"
          className="gap-1.5 cursor-pointer hover:bg-destructive/10"
          onClick={() => onRemove(key)}
        >
          <span className="text-foreground/50">{key}:</span>
          <span className="font-medium">{String(value)}</span>
          <X className="h-3 w-3" />
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-foreground/50 hover:text-foreground"
      >
        {t("clearAll", "Clear all")}
      </button>
    </div>
  );
}