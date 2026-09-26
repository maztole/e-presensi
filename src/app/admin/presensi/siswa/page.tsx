"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  UserCheck,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  Send,
  Plus,
  RefreshCw,
  QrCode,
  Sparkles,
  CalendarDays,
  GraduationCap,
  Edit,
  Trash2,
  Eye,
  Building2,
} from "lucide-react";
import { ManualAttendanceModal } from "@/components/modals/ManualAttendanceModal";
import { ViewAttendanceModal } from "@/components/modals/ViewAttendanceModal";
import { ValidateScheduleModal } from "@/components/modals/ValidateScheduleModal";

interface StudentAttendanceItem {
  id: string;
  studentId: string;
  studentName: string;
  branchName?: string;
  gradeLevel?: string;
  sessionInfo: string;
  date: string;
  fullDateFormatted?: string;
  timeIn: string;
  status: "HADIR" | "TIDAK_HADIR";
  notes?: string;
  parentPhone?: string;
  tentorName?: string;
  tutorId?: string;
  branchId?: string;
}

interface ScheduledItem {
  id: string;
  scheduleId: string;
  studentId: string;
  studentName: string;
  nis?: string;
  branchName?: string;
  branchId?: string;
  tutorId?: string;
  tentorName?: string;
  gradeLevel?: string;
  sessionInfo: string;
  startTime?: string;
  endTime?: string;
  date: string;
  dayName?: string;
  parentPhone?: string;
  parentName?: string;
  status: string;
  notes?: string;
  isValidated: boolean;
  timeIn?: string;
}

