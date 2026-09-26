"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  GraduationCap,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CalendarDays,
  Building2,
  Trash2,
  CheckCircle2,
  X,
  UserCheck,
  Edit,
  Eye,
  Send,
} from "lucide-react";
import { ViewTutorAttendanceModal } from "@/components/modals/ViewTutorAttendanceModal";

interface TutorAttendanceItem {
  id: string;
  tutorId: string;
  tutorName: string;
  branchId?: string;
  branchName?: string;
  sessionTopic?: string;
  gradeLevel?: string;
  teachingHours: number;
  date: string;
  fullDateFormatted?: string;
  timeIn?: string;
  timeOut?: string;
  timeDisplay?: string;
  status: string;
  notes?: string;
}

export default function TutorAttendancePage() {
  const { settings, themeColors } = useThemeCMS();
  const [attendances, setAttendances] = useState<TutorAttendanceItem[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedViewItem, setSelectedViewItem] = useState<TutorAttendanceItem | null>(null);
  const [editingItem, setEditingItem] = useState<TutorAttendanceItem | null>(null);

  // Form state
  const [tutorName, setTutorName] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [gradeLevel, setGradeLevel] = useState("SMA");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:30");
  const [sessionTopic, setSessionTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTutorsAndBranches = async () => {
    try {
      const [resTutors, resBranches] = await Promise.all([
        fetch("/api/tutors").then((r) => r.json()),
        fetch("/api/branches").then((r) => r.json()),
      ]);
      if (resTutors.success && Array.isArray(resTutors.data)) {
        setTutors(resTutors.data);
      }
      if (resBranches.success && Array.isArray(resBranches.data)) {
        setBranches(resBranches.data);
        if (resBranches.data.length > 0 && !selectedBranchId) {
          setSelectedBranchId(resBranches.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTutorAttendances = async (date?: string) => {
    setLoading(true);
    try {
      const d = date ?? selectedDate;
      const res = await fetch(`/api/tutor-attendances?date=${d}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAttendances(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorsAndBranches();
    fetchTutorAttendances(selectedDate);
  }, [selectedDate]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTutorName("");
    if (branches.length > 0) setSelectedBranchId(branches[0].id);
    setGradeLevel("SMA");
    setAttendanceDate(new Date().toISOString().split("T")[0]);
    setStartTime("16:00");
    setEndTime("17:30");
    setSessionTopic("");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TutorAttendanceItem) => {
    setEditingItem(item);
    setTutorName(item.tutorName);
    setSelectedBranchId(item.branchId || (branches.length > 0 ? branches[0].id : ""));
    setGradeLevel(item.gradeLevel || "SMA");
    setAttendanceDate(item.date && item.date !== "-" ? item.date : new Date().toISOString().split("T")[0]);
    setStartTime(item.timeIn && item.timeIn !== "-" ? item.timeIn : "16:00");
    setEndTime(item.timeOut || "17:30");
    setSessionTopic(item.sessionTopic || "");
    setNotes(item.notes && item.notes !== "-" ? item.notes : "");
    setIsModalOpen(true);
  };

  const handleOpenView = (item: TutorAttendanceItem) => {
    setSelectedViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName.trim()) {
      alert("Silakan isi nama tentor!");
      return;
    }
    setSubmitting(true);
    try {
      const matchedTutor = tutors.find(
        (t) => t.name.toLowerCase() === tutorName.trim().toLowerCase()
      );

      const isEdit = !!editingItem;
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit ? { id: editingItem.id } : {}),
        tutorId: matchedTutor?.id || null,
        tutorName: tutorName.trim(),
        branchId: selectedBranchId || (branches.length > 0 ? branches[0].id : null),
        gradeLevel,
        date: attendanceDate,
        startTime,
        endTime,
        sessionTopic: sessionTopic || "Mengajar Reguler",
        teachingHours: 1.0,
        status: "HADIR",
        notes,
      };

      const res = await fetch("/api/tutor-attendances", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setNotice(isEdit ? "Presensi tentor berhasil diperbarui!" : "Presensi tentor berhasil dicatat!");
        setTimeout(() => setNotice(null), 3000);
        fetchTutorAttendances();
      } else {
        alert(data.error || "Gagal menyimpan presensi tentor");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus presensi mengajar tentor "${name}"?`)) return;
    try {
      const res = await fetch(`/api/tutor-attendances?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotice(`Presensi "${name}" berhasil dihapus.`);
        setAttendances((prev) => prev.filter((a) => a.id !== id));
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(data.error || "Gagal menghapus");
      }
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan");
    }
  };

  const handleSendWA = (name: string, tutorId?: string) => {
    const matchedTutor = tutors.find((t) => t.id === tutorId || t.name.toLowerCase() === name.toLowerCase());
    let clean = matchedTutor?.phone ? matchedTutor.phone.replace(/[^0-9]/g, "") : "";
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    const msg = `Halo Tentor ${name}. Menginfokan terkait jadwal dan presensi mengajar di ${settings.lesName}. Terima kasih.`;
    const url = clean ? `https://wa.me/${clean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    setNotice(`Membuka WhatsApp untuk Tentor ${name}...`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filtered = attendances.filter((item) => {
    const matchSearch =
      item.tutorName.toLowerCase().includes(search.toLowerCase()) ||
      (item.branchName && item.branchName.toLowerCase().includes(search.toLowerCase()));
    const matchBranch = !selectedBranchFilter || item.branchId === selectedBranchFilter;
    return matchSearch && matchBranch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <GraduationCap size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Presensi & Log Mengajar Tentor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Rekap kehadiran tentor, jenjang mengajar, cabang, tanggal, dan jam mengajar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTutorAttendances()}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tentor atau topik..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama Tentor</th>
                <th className="px-4 py-3.5">Jenjang Sesi</th>
                <th className="px-4 py-3.5">Cabang</th>
                <th className="px-4 py-3.5">Hari & Tanggal</th>
                <th className="px-4 py-3.5">Jam</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Belum ada log presensi tentor.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* 1. Nama Tentor */}
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {item.tutorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{item.tutorName}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Tentor Pengampu
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Jenjang Sesi */}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        item.gradeLevel === "SD"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          : item.gradeLevel === "SMP"
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      }`}>
                        Jenjang {item.gradeLevel || "SMA"}
                      </span>
                    </td>

                    {/* 3. Cabang Mana */}
                    <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-100">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Building2 size={11} />
                        <span>{item.branchName || "Cabang Utama"}</span>
                      </span>
                    </td>

                    {/* 4. Tanggal */}
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-blue-500 shrink-0" />
                        <span>{item.fullDateFormatted || item.date}</span>
                      </div>
                    </td>

                    {/* 5. Jam */}
                    <td className="px-4 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        <span>{item.timeDisplay || item.timeIn || "-"}</span>
                      </div>
                    </td>

                    {/* 6. Aksi */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 font-semibold transition-all active:scale-95 cursor-pointer"
                          title="Lihat Detail Presensi"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-semibold transition-all active:scale-95 cursor-pointer"
                          title="Edit Presensi Tentor"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.tutorName)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 font-semibold transition-all active:scale-95 cursor-pointer"
                          title="Hapus Presensi Tentor"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                        <button
                          onClick={() => handleSendWA(item.tutorName, item.tutorId)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 font-semibold transition-all active:scale-95 cursor-pointer"
                          title="Hubungi WA Tentor"
                        >
                          <Send size={12} />
                          <span>WA</span>
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

      {/* Modal View Detail Presensi */}
      <ViewTutorAttendanceModal
        isOpen={isViewModalOpen}
        item={selectedViewItem}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedViewItem(null);
        }}
        onEdit={handleOpenEdit}
        onSendWA={handleSendWA}
      />

      {/* Modal Input / Edit Log Mengajar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                    {editingItem ? "Edit Presensi Mengajar Tentor" : "Input Presensi Mengajar Tentor"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {editingItem ? "Perbarui data mengajar dan catatan tentor" : "Catat kehadiran mengajar tentor beserta cabang dan jam belajar"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance} className="p-7 space-y-5 text-sm">
              {/* Nama Tentor */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                  Nama Tentor <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="tutor-names-list-page"
                  required
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Ketik atau pilih nama tentor..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="tutor-names-list-page">
                  {tutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} {t.specialization ? `(${t.specialization})` : ""}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Cabang & Jenjang Sesi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                    Cabang Mengajar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                    Jenjang Sesi Mengajar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SD">Jenjang SD</option>
                    <option value="SMP">Jenjang SMP</option>
                    <option value="SMA">Jenjang SMA / SMK</option>
                    <option value="Alumni">Intensif UTBK / Alumni</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Jam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                    Tanggal Presensi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 text-sm">
                    <Clock size={15} className="text-blue-500" />
                    <span>Jam Masuk</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 text-sm">
                    <Clock size={15} className="text-amber-500" />
                    <span>Jam Selesai</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Catatan / Materi */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                  Catatan / Topik Pembelajaran (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Membahas Bab 2 Kinematika Gerak..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer`}
                >
                  {submitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Simpan Presensi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

