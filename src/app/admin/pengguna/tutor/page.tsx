"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  GraduationCap,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Trash2,
  Edit,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AddTutorModal } from "@/components/modals/AddTutorModal";
import { EditTutorModal } from "@/components/modals/EditTutorModal";

interface TutorItem {
  id: string;
  nip: string;
  name: string;
  gender?: string;
  phone: string;
  email?: string;
  specialization?: string;
  status: string;
}

export default function TutorManagementPage() {
  const { settings, themeColors } = useThemeCMS();
  const [tutors, setTutors] = useState<TutorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const url = search ? `/api/tutors?query=${encodeURIComponent(search)}` : "/api/tutors";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setTutors(data.data);
      } else if (Array.isArray(data)) {
        setTutors(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data tentor ${name}?`)) return;
    try {
      await fetch(`/api/tutors?id=${id}`, { method: "DELETE" });
      setTutors((prev) => prev.filter((t) => t.id !== id));
      setNotice(`Data tentor ${name} berhasil dihapus.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (tutor: TutorItem) => {
    setSelectedTutor(tutor);
    setIsEditModalOpen(true);
  };

  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedTutors = useMemo(() => {
    return [...tutors].sort((a: TutorItem, b: TutorItem) => {
      const aVal = String(a[sortKey as keyof TutorItem] ?? "").trim();
      const bVal = String(b[sortKey as keyof TutorItem] ?? "").trim();
      const cmp = aVal.localeCompare(bVal, "id", { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [tutors, sortKey, sortDirection]);

  const renderSortableHeader = (label: string, key: string) => {
    const isActive = sortKey === key;
    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className="inline-flex items-center gap-1.5 text-left font-semibold uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <span>{label}</span>
        {!isActive && <ArrowUpDown className="w-3.5 h-3.5" />}
        {isActive && sortDirection === "asc" && <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
        {isActive && sortDirection === "desc" && <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <GraduationCap size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Data Tentor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Daftar tentor bimbel, pengampu mata pelajaran, dan informasi kontak WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95`}
          >
            <Plus size={16} />
            <span>Tambah Tentor Baru</span>
          </button>
          <button
            onClick={fetchTutors}
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
            placeholder="Cari tentor berdasarkan nama..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">{tutors.length} Tentor</span>
        </div>
      </div>

      {/* Table of Tutors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">{renderSortableHeader("NIP & Nama Tentor", "name")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Jenis Kelamin", "gender")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Email", "email")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Nomor WhatsApp", "phone")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Status", "status")}</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedTutors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada data tentor terdaftar.
                  </td>
                </tr>
              ) : (
                sortedTutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {tutor.name.charAt(0)}
                        </div>
                        <div>
                          <div>{tutor.name}</div>
                          <span className="text-[10px] font-mono text-slate-400 block">NIP: {tutor.nip}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        tutor.gender === "Perempuan"
                          ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 border border-pink-200"
                          : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200"
                      }`}>
                        {tutor.gender || "Laki-laki"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {tutor.email || "-"}
                    </td>
                    <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">
                      {tutor.phone || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        {tutor.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tutor.phone && (
                          <a
                            href={`https://wa.me/${tutor.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Tentor ${tutor.name}, kami menginformasikan mengenai jadwal & presensi mengajar di ${settings.lesName}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors"
                            title={`Hubungi WA Tentor (${tutor.phone})`}
                          >
                            <Phone size={13} />
                            <span>Hub</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(tutor)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Edit Data Tentor"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(tutor.id, tutor.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Hapus Tentor"
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

      <AddTutorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={fetchTutors}
      />

      <EditTutorModal
        isOpen={isEditModalOpen}
        tutor={selectedTutor}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTutor(null);
        }}
        onSave={fetchTutors}
      />
    </div>
  );
}
