import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const recoveryParams = useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

    return {
      accessToken: hash.get("access_token") ?? search.get("access_token"),
      type: hash.get("type") ?? search.get("type"),
    };
  }, []);
  const isRecoveryMode =
    recoveryParams.type === "recovery" || Boolean(recoveryParams.accessToken);

  useEffect(() => {
    document.title = `${t("auth.resetTitle")} — ${t("common.appName")}`;
  }, [t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecoveryMode) {
        if (password.length < 6) {
          throw new Error(t("auth.password"));
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        toast({ title: t("common.success"), description: t("auth.reset") });
        navigate("/auth", { replace: true });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({ title: t("auth.resetSent") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-card border border-border p-8">
        <h1 className="text-2xl font-extrabold mb-2">{t("auth.resetTitle")}</h1>
        <p className="text-muted-foreground text-sm mb-6">
          {isRecoveryMode ? "Choose a new password for your account." : t("auth.resetSent")}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {isRecoveryMode ? (
            <>
              <div>
                <Label className="mb-1.5 block">{t("auth.password")}</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Confirm password</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  dir="ltr"
                />
              </div>
            </>
          ) : (
            <div>
              <Label className="mb-1.5 block">{t("auth.email")}</Label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">{t("auth.reset")}</Button>
        </form>
        <Link to="/auth" className="block text-sm text-center mt-4 text-primary hover:underline">{t("common.back")}</Link>
      </div>
    </div>
  );
}
