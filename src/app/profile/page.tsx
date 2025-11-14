"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProfile,
  updateCustomerProfile,
  isCustomer,
} from "../services/auth";

interface ProfileData {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: { name: string };
}

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const stored = localStorage.getItem("token");
        if (!stored) {
          router.push("/login");
          return;
        }

        setToken(stored);

        // Check if user is customer
        const isCust = await isCustomer(stored);
        if (!isCust) {
          setError("Hanya customer yang dapat mengakses halaman ini.");
          return;
        }

        const res = await getProfile(stored);
        if (res?.user) {
          setProfile(res.user);
          setFormData({
            username: res.user.username || "",
            email: res.user.email || "",
            phone: res.user.phone || "",
          });
        } else {
          setError("Gagal memuat profil.");
        }
      } catch (e: any) {
        setError(e?.message || "Terjadi kesalahan tak terduga");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profile) return;

    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const updateData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
      };

      const res = await updateCustomerProfile(token, profile.id, updateData);

      // Consider success when backend returns success flag OR returns data/user payload
  const r: any = res;
  const ok = r?.success !== false && (r?.data || r?.user || r?.success === true);

      if (ok) {
        // Prefer updated data from response when available
  const updated = (r.data && (r.data.user ?? r.data)) ?? updateData;
  setProfile((prev) => (prev ? { ...prev, ...updated } : null));
        setIsEditing(false);
        alert("Profil berhasil diperbarui!");
      } else {
        // Don't set global `error` (which shows full error page). Show small inline message instead.
        setUpdateError(res?.message || "Gagal memperbarui profil.");
        console.warn("Update profile failed:", res);
      }
    } catch (e: any) {
      // Keep global error for unexpected fatal errors, but show inline message for update failures.
      setUpdateError(e?.message || "Terjadi kesalahan saat memperbarui profil");
      console.error("Exception updating profile:", e);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5b0675ff]"></div>
          <p className="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/home")}
              className="bg-[#5b0675ff] text-white px-4 py-2 rounded-md hover:bg-[#4a0560] transition-colors"
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#5b0675ff] px-6 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            Profil Customer
          </h1>
        </div>

        <div className="px-6 py-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.username || "Tidak ada"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.phone || "Tidak ada"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.role?.name}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-[#5b0675ff] text-white py-2 px-4 rounded-md hover:bg-[#4a0560] transition-colors"
                >
                  Edit Profil
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5b0675ff] focus:border-[#5b0675ff]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5b0675ff] focus:border-[#5b0675ff]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#5b0675ff] focus:border-[#5b0675ff]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-[#5b0675ff] text-white py-2 px-4 rounded-md hover:bg-[#4a0560] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
