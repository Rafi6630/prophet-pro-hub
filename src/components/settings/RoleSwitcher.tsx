import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

const ROLE_OPTIONS: { value: AppRole; label: string; description: string }[] = [
  { value: "buyer", label: "Buyer", description: "Browse & purchase properties" },
  { value: "seller", label: "Seller", description: "List & manage your properties" },
  { value: "developer", label: "Developer", description: "Plan & develop land projects" },
];

export default function RoleSwitcher() {
  const { user } = useAuth();
  const { data: roles, isLoading } = useUserRoles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const currentRole = roles?.[0] as AppRole | undefined;
  const [selected, setSelected] = useState<AppRole | "">(currentRole ?? "");

  // Sync when roles load
  if (currentRole && !selected) setSelected(currentRole);

  const handleSwitch = async () => {
    if (!user || !selected || selected === currentRole) return;
    setSaving(true);
    try {
      // Delete existing role(s)
      const { error: delErr } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);
      if (delErr) throw delErr;

      // Insert new role
      const { error: insErr } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: selected });
      if (insErr) throw insErr;

      // Update user metadata too
      await supabase.auth.updateUser({ data: { role: selected } });

      await queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast({ title: "Role updated", description: `You are now a ${selected}.` });

      // Navigate to the new dashboard
      const route = selected === "seller" ? "/seller" : selected === "developer" ? "/developer" : "/buyer";
      navigate(route);
    } catch (err: any) {
      toast({ title: "Failed to switch role", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading role…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-semibold text-foreground">Your Role</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Switch your account role to access different dashboards and features.
      </p>

      <RadioGroup
        value={selected}
        onValueChange={(v) => setSelected(v as AppRole)}
        className="space-y-3"
      >
        {ROLE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`role-${opt.value}`}
            className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
              selected === opt.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
            <div>
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <p className="text-xs text-muted-foreground">{opt.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>

      <Button onClick={handleSwitch} disabled={saving || selected === currentRole || !selected}>
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Switching…
          </>
        ) : (
          "Switch Role"
        )}
      </Button>
    </div>
  );
}
