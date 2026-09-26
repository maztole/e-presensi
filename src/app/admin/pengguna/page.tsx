"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Users,
  GraduationCap,
  HeartHandshake,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { AddTutorModal } from "@/components/modals/AddTutorModal";
import { EditStudentModal } from "@/components/modals/EditStudentModal";
import { EditTutorModal } from "@/components/modals/EditTutorModal";
import { EditParentModal } from "@/components/modals/EditParentModal";

type StudentRecord = {
  id: string;
  name: string;
  nis: string;
  gradeLevel?: string;
  schoolOrigin?: string;
  parentName?: string;
  parentPhone?: string;
  gender?: string;
  branchId?: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  status: string;
};

type TutorRecord = {
  id: string;
  name: string;
  nip: string;
  email?: string;
  phone: string;
  gender?: string;
  status: string;
};

type ParentRecord = {
  id: string;
  parentName: string;
  studentName: string;
  gradeLevel: string;
  parentPhone: string;
};

export default function PenggunaHubPage() {
  const { themeColors } = useThemeCMS();
  const [tab, setTab] = useState<"siswa" | "tutor" | "orang-tua">("siswa");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Data
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [tutors, setTutors] = useState<TutorRecord[]>([]);
  const [parents, setParents] = useState<ParentRecord[]>([]);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTutorOpen, setIsAddTutorOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorRecord | null>(null);
  const [isEditTutorOpen, setIsEditTutorOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentRecord | null>(null);
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const resS = await fetch("/api/students", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);
      if (resS?.data && Array.isArray(resS.data)) {
        setStudents(resS.data);
        const parentList = resS.data
          .filter((s: any) => s.parentName || s.parentPhone)
          .map((s: any) => ({
            id: s.id,
            parentName: s.parentName || `Wali dari ${s.name}`,
            parentPhone: s.parentPhone || s.phone || "081234567890",
            studentName: s.name,
            gradeLevel: s.gradeLevel || "Kelas Belum Set",
          }));
        setParents(parentList);
      } else if (Array.isArray(resS)) {
        setStudents(resS);
        const parentList = resS
          .filter((s: any) => s.parentName || s.parentPhone)
          .map((s: any) => ({
            id: s.id,
            parentName: s.parentName || `Wali dari ${s.name}`,
            parentPhone: s.parentPhone || s.phone || "081234567890",
            studentName: s.name,
            gradeLevel: s.gradeLevel || "Kelas Belum Set",
          }));
        setParents(parentList);
      }

      const resT = await fetch("/api/tutors", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);
      if (resT?.data && Array.isArray(resT.data)) {
        setTutors(resT.data);
      } else if (Array.isArray(resT)) {
        setTutors(resT);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Hapus data siswa ${name}?`)) return;
    await fetch(`/api/students?id=${id}`, { method: "DELETE" });
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setNotice(`Siswa ${name} berhasil dihapus.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteTutor = async (id: string, name: string) => {
    if (!confirm(`Hapus data tentor ${name}?`)) return;
    await fetch(`/api/tutors?id=${id}`, { method: "DELETE" });
    setTutors((prev) => prev.filter((t) => t.id !== id));
    setNotice(`Tentor ${name} berhasil dihapus.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteParent = async (studentId: string, parentName: string) => {
    if (!confirm(`Hapus kontak orang tua ${parentName}?`)) return;
    await fetch("/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: studentId, parentName: "", parentPhone: "" }),
    });
    setParents((prev) => prev.filter((p) => p.id !== studentId));
    setNotice(`Kontak ${parentName} berhasil dihapus.`);
    setTimeout(() => setNotice(null), 3000);
  };

  type SortDirection = "asc" | "desc";
  type SortConfig = { key: string; direction: SortDirection };

  const [sortConfig, setSortConfig] = useState<Record<"siswa" | "tutor" | "orang-tua", SortConfig>>({
    siswa: { key: "name", direction: "asc" },
    tutor: { key: "name", direction: "asc" },
    "orang-tua": { key: "parentName", direction: "asc" },
  });

  const getSortValue = (item: Record<string, unknown>, key: string) => {
    const rawValue = item[key];

    if (typeof rawValue === "string") return rawValue;
    if (typeof rawValue === "number") return String(rawValue);
    return "";
  };

  const getSortedData = <T extends Record<string, unknown>>(data: T[], key: string, direction: SortDirection) => {
    return [...data].sort((a, b) => {
      const aValue = String(getSortValue(a, key) ?? "").trim();
      const bValue = String(getSortValue(b, key) ?? "").trim();
      const comparison = aValue.localeCompare(bValue, "id", {
        numeric: true,
        sensitivity: "base",
      });

      return direction === "asc" ? comparison : -comparison;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      const current = prev[tab];
      const nextDirection = current?.key === key && current.direction === "asc" ? "desc" : "asc";
      return {
        ...prev,
        [tab]: { key, direction: nextDirection },
      };
    });
  };

  const renderSortIcon = (key: string) => {
    const current = sortConfig[tab];
    if (current?.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5" />;
    }

    return current.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" />
    );
  };

  const renderSortableHeader = (label: string, key: string) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1.5 text-left font-semibold uppercase tracking-wide hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
    >
      <span>{label}</span>
      {renderSortIcon(key)}
    </button>
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase()) ||
      (s.gradeLevel && s.gradeLevel.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredTutors = tutors.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredParents = parents.filter(
    (p) =>
      p.parentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase())
  );

  const studentSort = sortConfig.siswa;
  const tutorSort = sortConfig.tutor;
  const parentSort = sortConfig["orang-tua"];

  const sortedStudents = useMemo(
    () => getSortedData(filteredStudents, studentSort.key, studentSort.direction),
    [filteredStudents, studentSort.key, studentSort.direction]
  );

  const sortedTutors = useMemo(
    () => getSortedData(filteredTutors, tutorSort.key, tutorSort.direction),
    [filteredTutors, tutorSort.key, tutorSort.direction]
  );

  const sortedParents = useMemo(
    () => getSortedData(filteredParents, parentSort.key, parentSort.direction),
    [filteredParents, parentSort.key, parentSort.direction]
  );

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
              Manajemen Pengguna Bimbel
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola data master Siswa, Tentor / Pengajar, dan Orang Tua / Wali secara lengkap (CRUD).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {tab === "tutor" ? (
            <button
              onClick={() => setIsAddTutorOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Tambah Tentor Baru</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddStudentOpen(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95`}
            >
              <Plus size={16} />
              <span>Tambah Siswa Baru</span>
            </button>
          )}
          <button
            onClick={loadData}
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setTab("siswa")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            tab === "siswa"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users size={16} />
          <span>Data Siswa</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setTab("tutor")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            tab === "tutor"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <GraduationCap size={16} />
          <span>Data Tentor</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {tutors.length}
          </span>
        </button>

        <button
          onClick={() => setTab("orang-tua")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            tab === "orang-tua"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <HeartHandshake size={16} />
          <span>Data Orang Tua</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {parents.length}
          </span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari di data ${tab}...`}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {tab === "siswa" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{renderSortableHeader("NIS & Nama Siswa", "name")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Cabang Tempat", "branch")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Jenis Kelamin", "gender")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Kelas Siswa", "gradeLevel")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Sekolah Asal", "schoolOrigin")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Orang Tua / Wali", "parentName")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Status", "status")}</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      Belum ada data siswa.
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div>{s.name}</div>
                            <span className="text-[10px] font-mono text-slate-400 block">NIS: {s.nis}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {s.branch?.name || "Cabang Nongkosawit"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          s.gender === "Perempuan"
                            ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 border border-pink-200"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200"
                        }`}>
                          {s.gender || "Laki-laki"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-blue-600 dark:text-blue-400">{s.gradeLevel || "-"}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{s.schoolOrigin || "-"}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div>{s.parentName || "Wali Siswa"}</div>
                        <span className="text-[10px] font-mono text-slate-400">{s.parentPhone || "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.parentPhone && (
                            <a
                              href={`https://wa.me/${s.parentPhone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Bapak/Ibu wali dari ${s.name}, kami menginfokan terkait kegiatan bimbingan belajar ${s.name}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors"
                              title={`Hubungi WA (${s.parentPhone})`}
                            >
                              <Phone size={13} />
                              <span>Hub</span>
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setIsEditStudentOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Edit Siswa"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Hapus Siswa"
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
          )}

          {tab === "tutor" && (
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
                      Belum ada data tentor.
                    </td>
                  </tr>
                ) : (
                  sortedTutors.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div>{t.name}</div>
                            <span className="text-[10px] font-mono text-slate-400 block">NIP: {t.nip}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          t.gender === "Perempuan"
                            ? "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-400 border border-pink-200"
                            : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200"
                        }`}>
                          {t.gender || "Laki-laki"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{t.email || "-"}</td>
                      <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">{t.phone || "-"}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.phone && (
                            <a
                              href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo Tentor ${t.name}, kami menginfokan koordinasi mengajar di bimbel.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors"
                              title={`Hubungi WA (${t.phone})`}
                            >
                              <Phone size={13} />
                              <span>Hub</span>
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTutor(t);
                              setIsEditTutorOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Edit Tentor"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTutor(t.id, t.name)}
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
          )}

          {tab === "orang-tua" && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">{renderSortableHeader("Nama Orang Tua / Wali", "parentName")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Siswa (Anak)", "studentName")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Kelas Siswa", "gradeLevel")}</th>
                  <th className="px-4 py-3.5">{renderSortableHeader("Nomor WhatsApp", "phone")}</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedParents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      Belum ada data orang tua.
                    </td>
                  </tr>
                ) : (
                  sortedParents.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center text-xs">
                            {p.parentName.charAt(0)}
                          </div>
                          <span>{p.parentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-200">{p.studentName}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">{p.gradeLevel}</td>
                      <td className="px-4 py-4 font-mono text-slate-600 dark:text-slate-300">{p.parentPhone}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const clean = p.parentPhone ? p.parentPhone.replace(/[^0-9]/g, "").replace(/^0/, "62") : "";
                              if (!clean) {
                                alert("Nomor WhatsApp belum terdaftar");
                                return;
                              }
                              const msg = `Halo Bapak/Ibu ${p.parentName} (Wali dari ${p.studentName}). Kami menginfokan terkait bimbingan belajar.`;
                              window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors cursor-pointer"
                            title={`Hubungi WA (${p.parentPhone})`}
                          >
                            <Phone size={13} />
                            <span>Hub</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedParent(p);
                              setIsEditParentOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Edit Orang Tua"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteParent(p.id, p.parentName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Hapus Kontak Orang Tua"
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
          )}
        </div>
      </div>

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        onSave={loadData}
      />

      <AddTutorModal
        isOpen={isAddTutorOpen}
        onClose={() => setIsAddTutorOpen(false)}
        onSave={loadData}
      />

      <EditStudentModal
        isOpen={isEditStudentOpen}
        student={selectedStudent}
        onClose={() => {
          setIsEditStudentOpen(false);
          setSelectedStudent(null);
        }}
        onSave={loadData}
      />

      <EditTutorModal
        isOpen={isEditTutorOpen}
        tutor={selectedTutor}
        onClose={() => {
          setIsEditTutorOpen(false);
          setSelectedTutor(null);
        }}
        onSave={loadData}
      />

      <EditParentModal
        isOpen={isEditParentOpen}
        parent={selectedParent}
        onClose={() => {
          setIsEditParentOpen(false);
          setSelectedParent(null);
        }}
        onSave={loadData}
      />
    </div>
  );
}
