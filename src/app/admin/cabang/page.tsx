"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  MapPin,
  Building2,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  Users,
  Phone,
  X,
} from "lucide-react";

interface BranchItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  studentCount?: number;
}

export default function BranchManagementPage() {
  const { themeColors } = useThemeCMS();
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/branches?query=${encodeURIComponent(search)}` : "/api/branches";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setBranches(data.data);
      } else if (Array.isArray(data)) {
        setBranches(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [search]);

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setFormData({
      code: `CBG-00${branches.length + 1}`,
      name: "",
      address: "",
      phone: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BranchItem) => {
    setSelectedBranch(b);
    setFormData({
      code: b.code || "",
      name: b.name || "",
      address: b.address || "",
      phone: b.phone || "",
      isActive: b.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert("Kode dan nama cabang wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      const method = selectedBranch ? "PUT" : "POST";
      const payload = selectedBranch
        ? { id: selectedBranch.id, ...formData }
        : formData;

      const res = await fetch("/api/branches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        alert(resData.error || "Gagal menyimpan data cabang.");
        return;
      }

      setNotice(
        selectedBranch
          ? `Cabang ${formData.name} berhasil diperbarui.`
          : `Cabang ${formData.name} berhasil ditambahkan.`
      );
      setIsModalOpen(false);
      fetchBranches();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan saat menyimpan cabang.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data tempat/cabang ${name}?`)) return;
    try {
      const res = await fetch(`/api/branches?id=${id}`, { method: "DELETE" });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        alert(resData.error || "Gagal menghapus cabang.");
        return;
      }
      setNotice(`Cabang ${name} berhasil dihapus.`);
      fetchBranches();
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <Building2 size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Data Cabang
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola data master lokasi tempat bimbingan belajar, kontak cabang, dan jumlah siswa terdaftar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer`}
          >
            <Plus size={16} />
            <span>Tambah Cabang Baru</span>
          </button>
          <button
            onClick={fetchBranches}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Stats */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari cabang berdasarkan nama, kode, atau alamat..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">{branches.length} Cabang Tempat</span>
        </div>
      </div>

      {/* Table of Branches */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Kode Cabang</th>
                <th className="px-4 py-3.5 font-semibold">Nama Tempat / Cabang</th>
                <th className="px-4 py-3.5 font-semibold">Alamat Lengkap</th>
                <th className="px-4 py-3.5 font-semibold">Nomor WhatsApp</th>
                <th className="px-4 py-3.5 font-semibold">Total Siswa</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Belum ada data cabang tempat les terdaftar.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                        {b.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-rose-500 shrink-0" />
                        <span>{b.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {b.address || "-"}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">
                      {b.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-emerald-500" />
                          <span>{b.phone}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                        <Users size={12} />
                        <span>{b.studentCount || 0} Siswa</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          b.isActive
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"
                        }`}
                      >
                        {b.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.phone && (
                          <a
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Admin Cabang ${b.name}, menginfokan koordinasi operasional bimbingan belajar.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors"
                            title={`Hubungi WhatsApp Cabang (${b.phone})`}
                          >
                            <Phone size={13} />
                            <span>Hub</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Edit Cabang"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Hapus Cabang"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Cabang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedBranch ? "Edit Data Tempat / Cabang" : "Tambah Tempat / Cabang Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kode Cabang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: CBG-001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Tempat / Cabang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Cabang Nongkosawit"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Cabang
                </label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Nongkosawit No. 45, Gunungpati"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp / Telp Cabang
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveBranch"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveBranch" className="font-medium text-slate-700 dark:text-slate-300">
                  Status Cabang Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 rounded-xl ${themeColors.bg} text-white font-semibold hover:opacity-90 transition-opacity`}
                >
                  {saving ? "Menyimpan..." : "Simpan Cabang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
