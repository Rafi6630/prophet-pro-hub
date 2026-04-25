import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = `${t("auth.signInTitle")} — ${t("common.appName")}`; }, [t]);

  const from = (location.state as { from?: string })?.from ?? "/";

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(from, { replace: true });
    });
  }, [navigate, from]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast({ title: t("common.success"), description: t("auth.signUpTitle") });
        navigate("/", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast({
        title: t("common.error"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero text-foreground grid lg:grid-cols-2">
      {/* Hero side */}
      <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(circle at 30% 20%, hsl(var(--gold) / 0.4), transparent 50%)" }} />
        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gold grid place-items-center text-accent-foreground font-extrabold">ع</div>
          <span className="font-extrabold text-xl">{t("common.appName")}</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold text-gradient-gold mb-3">{t("common.tagline")}</h1>
          <p className="text-white/80">{t("home.subtitle")}</p>
        </div>
        <div className="relative z-10 text-white/50 text-xs">© Aqar</div>
      </div>

      {/* Form side */}
      <div className="bg-background flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4 flip-rtl" /> {t("common.back")}
            </Link>
            <LanguageToggle compact />
          </div>

          <h2 className="text-3xl font-extrabold mb-2">
            {mode === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {mode === "signin" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
          </p>

          <Button
            onClick={handleGoogle}
            disabled={loading}
            variant="outline"
            className="w-full h-11 mb-4 gap-2 font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t("auth.googleSignIn")}
          </Button>

          <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-border" />
            {t("auth.or")}
            <span className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="mb-1.5 block">{t("auth.displayName")}</Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                  <Input value={name} onChange={e => setName(e.target.value)} className="ps-9" placeholder={t("auth.displayName")} />
                </div>
              </div>
            )}
            <div>
              <Label className="mb-1.5 block">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="ps-9" dir="ltr" />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
                <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="ps-9" dir="ltr" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 font-bold">
              {loading ? t("common.loading") : (mode === "signin" ? t("auth.signIn") : t("auth.signUp"))}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            {mode === "signin" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
            <button onClick={() => setMode(m => m === "signin" ? "signup" : "signin")} className="text-primary font-semibold hover:underline">
              {mode === "signin" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
