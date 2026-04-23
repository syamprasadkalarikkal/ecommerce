"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Camera, Check, Loader2, User as UserIcon, MapPin, CreditCard, LogOut, Plus, Trash2, Star } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import ShippingForm from "@/componenets/ShippingForm";

export default function UserProfileDashboard() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal"); // "personal", "address"

  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Personal Info State
  const [personalState, setPersonalState] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // New Address State
  const [newAddressState, setNewAddressState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addressErrors, setAddressErrors] = useState({});

  const router = useRouter();

  const fetchAddresses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

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
        setNewAddressState(prev => ({ ...prev, email: session.user.email }));

        // Fetch Supabase Profile
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, full_name, phone, city, country")
          .eq("id", session.user.id)
          .single();

        if (!error && data) {
          setPersonalState({
            full_name: data.full_name || "",
            email: session.user.email || "",
            phone: data.phone || "",
          });
          setAvatarUrl(data.avatar_url || null);
        } else if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Fetch Supabase Addresses
        await fetchAddresses(session.user.id);

        // Clear old local storage to migrate fully to Supabase
        localStorage.removeItem("default_delivery_address");
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    };

    loadProfile();
  }, [router]);

  const handlePersonalChange = (field, value) => {
    setPersonalState((prev) => ({ ...prev, [field]: value }));
  };

  const handlenewAddressChange = (e) => {
    const { id, value } = e.target;
    setNewAddressState((prev) => ({ ...prev, [id]: value }));
    if (addressErrors[id]) {
      setAddressErrors((prev) => ({ ...prev, [id]: undefined }));
    }
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

  const validateAddressForm = () => {
    const newErrors = {};
    const requiredFields = ["firstName", "lastName", "email", "address", "city", "state", "pincode"];
    requiredFields.forEach((field) => {
      if (!newAddressState[field].trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (newAddressState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAddressState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setAddressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewAddress = async () => {
    if (!user) return;
    if (!validateAddressForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      const newAddr = {
        user_id: user.id,
        first_name: newAddressState.firstName,
        last_name: newAddressState.lastName,
        email: newAddressState.email,
        address: newAddressState.address,
        city: newAddressState.city,
        state: newAddressState.state,
        pincode: newAddressState.pincode,
        // Make default if it's the first address
        is_default: addresses.length === 0
      };

      const { data, error } = await supabase
        .from("user_addresses")
        .insert(newAddr)
        .select()
        .single();

      if (error) throw error;

      toast.success("New delivery address added");
      setAddresses(prev => [data, ...prev]);
      setIsAddingAddress(false);
      setNewAddressState({
        firstName: "", lastName: "", email: user.email, address: "", city: "", state: "", pincode: ""
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to add delivery address");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (!user) return;
    try {
      // First, set all user addresses to is_default = false
      const { error: resetError } = await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
      if (resetError) throw resetError;

      // Ensure local state reflects false
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === addressId })));

      // Then set the specific address to is_default = true
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;
      toast.success("Default address updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to set default address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      setAddresses(prev => prev.filter(a => a.id !== addressId));
      toast.success("Address removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove address");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row text-black pb-20">
      <Toaster position="top-right" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-black/5 p-8 flex flex-col min-h-screen shrink-0">
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
            Delivery Addresses
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
                <h2 className="text-4xl font-serif tracking-tighter mb-2">Delivery Addresses</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Manage your shipping destinations</p>
              </div>
              <button
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="flex items-center gap-2 px-6 py-3 border border-black/10 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-colors"
              >
                <Plus size={14} /> Add New Address
              </button>
            </div>

            {/* List Existing Addresses */}
            {addresses.length > 0 && !isAddingAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`p-6 border relative transition-colors ${addr.is_default ? 'border-[#800000] bg-[#800000]/[0.02]' : 'border-black/10 bg-white'}`}>
                    {addr.is_default && (
                      <div className="absolute top-0 right-0 bg-[#800000] text-white text-[8px] uppercase tracking-widest px-3 py-1 font-bold">
                        Default
                      </div>
                    )}
                    <h3 className="font-serif text-lg mb-1">{addr.first_name} {addr.last_name}</h3>
                    <div className="text-black/60 text-sm space-y-1 mb-6 font-light">
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.state} {addr.pincode}</p>
                      <p>{addr.email}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-black/5 pt-4">
                      {!addr.is_default ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 hover:text-black transition-colors"
                        >
                          Set Default
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#800000]">Selected</span>
                      )}

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-black/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {addresses.length === 0 && !isAddingAddress && (
              <div className="text-center py-16 border border-black/5 bg-white">
                <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-serif text-xl mb-2">No Delivery Addresses Found</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-6">Add an address to speed up your checkout</p>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#800000] transition-colors"
                >
                  Add Your First Address
                </button>
              </div>
            )}

            {isAddingAddress && (
              <div className="bg-white p-8 border border-black/5">
                <div className="flex justify-between items-center mb-8 border-b border-black/5 pb-4">
                  <h3 className="font-serif text-2xl">New Delivery Location</h3>
                  <button onClick={() => setIsAddingAddress(false)} className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity">Cancel</button>
                </div>

                <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8 pb-4 border-b border-black/10">Shipping Address</h2>
                <ShippingForm
                  form={newAddressState}
                  errors={addressErrors}
                  handleChange={handlenewAddressChange}
                />

                <div className="pt-8 mt-8 border-t border-black/5 flex justify-end">
                  <button
                    onClick={handleAddNewAddress}
                    disabled={saving}
                    className="bg-[#800000] text-white px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Check size={14} className="mr-2" />}
                    Save Location
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
