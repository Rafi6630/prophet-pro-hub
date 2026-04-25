import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon:        LucideIcon;
  title:       string;
  description: string;
  action?:     React.ReactNode;
  size?:       "sm" | "md" | "lg";
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
}: EmptyStateProps) {
  const iconSize    = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-20 h-20" : "w-16 h-16";
  const iconInner   = size === "sm" ? "w-5 h-5"  : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const padding     = size === "sm" ? "p-6"       : size === "lg" ? "p-16"      : "p-10 sm:p-14";
  const titleClass  = size === "sm" ? "text-base" : size === "lg" ? "text-2xl"  : "text-lg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl bg-card border border-dashed border-border/80 ${padding} text-center`}
    >
      {/* Pulsing icon container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mb-5 inline-flex"
      >
        {/* Outer glow ring */}
        <div className={`${iconSize} rounded-2xl bg-primary/6 border border-primary/10 absolute inset-0
          scale-[1.45] opacity-60`} />
        {/* Inner container */}
        <div className={`${iconSize} rounded-2xl bg-primary/10 flex items-center justify-center relative z-10`}>
          <Icon className={`${iconInner} text-primary/55`} />
        </div>
      </motion.div>

      <h3 className={`${titleClass} font-display font-semibold text-foreground mb-2 leading-tight`}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex justify-center"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
