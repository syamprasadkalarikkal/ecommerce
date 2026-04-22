"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Check, Loader2, User as UserIcon, MapPin, CreditCard, LogOut } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function UserProfileDashboard() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // "personal", "address"

  // Personal Info State
  const [personalState, setPersonalState] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Delivery Address State
  const [addressState, setAddressState] = useState({
    street: "",
    apartment: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          router.push("/login");
          return;
        }

        setUser(session.user);

        // Fetch Supabase Profile
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name, phone, city, country")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        setPersonalState({
          full_name: data.full_name || "",
          email: session.user.email || "",
          phone: data.phone || "",
        });

        setAvatarUrl(data.avatar_url || null);

        // Fetch Local Delivery Data
        const localAddressStr = localStorage.getItem("default_delivery_address");
        if (localAddressStr) {
          const localAddress = JSON.parse(localAddressStr);
          setAddressState({
            street: localAddress.street || "",
            apartment: localAddress.apartment || "",
            city: data.city || localAddress.city || "",
            state: localAddress.state || "",
            postal_code: localAddress.postal_code || "",
            country: data.country || localAddress.country || "",
          });
        } else {
          setAddressState((prev) => ({
            ...prev,
            city: data.city || "",
            country: data.country || "",
          }));
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    };

    loadProfile();
  }, [router]);

  const handlePersonalChange = (field, value) => {
    setPersonalState((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setAddressState((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;

      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });

      setAvatarUrl(newAvatarUrl);
      toast.success("Avatar updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSavePersonal = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: avatarUrl,
        full_name: personalState.full_name,
        phone: personalState.phone,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Personal details updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save personal details");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    try {
      setSaving(true);

      // Save full address locally for checkout sync
      localStorage.setItem("default_delivery_address", JSON.stringify(addressState));

      // Sync city/country to supabase schema safely
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: avatarUrl, // maintain existing
        full_name: personalState.full_name, // maintain existing
        phone: personalState.phone, // maintain existing
        city: addressState.city,
        country: addressState.country,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Delivery address updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save delivery address");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row text-black">
      <Toaster position="top-right" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-black/5 p-8 flex flex-col min-h-full shrink-0">
        <div className="mb-12">
          <Link href="/">
            <h1 className="text-3xl font-serif tracking-tighter text-[#800000]">Kalika</h1>
          </Link>
          <p className="text-[8px] uppercase tracking-[0.3em] font-bold opacity-40 mt-1">Client Dashboard</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab("personal")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === "personal" ? "bg-black text-white" : "text-black/60 hover:bg-black/5"
              }`}
          >
            <UserIcon size={14} />
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${activeTab === "address" ? "bg-black text-white" : "text-black/60 hover:bg-black/5"
              }`}
          >
            <MapPin size={14} />
            Delivery Address
          </button>
          <button
            onClick={() => toast("Order history arriving soon.")}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-black/60 hover:bg-black/5 transition-all"
          >
            <CreditCard size={14} />
            Order History
          </button>
        </nav>

        <div className="pt-8 border-t border-black/5 mt-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-16 max-w-4xl">
        {activeTab === "personal" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-serif tracking-tighter mb-2">Personal Details</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Manage your identity and contact</p>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="bg-white p-8 border border-black/5 mb-8 flex items-center gap-8">
              <div className="relative w-24 h-24 shrink-0">
                <div className="w-full h-full rounded-full border border-black/10 overflow-hidden bg-[#FDFBF7]">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/20">
                      <UserIcon size={32} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-black p-2 rounded-full text-white cursor-pointer hover:bg-[#800000] transition-colors shadow-sm">
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              <div>
                <h3 className="font-serif text-xl">Profile Image</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-4">PNG, JPG up to 5MB</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white p-8 border border-black/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Full Name</label>
                  <input
                    type="text"
                    value={personalState.full_name}
                    onChange={(e) => handlePersonalChange("full_name", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Email Address</label>
                  <input
                    type="email"
                    value={personalState.email}
                    disabled
                    className="w-full px-4 py-3 bg-black/5 border border-black/5 text-sm text-black/50 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Phone Number</label>
                  <input
                    type="tel"
                    value={personalState.phone}
                    onChange={(e) => handlePersonalChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 flex justify-end">
                <button
                  onClick={handleSavePersonal}
                  disabled={saving}
                  className="bg-[#800000] text-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}
                  Save Details
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-serif tracking-tighter mb-2">Delivery Address</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Your default shipping destination</p>
              </div>
            </div>

            <div className="bg-white p-8 border border-black/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Street Address</label>
                  <input
                    type="text"
                    value={addressState.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="123 Luxury Avenue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    value={addressState.apartment}
                    onChange={(e) => handleAddressChange("apartment", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="Apt 4B"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">City</label>
                  <input
                    type="text"
                    value={addressState.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">State / Province</label>
                  <input
                    type="text"
                    value={addressState.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Postal Code</label>
                  <input
                    type="text"
                    value={addressState.postal_code}
                    onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-60 block mb-3">Country</label>
                  <input
                    type="text"
                    value={addressState.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-black/10 text-sm focus:outline-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000]"
                    placeholder="United States"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 flex justify-end">
                <button
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className="bg-[#800000] text-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}
                  Save Default Address
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
