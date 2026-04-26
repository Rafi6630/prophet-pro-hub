import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  suffix = "",
  className,
}: {
  label: string;
  value: number;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start = 0;
    const duration = 850;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className={cn("soft-panel p-3 sm:p-4 lg:p-5", className)}>
      <div className="text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="mt-0.5 text-[11px] text-white/60 sm:mt-1 sm:text-xs lg:text-sm">{label}</div>
    </div>
  );
}

export default MetricCard;