export default function StudentAttendancePage() {
  const { settings, themeColors } = useThemeCMS();
  const [attendances, setAttendances] = useState<StudentAttendanceItem[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [dayName, setDayName] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "VALIDATED">("PENDING");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<StudentAttendanceItem | null>(null);
  const [selectedViewItem, setSelectedViewItem] = useState<StudentAttendanceItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedValidateItem, setSelectedValidateItem] = useState<ScheduledItem | null>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [notificationSent, setNotificationSent] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendances?date=${selectedDate}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setAttendances(data.data || []);
        setScheduledItems(data.scheduledItems || []);
        setDayName(data.dayName || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [selectedDate]);

  const handleQuickValidate = async (
    sch: ScheduledItem,
    status: "HADIR" | "TIDAK_HADIR"
  ) => {
    setValidatingId(sch.id);
    try {
      const isExisting = sch.isValidated && !sch.id.startsWith("sch-");
      const url = "/api/attendances";
      const method = isExisting ? "PUT" : "POST";
      const body = isExisting
        ? { id: sch.id, status, notes: `Divalidasi ulang (${status})` }
        : {
            studentId: sch.studentId,
            branchId: sch.branchId,
            tutorId: sch.tutorId,
            tentorName: sch.tentorName,
            date: sch.date,
            startTime: sch.startTime,
            endTime: sch.endTime,
            sessionInfo: sch.sessionInfo,
            status,
            notes: `Divalidasi dari jadwal (${status})`,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Gagal memvalidasi presensi.");
        return;
      }

      setNotificationSent(`Presensi "${sch.studentName}" berhasil divalidasi (${status})!`);
      setTimeout(() => setNotificationSent(null), 3500);
      fetchAttendances();
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat validasi presensi.");
    } finally {
      setValidatingId(null);
    }
  };

  const handleOpenValidateModal = (item: ScheduledItem) => {
    setSelectedValidateItem(item);
    setIsValidateModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingAttendance(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: StudentAttendanceItem) => {
    setEditingAttendance(item);
    setIsModalOpen(true);
  };

  const handleOpenView = (item: StudentAttendanceItem) => {
    setSelectedViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data presensi siswa "${name}"?`)) return;
    try {
      const res = await fetch(`/api/attendances?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal menghapus data presensi.");
        return;
      }
      setNotificationSent(`Data presensi "${name}" berhasil dihapus.`);
      setAttendances((prev) => prev.filter((a) => a.id !== id));
      setTimeout(() => setNotificationSent(null), 3000);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menghapus presensi.");
    }
  };

  const handleSendWA = (studentName: string, status: string, parentPhone?: string, parentName?: string, time?: string) => {
    let clean = parentPhone ? parentPhone.replace(/[^0-9]/g, "") : "";
    if (!clean) {
      alert(`Nomor WhatsApp orang tua untuk siswa "${studentName}" belum terdaftar.`);
      return;
    }
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }

    const savedTemplate = typeof window !== "undefined" ? localStorage.getItem("epresensi_wa_template") : null;
    let msg = savedTemplate || `Halo Bapak/Ibu {nama_ortu}, menginformasikan bahwa {nama_siswa} pada tanggal {tanggal} pukul {jam} telah melakukan presensi di {nama_bimbel} dengan status: *{status}*. Terima kasih.`;
    
    const todayFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    msg = msg
      .replace(/{nama_ortu}/g, parentName || `wali dari ${studentName}`)
      .replace(/{nama_siswa}/g, studentName)
      .replace(/{tanggal}/g, todayFormatted)
      .replace(/{jam}/g, time || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
      .replace(/{status}/g, status)
      .replace(/{nama_bimbel}/g, settings.lesName || "Tempat Les");

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    setNotificationSent(`Notifikasi WA terkirim untuk ${studentName}!`);
    setTimeout(() => setNotificationSent(null), 3000);
  };

  const filtered = attendances.filter((item) => {
    const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (item.gradeLevel?.toLowerCase().includes(search.toLowerCase()));
    const matchClass = selectedClass === "ALL" || item.gradeLevel === selectedClass;
    const matchDate = !item.date || item.date === selectedDate;
    return matchSearch && matchClass && matchDate;
  });

  const pendingItems = scheduledItems.filter((s) => !s.isValidated);
  const validatedItems = scheduledItems.filter((s) => s.isValidated);

  const filteredPending = pendingItems.filter((item) => {
    const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (item.gradeLevel?.toLowerCase().includes(search.toLowerCase()));
    const matchClass = selectedClass === "ALL" || item.gradeLevel === selectedClass;
    return matchSearch && matchClass;
  });

  const filteredValidated = validatedItems.filter((item) => {
    const matchSearch = item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (item.gradeLevel?.toLowerCase().includes(search.toLowerCase()));
    const matchClass = selectedClass === "ALL" || item.gradeLevel === selectedClass;
    return matchSearch && matchClass;
  });

  const getStatusBadge = (status: StudentAttendanceItem["status"]) => {
    switch (status) {
      case "HADIR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} /> Hadir
          </span>
        );
      case "TIDAK_HADIR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle size={12} /> Tidak Hadir
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <UserCheck size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Presensi Siswa Hari Ini
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola kehadiran harian, absensi manual, dan broadcast notifikasi WhatsApp ke wali siswa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAttendances}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notificationSent && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notificationSent}</span>
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
            placeholder="Cari nama siswa atau kelas..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kelas</option>
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
              <option value="Alumni / UTBK">Alumni / Intensif UTBK</option>
            </optgroup>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab Navigation: Perlu Validasi vs Sudah Divalidasi */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "PENDING"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Clock size={16} />
          <span>Jadwal Perlu Validasi</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            {filteredPending.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("VALIDATED")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "VALIDATED"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Sudah Divalidasi</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            {filtered.length}
          </span>
        </button>
      </div>

      {/* Tab 1 Content: Jadwal Perlu Validasi */}
      {activeTab === "PENDING" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-0">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-amber-50/40 via-blue-50/20 to-purple-50/30 dark:from-slate-800/40 dark:to-slate-800/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Jadwal Siswa Hari {dayName || "Ini"} yang Belum Divalidasi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {filteredPending.length} Siswa
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daftar siswa yang terjadwal aktif hari {dayName}. Klik tombol <strong>Validasi</strong> untuk konfirmasi kehadiran, tentor & materi jurnal.
                </p>
              </div>
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/80" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Semua jadwal siswa untuk hari <span className="text-blue-600 dark:text-blue-400">{dayName}</span> sudah divalidasi!
              </p>
              <p className="text-[11px] text-slate-400">
                Tidak ada jadwal tertunda yang perlu divalidasi.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-3 py-3">Cabang</th>
                    <th className="px-3 py-3">Jam Jadwal</th>
                    <th className="px-3 py-3">Tentor Default</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPending.map((sch) => (
                    <tr
                      key={sch.id}
                      className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full font-bold flex items-center justify-center text-[11px] shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {sch.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{sch.studentName}</span>
                              {sch.gradeLevel && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {sch.gradeLevel}
                                </span>
                              )}
                            </div>
                            {sch.parentPhone && (
                              <div className="text-[10px] text-slate-400">Ortu: {sch.parentPhone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <Building2 size={11} className="text-slate-400" />
                          <span>{sch.branchName || "Cabang Utama"}</span>
                        </span>
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-200">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                          <Clock size={11} className="text-blue-500" />
                          <span>{sch.sessionInfo} WIB</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                          <GraduationCap size={12} className="text-purple-500 shrink-0" />
                          <span className="truncate max-w-32.5">{sch.tentorName || "-"}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock size={10} /> Belum Validasi
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenValidateModal(sch)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer ${themeColors.bg} ${themeColors.hover} text-white`}
                            title="Buka Modal Validasi Kehadiran"
                          >
                            <CheckCircle2 size={13} />
                            <span>Validasi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Presensi Sudah Divalidasi */}
      {activeTab === "VALIDATED" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-0">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-emerald-50/40 via-teal-50/20 to-blue-50/30 dark:from-slate-800/40 dark:to-slate-800/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Daftar Presensi Sudah Divalidasi</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {filtered.length} Presensi
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daftar seluruh presensi siswa yang sudah tercatat & tervalidasi pada tanggal terpilih.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Nama Siswa</th>
                  <th className="px-3 py-3.5">Cabang</th>
                  <th className="px-3 py-3.5">Hari & Tanggal</th>
                  <th className="px-3 py-3.5">Tentor Pengampu</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <div className="space-y-1">
                        <CalendarDays className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Belum ada data presensi yang divalidasi pada tanggal ini.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              <span>{item.studentName}</span>
                              {item.gradeLevel && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {item.gradeLevel}
                                </span>
                              )}
                            </div>
                            {item.parentPhone && (
                              <div className="text-[10px] text-slate-400">Ortu: {item.parentPhone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <Building2 size={11} className="text-slate-400" />
                          <span>{item.branchName || "Cabang Utama"}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-blue-500 shrink-0" />
                          <span>{item.fullDateFormatted || item.date}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-purple-700 dark:text-purple-300">
                        <div className="flex items-center gap-1">
                          <GraduationCap size={13} className="text-purple-500 shrink-0" />
                          <span className="truncate max-w-32.5">{item.tentorName || "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenView(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                            title="Detail / View Jurnal"
                          >
                            <Eye size={12} className="text-slate-500" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                            title="Edit Presensi"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.studentName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                            title="Hapus Presensi"
                          >
                            <Trash2 size={12} />
                            <span>Hapus</span>
                          </button>
                          <button
                            onClick={() => handleSendWA(item.studentName, item.status, item.parentPhone, undefined, item.timeIn)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
                            title="Kirim WA Wali"
                          >
                            <Send size={11} />
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
      )}

      <ValidateScheduleModal
        isOpen={isValidateModalOpen}
        item={selectedValidateItem}
        onClose={() => {
          setIsValidateModalOpen(false);
          setSelectedValidateItem(null);
        }}
        onSuccess={() => {
          setNotificationSent(`Presensi "${selectedValidateItem?.studentName}" berhasil divalidasi!`);
          setTimeout(() => setNotificationSent(null), 3500);
          fetchAttendances();
        }}
      />

      <ViewAttendanceModal
        isOpen={isViewModalOpen}
        item={selectedViewItem}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedViewItem(null);
        }}
        onEdit={handleOpenEdit}
        onSendWA={handleSendWA}
      />

      <ManualAttendanceModal
        isOpen={isModalOpen}
        initialData={editingAttendance}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAttendance(null);
          fetchAttendances();
        }}
      />
    </div>
  );
}
