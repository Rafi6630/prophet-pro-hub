import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyListingsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
        <Building2 className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">No Listings Yet</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
        Start showcasing your properties to thousands of buyers across Iraq.
        Create your first listing in minutes.
      </p>
      <Button
        asChild
        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white gap-2 px-6"
      >
        <Link to="/seller/create">
          <Plus className="h-4 w-4" />
          Create Your First Listing
        </Link>
      </Button>
    </div>
  );
}
