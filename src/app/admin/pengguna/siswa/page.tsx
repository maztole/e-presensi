"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Edit,
  Trash2,
  CheckCircle2,
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserCheck,
  Phone,
  CalendarDays,
} from "lucide-react";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { EditStudentModal } from "@/components/modals/EditStudentModal";

interface StudentItem {
  id: string;
  nis: string;
  name: string;
  gender?: string;
  schoolOrigin?: string;
  gradeLevel?: string;
  parentName?: string;
  parentPhone?: string;
  branchId?: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
  createdAt?: string;
}

export default function StudentManagementPage() {
  const { themeColors } = useThemeCMS();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("");
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (selectedBranchFilter) params.append("branchId", selectedBranchFilter);
      if (selectedClassFilter) params.append("gradeLevel", selectedClassFilter);

      const res = await fetch(`/api/students?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setStudents(data.data);
      } else if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedBranchFilter, selectedClassFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data siswa "${name}"?`)) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal menghapus siswa.");
        return;
      }
      setNotice(`Data siswa ${name} berhasil dihapus.`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menghapus data siswa.");
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a: StudentItem, b: StudentItem) => {
      let aVal = "";
      let bVal = "";

      if (sortKey === "branch") {
        aVal = a.branch?.name ?? "";
        bVal = b.branch?.name ?? "";
      } else {
        aVal = String(a[sortKey as keyof StudentItem] ?? "").trim();
        bVal = String(b[sortKey as keyof StudentItem] ?? "").trim();
      }

      const cmp = aVal.localeCompare(bVal, "id", { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [students, sortKey, sortDirection]);

  const renderSortableHeader = (label: string, key: string) => {
    const isActive = sortKey === key;
    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className="inline-flex items-center gap-1.5 text-left font-semibold uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <span>{label}</span>
        {!isActive && <ArrowUpDown className="w-3.5 h-3.5" />}
        {isActive && sortDirection === "asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
        {isActive && sortDirection === "desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <Users size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Data Siswa Bimbel
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola seluruh data siswa, nis, jenjang kelas, cabang, serta data kontak orang tua / wali.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer`}
          >
            <Plus size={16} />
            <span>Tambah Siswa Baru</span>
          </button>
          <button
            onClick={fetchStudents}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh Data"
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

      {/* Filter & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <div className="relative flex-1 min-w-45">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIS, atau asal sekolah..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <option value="">Semua Kelas</option>
            <optgroup label="Sekolah Dasar (SD)">
              <option value="1 SD">Kelas 1 SD</option>
              <option value="2 SD">Kelas 2 SD</option>
              <option value="3 SD">Kelas 3 SD</option>
              <option value="4 SD">Kelas 4 SD</option>
              <option value="5 SD">Kelas 5 SD</option>
              <option value="6 SD">Kelas 6 SD</option>
            </optgroup>
            <optgroup label="Sekolah Menengah Pertama (SMP)">
              <option value="7 SMP">Kelas 7 SMP</option>
              <option value="8 SMP">Kelas 8 SMP</option>
              <option value="9 SMP">Kelas 9 SMP</option>
            </optgroup>
            <optgroup label="SMA / SMK">
              <option value="10 SMA">Kelas 10 SMA</option>
              <option value="11 SMA">Kelas 11 SMA</option>
              <option value="12 SMA">Kelas 12 SMA</option>
              <option value="10 SMK">Kelas 10 SMK</option>
              <option value="11 SMK">Kelas 11 SMK</option>
              <option value="12 SMK">Kelas 12 SMK</option>
              <option value="Alumni / UTBK">Alumni / UTBK</option>
            </optgroup>
          </select>

          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">{students.length} Siswa</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">{renderSortableHeader("Nama Siswa & NIS", "name")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Cabang", "branch")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Jenjang Kelas", "gradeLevel")}</th>
                <th className="px-4 py-3.5">{renderSortableHeader("Asal Sekolah", "schoolOrigin")}</th>
                <th className="px-4 py-3.5">Orang Tua / Wali</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Belum ada data siswa terdaftar.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            NIS: <span className="font-mono">{st.nis}</span> • {st.gender || "Laki-laki"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Building2 size={11} />
                        <span>{st.branch?.name || "Cabang -"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-1">
                        <GraduationCap size={13} className="text-blue-500 shrink-0" />
                        <span>{st.gradeLevel || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      {st.schoolOrigin || "-"}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                      <div>{st.parentName || "-"}</div>
                      {st.parentPhone && (
                        <div className="text-[10px] font-mono text-slate-400">
                          {st.parentPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        st.status === "ACTIVE"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      }`}>
                        <UserCheck size={11} />
                        <span>{st.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/admin/pengguna/jadwal-siswa?query=${encodeURIComponent(st.name)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 font-semibold text-xs transition-colors"
                          title="Lihat / Atur Jadwal Siswa"
                        >
                          <CalendarDays size={13} />
                          <span>Jadwal</span>
                        </a>
                        {st.parentPhone && (
                          <a
                            href={`https://wa.me/${st.parentPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Bapak/Ibu ${st.parentName ? "wali dari " + st.name : ""}, kami menginfokan terkait bimbingan belajar ${st.name}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors"
                            title={`Hubungi WA Orang Tua (${st.parentPhone})`}
                          >
                            <Phone size={13} />
                            <span>Hub</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setEditingStudent(st);
                            setIsEditModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(st.id, st.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                          title="Hapus Data Siswa"
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

      {/* Add & Edit Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => fetchStudents()}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        student={editingStudent}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={() => fetchStudents()}
      />
    </div>
  );
}
