import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold",
    "ring-offset-background transition-all duration-200 active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground shadow-primary/25 shadow-sm",
          "hover:bg-primary/92 hover:shadow-primary hover:shadow-md",
        ].join(" "),

        destructive: [
          "bg-destructive text-destructive-foreground shadow-sm",
          "hover:bg-destructive/90 hover:shadow-md",
        ].join(" "),

        outline: [
          "border border-border bg-background text-foreground",
          "hover:bg-secondary hover:border-primary/30",
        ].join(" "),

        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/75",
        ].join(" "),

        ghost: [
          "text-foreground",
          "hover:bg-secondary/70 hover:text-foreground",
        ].join(" "),

        link: "text-primary underline-offset-4 hover:underline p-0 h-auto shadow-none",

        gold: [
          "bg-gradient-gold text-white shadow-gold/40 shadow-sm font-bold",
          "hover:shadow-gold hover:shadow-md hover:brightness-105",
        ].join(" "),

        "outline-primary": [
          "border border-primary/30 text-primary bg-primary/5",
          "hover:bg-primary/10 hover:border-primary/50",
        ].join(" "),

        success: [
          "bg-success text-success-foreground shadow-sm",
          "hover:bg-success/90",
        ].join(" "),
      },

      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm:      "h-8 px-3 py-1.5 text-xs rounded-lg",
        md:      "h-9 px-3.5 py-2 rounded-lg",
        lg:      "h-11 px-6 py-2.5 rounded-xl text-base",
        xl:      "h-13 px-8 py-3 rounded-2xl text-base",
        icon:    "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
