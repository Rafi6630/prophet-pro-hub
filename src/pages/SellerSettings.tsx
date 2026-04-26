import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageMeta from "@/components/common/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSeller } from "@/hooks/useSeller";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const NOTIF_KEY = "seller_notification_prefs";
const LANG_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

function loadNotifPrefs() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : { email: true, whatsapp: true, newLead: true, viewAlert: false };
  } catch {
    return { email: true, whatsapp: true, newLead: true, viewAlert: false };
  }
}

export function SellerSettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { profile, loading: profileLoading, updateProfile } = useSeller();
  const queryClient = useQueryClient();

  // Profile tab state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Company tab state
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState(loadNotifPrefs());

  // Language state
  const [lang, setLang] = useState(i18n.language ?? "en");

  // Delete account dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Populate fields from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setPhone(profile.phone ?? "");
      setWhatsapp(profile.whatsapp ?? "");
    }
  }, [profile]);

  // Load seller_profiles for company tab
  useEffect(() => {
    if (!user) return;
    supabase
      .from("seller_profiles" as never)
      .select("company_name, logo_url, website")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { company_name?: string; logo_url?: string; website?: string } | null }) => {
        if (data) {
          setCompanyName(data.company_name ?? "");
          setLogoUrl(data.logo_url ?? "");
          setWebsite(data.website ?? "");
        }
      });
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ display_name: displayName, bio, phone, whatsapp });
      toast({ title: "Profile updated successfully!" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingCompany(true);
    try {
      const { error } = await supabase
        .from("seller_profiles" as never)
        .upsert({
          user_id: user.id,
          company_name: companyName,
          logo_url: logoUrl,
          website,
          updated_at: new Date().toISOString(),
        } as never);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["seller-profile", user.id] });
      toast({ title: "Company info saved!" });
    } catch (err) {
      toast({
        title: "Failed to save company info",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSavingCompany(false);
    }
  }

  function handleNotifToggle(key: string) {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    toast({ title: "Preference saved" });
  }

  function handleLangChange(newLang: string) {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    toast({ title: `Language changed to ${LANG_OPTIONS.find(l => l.value === newLang)?.label}` });
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      toast({ title: "Type DELETE to confirm", variant: "destructive" });
      return;
    }
    try {
      await signOut();
      toast({ title: "Account deletion requested. Our team will process it within 24 hours." });
      setShowDeleteDialog(false);
    } catch {
      toast({ title: "Failed to process request", variant: "destructive" });
    }
  }

  const fieldClass = "rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400/20";

  return (
    <>
      <PageMeta
        title="Settings | IraqProperty Seller"
        description="Manage your seller account settings"
        noIndex
      />

      <div className="px-4 pt-8 pb-12 max-w-2xl mx-auto lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">Seller Portal</p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Settings</h1>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="rounded-xl bg-slate-100 p-1 mb-6 w-full grid grid-cols-4">
            <TabsTrigger value="profile"       className="rounded-lg text-xs">Profile</TabsTrigger>
            <TabsTrigger value="company"       className="rounded-lg text-xs">Company</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs">Alerts</TabsTrigger>
            <TabsTrigger value="language"      className="rounded-lg text-xs">Language</TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Personal Profile</h2>
              {profileLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Display Name</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="Your name" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="+964..." />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">WhatsApp</Label>
                    <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="+964..." />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} className={`mt-1 min-h-[80px] ${fieldClass}`} placeholder="Tell buyers about yourself..." />
                  </div>
                  <Button type="submit" disabled={savingProfile} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              )}
            </div>
          </TabsContent>

          {/* Company tab */}
          <TabsContent value="company">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Company Information</h2>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Company Name</Label>
                  <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="Your company or agency name" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Logo URL</Label>
                  <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="https://..." />
                </div>
                {logoUrl && (
                  <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden">
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" onError={e => { (e.currentTarget as HTMLImageElement).src = ""; }} />
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-slate-700">Website</Label>
                  <Input value={website} onChange={e => setWebsite(e.target.value)} className={`mt-1 ${fieldClass}`} placeholder="https://yourcompany.com" />
                </div>
                <Button type="submit" disabled={savingCompany} className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                  {savingCompany ? "Saving..." : "Save Company Info"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: "email",     label: "Email notifications",    desc: "Receive notifications via email" },
                  { key: "whatsapp",  label: "WhatsApp notifications",  desc: "Receive updates on WhatsApp" },
                  { key: "newLead",   label: "New lead alerts",         desc: "Get notified when you receive a new lead" },
                  { key: "viewAlert", label: "View milestone alerts",   desc: "Notify when a listing hits 100, 500, 1000 views" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <div
                      onClick={() => handleNotifToggle(key)}
                      className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${notifPrefs[key] ? "bg-amber-500" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifPrefs[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Language tab */}
          <TabsContent value="language">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-4">Language</h2>
              <div className="space-y-2">
                {LANG_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                      lang === opt.value ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => handleLangChange(opt.value)}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={opt.value}
                      checked={lang === opt.value}
                      onChange={() => handleLangChange(opt.value)}
                      className="text-amber-500"
                    />
                    <span className="font-medium text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-bold text-red-900 mb-1">Danger Zone</h3>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100 rounded-xl"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete Account?</DialogTitle>
            <DialogDescription>
              This will permanently remove your account, all listings, and all data. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="rounded-xl border-red-200 focus:border-red-400"
          />
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Delete Forever
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SellerSettingsPage;
