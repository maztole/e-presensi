"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  UserCog,
  ShieldCheck,
  GraduationCap,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key,
  Mail,
  Phone,
  BookOpen,
  Lock,
  User,
  X,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

type AccountItem = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  accountType: "ADMIN" | "TENTOR";
  nip?: string;
  phone?: string;
  specialization?: string;
  status?: string;
  password?: string;
  createdAt?: string;
};

export default function ManajemenAkunPage() {
  const { themeColors } = useThemeCMS();

  // Data & State
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "TENTOR">("ALL");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountItem | null>(null);
  const [showPasswordTable, setShowPasswordTable] = useState<{ [id: string]: boolean }>({});

  // Form State
  const [formData, setFormData] = useState({
    accountType: "ADMIN" as "ADMIN" | "TENTOR",
    name: "",
    username: "",
    email: "",
    password: "",
    nip: "",
    phone: "",
    specialization: "",
    role: "ADMIN",
    status: "ACTIVE",
  });
  const [showPassword, setShowPassword] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTablePassword = (id: string) => {
    setShowPasswordTable((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAccounts(data.data);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Filtered list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchRole =
        filterRole === "ALL" || acc.accountType === filterRole;
      const q = search.toLowerCase();
      const matchSearch =
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        (acc.nip && acc.nip.toLowerCase().includes(q)) ||
        (acc.role && acc.role.toLowerCase().includes(q));
      return matchRole && matchSearch;
    });
  }, [accounts, filterRole, search]);

  const handleOpenAdd = () => {
    setFormData({
      accountType: "ADMIN",
      name: "",
      username: "",
      email: "",
      password: "12345678",
      nip: `TUT${Date.now().toString().slice(-6)}`,
      phone: "081234567890",
      specialization: "Matematika",
      role: "ADMIN",
      status: "ACTIVE",
    });
    setShowPassword(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: AccountItem) => {
    setSelectedAccount(acc);
    setFormData({
      accountType: acc.accountType,
      name: acc.name,
      username: acc.username || acc.email,
      email: acc.email,
      password: acc.password || "12345678",
      nip: acc.nip || acc.username || "",
      phone: acc.phone || "",
      specialization: acc.specialization || "",
      role: acc.role || "ADMIN",
      status: acc.status || "ACTIVE",
    });
    setShowPassword(true);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (acc: AccountItem) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus akun ${acc.name} (${acc.accountType}) dari akses sistem?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/users?id=${acc.id}&accountType=${acc.accountType}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setNotice({ type: "success", text: result.message || "Akun berhasil dihapus!" });
        loadAccounts();
      } else {
        setNotice({ type: "error", text: result.error || "Gagal menghapus akun." });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setNotice({ type: "success", text: result.message || "Akun baru berhasil dibuat!" });
        setIsAddModalOpen(false);
        loadAccounts();
      } else {
        setNotice({ type: "error", text: result.error || "Gagal membuat akun." });
      }
    } catch (e: any) {
      setNotice({ type: "error", text: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setIsSaving(true);
    setNotice(null);

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAccount.id,
          ...formData,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setNotice({ type: "success", text: result.message || "Akun berhasil diperbarui!" });
        setIsEditModalOpen(false);
        loadAccounts();
      } else {
        setNotice({ type: "error", text: result.error || "Gagal memperbarui akun." });
      }
    } catch (e: any) {
      setNotice({ type: "error", text: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const adminCount = accounts.filter((a) => a.accountType === "ADMIN").length;
  const tutorCount = accounts.filter((a) => a.accountType === "TENTOR").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}
          >
            <UserCog size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Manajemen Akun Pengguna
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola akun login admin dan tentor yang dapat mengakses website e-presensi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAccounts}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${themeColors.bg} hover:opacity-90`}
          >
            <Plus size={16} />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            notice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto space-x-2">
          <button
            onClick={() => setFilterRole("ALL")}
            className={`flex items-center gap-2 pb-3 pt-1 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              filterRole === "ALL"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>Semua Akun</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {accounts.length}
            </span>
          </button>
          <button
            onClick={() => setFilterRole("ADMIN")}
            className={`flex items-center gap-2 pb-3 pt-1 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              filterRole === "ADMIN"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Admin & Staff</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              {adminCount}
            </span>
          </button>
          <button
            onClick={() => setFilterRole("TENTOR")}
            className={`flex items-center gap-2 pb-3 pt-1 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              filterRole === "TENTOR"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <GraduationCap size={14} />
            <span>Tentor / Pengajar</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              {tutorCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, NIP..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Table Data Akun */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama & Identitas</th>
                <th className="px-4 py-3.5">Tipe Akun (Role)</th>
                <th className="px-4 py-3.5">Username / Login ID</th>
                <th className="px-4 py-3.5">Email Terdaftar</th>
                <th className="px-4 py-3.5">Password / Kata Sandi</th>
                <th className="px-4 py-3.5">Kontak / Keterangan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Memuat data akun...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Tidak ditemukan data akun pengguna.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isPwdVisible = showPasswordTable[acc.id] || false;
                  return (
                    <tr
                      key={`${acc.accountType}-${acc.id}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              acc.accountType === "ADMIN"
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {acc.accountType === "ADMIN" ? (
                              <ShieldCheck size={16} />
                            ) : (
                              <GraduationCap size={16} />
                            )}
                          </div>
                          <div>
                            <div>{acc.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Dibuat: {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("id-ID") : "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            acc.accountType === "ADMIN"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {acc.accountType === "ADMIN" ? `ADMIN (${acc.role})` : "TENTOR / PENGAJAR"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 font-bold">
                          {acc.username}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400" />
                          <span>{acc.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300">
                            {isPwdVisible ? acc.password || "12345678" : "••••••••"}
                          </span>
                          <button
                            onClick={() => toggleTablePassword(acc.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={isPwdVisible ? "Sembunyikan Password" : "Tampilkan Password"}
                          >
                            {isPwdVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {acc.accountType === "TENTOR" ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200 block text-[11px]">
                              {acc.specialization || "Semua Bidang"}
                            </span>
                            <span className="text-[10px] text-slate-400">{acc.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Hak Akses Penuh Sistem</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title="Edit Akun & Sandi"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(acc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH AKUN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${themeColors.bg} text-white`}>
                  <UserCog size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Tambah Akun Baru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Buat akun login untuk Admin atau Tentor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              {/* Pilih Tipe Akun */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tipe Akun Pengguna *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "ADMIN" })}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.accountType === "ADMIN"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>Admin / Staff</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "TENTOR" })}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formData.accountType === "TENTOR"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <GraduationCap size={16} />
                    <span>Tentor / Pengajar</span>
                  </button>
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    placeholder="misal: Kak Ahmad Fauzi, S.Pd."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username / Login ID *
                  </label>
                  <div className="relative">
                    <UserCog className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="misal: ahmad / TUT001"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      placeholder="misal: ahmad@bimbel.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi / Password Login *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? "Sembunyikan Sandi" : "Lihat Sandi"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan kata sandi login"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Field Khusus TENTOR */}
              {formData.accountType === "TENTOR" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        NIP Tentor
                      </label>
                      <input
                        type="text"
                        value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No. WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mata Pelajaran / Spesialisasi
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Matematika & Fisika SMA"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${themeColors.bg} hover:opacity-90 flex items-center gap-2`}
                >
                  <Save size={15} />
                  <span>{isSaving ? "Menyimpan..." : "Buat Akun"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT AKUN */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${themeColors.bg} text-white`}>
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Edit Akun: {selectedAccount.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Perbarui nama, email, role, atau kata sandi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username / Login ID *
                  </label>
                  <div className="relative">
                    <UserCog className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Password - Bisa dilihat & diedit untuk semua role */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi / Password Login
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showPassword ? "Sembunyikan Sandi" : "Lihat Sandi"}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi baru (kosongkan jika tidak diubah)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  *Kosongkan jika tidak ingin mengubah password. Password saat ini: <code className="font-mono font-bold text-slate-600 dark:text-slate-300">{selectedAccount.password || "12345678"}</code>
                </p>
              </div>

              {/* Edit Tentor Fields */}
              {selectedAccount.accountType === "TENTOR" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        NIP / ID Tentor
                      </label>
                      <input
                        type="text"
                        value={formData.nip}
                        onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        No. WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Mata Pelajaran / Spesialisasi
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${themeColors.bg} hover:opacity-90 flex items-center gap-2`}
                >
                  <Save size={15} />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
