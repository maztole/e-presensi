"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  HeartHandshake,
  Search,
  Phone,
  Send,
  CheckCircle2,
  RefreshCw,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EditParentModal } from "@/components/modals/EditParentModal";

interface ParentItem {
  id: string;
  parentName: string;
  parentPhone: string;
  studentName: string;
  gradeLevel: string;
}

export default function ParentsManagementPage() {
  const { settings, themeColors } = useThemeCMS();
  const [parents, setParents] = useState<ParentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<ParentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      const list = data?.data || (Array.isArray(data) ? data : []);
      if (list && list.length > 0) {
        const formatted = list
          .filter((s: any) => s.parentName || s.parentPhone)
          .map((s: any) => ({
            id: s.id,
            parentName: s.parentName || `Wali dari ${s.name}`,
            parentPhone: s.parentPhone || s.phone || "081234567890",
            studentName: s.name,
            gradeLevel: s.gradeLevel || "Kelas Belum Set",
          }));
        setParents(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleDeleteParent = async (studentId: string, parentName: string) => {
    if (!confirm(`Yakin ingin menghapus kontak orang tua ${parentName}?`)) return;
    try {
      await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          parentName: "",
          parentPhone: "",
        }),
      });
      setParents((prev) => prev.filter((p) => p.id !== studentId));
      setNotice(`Kontak orang tua ${parentName} telah dihapus.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (parent: ParentItem) => {
    setSelectedParent(parent);
    setIsEditModalOpen(true);
  };

  const handleBroadcastWA = (parentName: string, studentName: string, phone: string) => {
    let clean = phone ? phone.replace(/[^0-9]/g, "") : "";
    if (!clean) {
      alert(`Nomor WhatsApp untuk orang tua ${parentName} belum terdaftar.`);
      return;
    }
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    const msg = `Halo Bapak/Ibu ${parentName} (Wali dari ${studentName}). Kami dari admin ${settings.lesName} ingin menginformasikan terkait kehadiran dan perkembangan belajar ${studentName}. Terima kasih.`;
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    setNotice(`Membuka WhatsApp untuk ${parentName}...`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filtered = parents.filter(
    (p) =>
      p.parentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const [sortKey, setSortKey] = useState<string>("parentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedParents = useMemo(() => {
    return [...filtered].sort((a: ParentItem, b: ParentItem) => {
      const aVal = String(a[sortKey as keyof ParentItem] ?? "").trim();
      const bVal = String(b[sortKey as keyof ParentItem] ?? "").trim();
      const cmp = aVal.localeCompare(bVal, "id", { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDirection]);

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
        {isActive && sortDirection === "asc" && <ArrowUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
        {isActive && sortDirection === "desc" && <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
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
              <HeartHandshake size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Data Orang Tua / Wali Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Daftar kontak orang tua siswa untuk koordinasi laporan presensi dan perkembangan belajar.
          </p>
        </div>

        <button
          onClick={fetchParents}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama orang tua atau nama siswa..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length} Wali Siswa</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">{renderSortableHeader("Nama Orang Tua / Wali", "parentName")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Siswa (Anak)", "studentName")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Kelas Siswa", "gradeLevel")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Nomor WhatsApp", "parentPhone")}</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedParents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-xs">
                        {item.parentName.charAt(0)}
                      </div>
                      <span>{item.parentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-200">
                    {item.studentName}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                    {item.gradeLevel}
                  </td>
                  <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">
                    {item.parentPhone}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleBroadcastWA(item.parentName, item.studentName, item.parentPhone)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors active:scale-95 cursor-pointer"
                        title="Kirim Pesan WhatsApp"
                      >
                        <Phone size={13} />
                        <span>Hub</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                        title="Edit Data Orang Tua"
                      >
                        <Edit size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteParent(item.id, item.parentName)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                        title="Hapus Kontak Orang Tua"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditParentModal
        isOpen={isEditModalOpen}
        parent={selectedParent}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParent(null);
        }}
        onSave={fetchParents}
      />
    </div>
  );
}
