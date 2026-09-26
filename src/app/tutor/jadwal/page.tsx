"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  CalendarDays,
  Search,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { ValidateScheduleModal } from "@/components/modals/ValidateScheduleModal";

interface ScheduleItem {
  id: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  days: string;
  sessionTime: string;
  startTime: string;
  endTime: string;
  branchId: string;
  branchName: string;
  tentorName: string;
  tutorId?: string;
  status: "BELUM_PRESENSI" | "HADIR" | "TIDAK_HADIR";
  attendanceId?: string;
  createdAt?: string;
}

export default function TutorSchedulePage() {
  const { themeColors } = useThemeCMS();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedGrade, setSelectedGrade] = useState("ALL");
  const getTodayLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDateStr());
  const [tutorUser, setTutorUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"MY_SCHEDULE" | "ALL_SCHEDULES">("MY_SCHEDULE");

  // Validate Modal
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  useEffect(() => {
    try {
      const sess = localStorage.getItem("user_session");
      if (sess) {
        setTutorUser(JSON.parse(sess));
      }
    } catch {}
  }, []);

  const getDayNameFromDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("-")) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return dayNames[dateObj.getDay()];
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const targetDate = selectedDate || getTodayLocalDateStr();
      const [resSchedules, resBranches] = await Promise.all([
        fetch(`/api/schedules?date=${targetDate}`, { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/branches", { cache: "no-store" }).then((r) => r.json()),
      ]);

      if (resBranches.success && Array.isArray(resBranches.data)) {
        setBranches(resBranches.data);
      }

      if (resSchedules.success && Array.isArray(resSchedules.data)) {
        const data = resSchedules.data;
        const mapped: ScheduleItem[] = data.map((item: any) => ({
          id: item.id,
          studentId: item.studentId || item.student?.id || "",
          studentName: item.studentName || item.student?.name || "-",
          gradeLevel: item.gradeLevel || item.student?.gradeLevel || "SMA",
          days: item.days || "Senin",
          sessionTime: `${item.startTime || "16:00"} - ${item.endTime || "17:30"}`,
          startTime: item.startTime || "16:00",
          endTime: item.endTime || "17:30",
          branchId: item.branchId || item.branch?.id || "",
          branchName: item.branchName || item.branch?.name || "Cabang Pusat",
          tentorName: item.tentorName || item.tutor?.name || "-",
          tutorId: item.tutorId || item.tutor?.id || "",
          status: item.todayStatus || "BELUM_PRESENSI",
          attendanceId: item.attendanceId,
          createdAt: item.createdAt,
        }));
        setSchedules(mapped);
      }
    } catch (err) {
      console.error("Gagal memuat jadwal tentor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [tutorUser, selectedDate]);

  const handleOpenValidate = (item: ScheduleItem) => {
    const targetDate = selectedDate || getTodayLocalDateStr();
    setSelectedSchedule({
      id: item.attendanceId || item.id,
      scheduleId: item.id,
      studentId: item.studentId,
      studentName: item.studentName,
      gradeLevel: item.gradeLevel,
      branchId: item.branchId,
      branchName: item.branchName,
      date: targetDate,
      sessionInfo: `${item.gradeLevel} - ${item.sessionTime}`,
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status === "HADIR" ? "HADIR" : item.status === "TIDAK_HADIR" ? "TIDAK_HADIR" : "HADIR",
      tentorName: item.tentorName !== "-" ? item.tentorName : tutorUser?.name || "",
      tutorId: item.tutorId || tutorUser?.id,
    });
    setIsValidateModalOpen(true);
  };

  const mySchedules = schedules.filter((s) => {
    if (!tutorUser) return true;
    const nameMatch =
      s.tentorName &&
      tutorUser.name &&
      s.tentorName.toLowerCase().trim().includes(tutorUser.name.toLowerCase().trim());
    const idMatch = s.tutorId && s.tutorId === tutorUser.id;
    return nameMatch || idMatch;
  });

  const displaySchedules =
    activeTab === "MY_SCHEDULE"
      ? mySchedules.length > 0
        ? mySchedules
        : schedules
      : schedules;

  const targetDayName = getDayNameFromDate(selectedDate);

  // Parse selected date to compare with schedule createdAt (end of the selected day)
  const selectedDateEndObj = selectedDate ? new Date(selectedDate + "T23:59:59.999") : new Date();

  const filteredSchedules = displaySchedules.filter((s) => {
    const matchSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.days.toLowerCase().includes(search.toLowerCase());
    const matchBranch = selectedBranch === "ALL" || s.branchId === selectedBranch;
    const matchGrade = selectedGrade === "ALL" || s.gradeLevel.toUpperCase().includes(selectedGrade);
    const matchDay = targetDayName
      ? s.days.toLowerCase().includes(targetDayName.toLowerCase())
      : true;
    // Schedules should only appear from their creation date onwards (not in past before creation)
    const matchCreatedAt = !s.createdAt || new Date(s.createdAt) <= selectedDateEndObj;

    return matchSearch && matchBranch && matchGrade && matchDay && matchCreatedAt;
  });

  return (
    <div className="space-y-6">
      {/* Header Page Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
                <CalendarDays size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Jadwal Mengajar Anda
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daftar sesi belajar mengajar siswa yang diampu oleh {tutorUser?.name || "Tentor"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Search & Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama siswa atau hari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            title="Pilih tanggal untuk melihat jadwal hari tersebut"
          />
        </div>

        <div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>
        </div>
      </div>

      {/* Tabs di Atas Data Jadwal */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab("MY_SCHEDULE")}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "MY_SCHEDULE"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <CalendarDays size={16} />
          <span>Jadwal Saya</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold">
            {mySchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ALL_SCHEDULES")}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "ALL_SCHEDULES"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Sparkles size={16} />
          <span>Semua Jadwal</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">
            {schedules.length}
          </span>
        </button>
      </div>

      {/* Grid Schedule Cards */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Memuat jadwal mengajar...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
          Belum ada jadwal mengajar yang cocok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {item.gradeLevel}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-2">
                      {item.studentName}
                    </h3>
                  </div>

                  {item.status === "HADIR" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={13} /> Hadir
                    </span>
                  ) : item.status === "TIDAK_HADIR" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                      <XCircle size={13} /> Tidak Hadir
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <AlertCircle size={13} /> Belum Presensi
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-slate-400 shrink-0" />
                    <span>Tentor: <strong className="text-slate-800 dark:text-slate-200">{item.tentorName || "-"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-400 shrink-0" />
                    <span>Hari: <strong className="text-slate-800 dark:text-slate-200">{targetDayName || item.days}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span>Jam: <strong className="text-slate-800 dark:text-slate-200">{item.sessionTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span>Lokasi: <strong className="text-slate-800 dark:text-slate-200">{item.branchName}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenValidate(item)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  <UserCheck size={15} />
                  <span>Input Presensi Siswa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Validasi Presensi */}
      <ValidateScheduleModal
        isOpen={isValidateModalOpen}
        item={selectedSchedule}
        onClose={() => setIsValidateModalOpen(false)}
        onSuccess={() => fetchSchedules()}
      />
    </div>
  );
}
