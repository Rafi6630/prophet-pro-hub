/* ── Skeleton shimmer base ── */
const shimmerCls = "skeleton";

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border overflow-hidden ${className}`}>
      {/* Image area */}
      <div className={`aspect-[16/10] w-full ${shimmerCls}`} />

      <div className="p-4 space-y-3">
        {/* Title */}
        <div className={`h-4 w-3/4 rounded-lg ${shimmerCls}`} />
        {/* Location */}
        <div className={`h-3 w-1/2 rounded-lg ${shimmerCls}`} />
        {/* Specs row */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className={`h-3 w-10 rounded ${shimmerCls}`} />
          <div className={`h-3 w-10 rounded ${shimmerCls}`} />
          <div className={`h-3 w-14 rounded ${shimmerCls} ms-auto`} />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 lg:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className={`h-2.5 w-20 rounded ${shimmerCls}`} />
          <div className={`h-8 w-16 rounded-lg ${shimmerCls}`} />
          <div className={`h-2.5 w-14 rounded ${shimmerCls}`} />
        </div>
        <div className={`w-11 h-11 rounded-xl ${shimmerCls} shrink-0`} />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl ${shimmerCls} shrink-0`} />
          <div className="flex-1 space-y-2.5 min-w-0">
            <div className={`h-4 w-2/3 rounded-lg ${shimmerCls}`} />
            <div className={`h-3 w-1/3 rounded-lg ${shimmerCls}`} />
          </div>
          <div className={`w-16 h-8 rounded-lg ${shimmerCls} shrink-0`} />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className={`h-4 w-36 rounded-lg ${shimmerCls}`} />
          <div className={`h-10 w-full rounded-xl ${shimmerCls}`} />
          {i === 0 && <div className={`h-[180px] rounded-xl ${shimmerCls}`} />}
        </div>
      ))}
    </div>
  );
}

export function DealCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border overflow-hidden ${className}`}>
      <div className={`h-44 w-full ${shimmerCls}`} />
      <div className="p-4 space-y-3">
        <div className={`h-4 w-4/5 rounded-lg ${shimmerCls}`} />
        <div className={`h-3 w-1/2 rounded ${shimmerCls}`} />
        <div className="flex items-center justify-between">
          <div className={`h-6 w-24 rounded-lg ${shimmerCls}`} />
          <div className={`h-5 w-14 rounded-full ${shimmerCls}`} />
        </div>
        <div className={`h-3 w-full rounded ${shimmerCls}`} />
        <div className={`h-3 w-3/4 rounded ${shimmerCls}`} />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-4 w-full rounded ${shimmerCls}`} style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}
