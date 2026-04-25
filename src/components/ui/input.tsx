import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-2",
          "text-sm text-foreground ring-offset-background",
          "placeholder:text-muted-foreground/60",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "transition-all duration-150",
          "hover:border-border/80",
          "focus-visible:outline-none focus-visible:border-primary/50",
          "focus-visible:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_0_3px_hsl(var(--primary)/0.12)]",
          "disabled:cursor-not-allowed disabled:opacity-45 disabled:bg-muted/50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
