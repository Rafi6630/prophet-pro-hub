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
    <div className={cn("soft-panel p-4 lg:p-5", className)}>
      <div className="text-2xl font-extrabold text-white lg:text-3xl">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-xs text-white/66 lg:text-sm">{label}</div>
    </div>
  );
}

export default MetricCard;
