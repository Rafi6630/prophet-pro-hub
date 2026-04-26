import { useEffect, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isCompared, toggleCompareId } from "@/lib/compare";

export function CompareButton({ propertyId }: { propertyId: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isCompared(propertyId));
  }, [propertyId]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={active ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white"}
      onClick={() => setActive(toggleCompareId(propertyId).active)}
    >
      <GitCompareArrows className="h-4 w-4" />
      Compare
    </Button>
  );
}

export default CompareButton;
