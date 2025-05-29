'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { Camera, Check, Loader2, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
};

export default function MobileStyleProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialState, setInitialState] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
  });
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
  });

  const router = useRouter();
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialState);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name, phone, city, country')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const profile: ProfileData = {
          full_name: data.full_name || '',
          email: session.user.email || '',
          phone: data.phone || '',
          city: data.city || '',
          country: data.country || '',
        };

        setFormData(profile);
        setInitialState(profile);
        setAvatarUrl(data.avatar_url || null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error in profile loading:', error.message);
          toast.error('Failed to load profile data');
        } else {
          console.error('Unknown error in profile loading:', error);
          toast.error('An unexpected error occurred');
        }
      }
    };

    loadProfile();
  }, [router]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG files are allowed');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) throw new Error('Public URL not found');

      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast.success('Profile picture updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Upload failed:', error.message);
        toast.error('Failed to upload image');
      } else {
        console.error('Unknown upload error:', error);
        toast.error('An unexpected upload error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: avatarUrl,
        full_name: formData.full_name,
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setInitialState(formData);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Profile save error:', error.message);
        toast.error('Failed to save profile');
      } else {
        console.error('Unknown save error:', error);
        toast.error('An unexpected error occurred while saving');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white-to-b from-indigo-50 to-white px-4 pt-8 pb-24">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">My Profile</h1>
        <p className="text-gray-500 text-center text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="relative w-28 h-28 mb-6">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              width={112}
              height={112}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
              <UserIcon size={48} />
            </div>
          )}
        </div>

        <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 shadow-md">
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 mb-6 text-black">
        <div className="space-y-4">
          <ProfileInput label="Full Name" value={formData.full_name} onChange={(v) => handleChange('full_name', v)} icon={<UserIcon size={18} className="text-black" />} />
          <ProfileInput label="Email" value={formData.email} disabled icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>} />
          <ProfileInput label="Phone" value={formData.phone} onChange={(v) => handleChange('phone', v)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} />
          <ProfileInput label="City, State" value={formData.city} onChange={(v) => handleChange('city', v)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>} />
          <ProfileInput label="Country" value={formData.country} onChange={(v) => handleChange('country', v)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>} />
        </div>

        {hasChanges && (
          <button onClick={handleSave} disabled={saving} className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
            {saving ? <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</> : <><Check size={18} className="mr-2" /> Save Changes</>}
          </button>
        )}
      </div>
    </div>
  );
}

type ProfileInputProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

function ProfileInput({ label, value, onChange, disabled = false, icon }: ProfileInputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={label}
          className={`w-full pr-3 py-2.5 border border-gray-300 rounded-lg ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'} ${icon ? 'pl-10' : 'pl-3'}`}
        />
      </div>
    </div>
  );
}
