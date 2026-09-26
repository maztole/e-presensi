"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  UserCheck,
  Search,
  CalendarDays,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Edit,
  User,
} from "lucide-react";
import { ViewAttendanceModal } from "@/components/modals/ViewAttendanceModal";
import { ValidateScheduleModal } from "@/components/modals/ValidateScheduleModal";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  branchName: string;
  gradeLevel: string;
  sessionInfo: string;
  date: string;
  fullDateFormatted?: string;
  timeIn: string;
  status: "HADIR" | "TIDAK_HADIR";
  notes?: string;
  tentorName?: string;
  parentPhone?: string;
  parentName?: string;
}

export default function TutorAttendancePage() {
  const { themeColors } = useThemeCMS();
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tutorUser, setTutorUser] = useState<any>(null);

  // Modals
  const [selectedViewItem, setSelectedViewItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedValidateItem, setSelectedValidateItem] = useState<any>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  useEffect(() => {
    try {
      const sess = localStorage.getItem("user_session");
      if (sess) {
        setTutorUser(JSON.parse(sess));
      }
    } catch {}
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendances?date=${selectedDate}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        let list = data.data || [];
        const scheduled = data.scheduledItems || [];

        // Jika belum ada log presensi untuk siswa berjadwal hari ini, tampilkan dari scheduledItems
        if (scheduled.length > 0) {
          const existingStudentIds = new Set(list.map((a: any) => a.studentId));
          const pendingFromSchedule = scheduled.filter((sch: any) => !existingStudentIds.has(sch.studentId));
          list = [...list, ...pendingFromSchedule];
        }

        // Filter log presensi yang ditangani/diampu tentor ini jika login
        if (tutorUser?.name) {
          const nameLower = tutorUser.name.toLowerCase().trim();
          const filtered = list.filter(
            (a: any) =>
              (a.tentorName && a.tentorName.toLowerCase().trim().includes(nameLower)) ||
              (a.recordedBy && a.recordedBy.toLowerCase().trim().includes(nameLower)) ||
              (a.tutorId && a.tutorId === tutorUser.id)
          );
          if (filtered.length > 0) {
            list = filtered;
          }
        }

        const mapped: AttendanceRecord[] = list.map((item: any) => ({
          id: item.id,
          studentId: item.studentId || item.student?.id || "",
          studentName: item.studentName || item.student?.name || "-",
          branchName: item.branchName || item.branch?.name || "Cabang Utama",
          gradeLevel: item.gradeLevel || item.student?.gradeLevel || "SMA",
          sessionInfo: item.sessionInfo || "-",
          date: item.date ? item.date.split("T")[0] : selectedDate,
          fullDateFormatted: item.fullDateFormatted || item.date,
          timeIn: item.timeInDisplay || item.timeIn || "16:00",
          status: item.status === "TIDAK_HADIR" ? "TIDAK_HADIR" : "HADIR",
          notes: item.notes || "",
          tentorName: item.tentorName || tutorUser?.name || "-",
          parentPhone: item.parentPhone || item.student?.parentPhone || "",
          parentName: item.parentName || item.student?.parentName || "",
        }));
        setAttendances(mapped);
      }
    } catch (e) {
      console.error("Gagal memuat presensi siswa:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [selectedDate, tutorUser]);

  const handleSendWA = (
    studentName: string,
    statusStr: string,
    parentPhone?: string,
    parentName?: string
  ) => {
    if (!parentPhone) {
      alert(`Nomor WhatsApp Orang Tua untuk ${studentName} belum diisi.`);
      return;
    }
    let formattedPhone = parentPhone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const message = `Halo Bapak/Ibu ${
      parentName || ""
    }, menginformasikan bahwa siswa ${studentName} pada tanggal ${selectedDate} telah mencatat kehadiran dengan status: *${
      statusStr === "HADIR" ? "HADIR" : "TIDAK HADIR"
    }*. Terima kasih.`;

    window.open(
      `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleOpenView = (item: AttendanceRecord) => {
    setSelectedViewItem({
      ...item,
      sessionInfo: item.sessionInfo,
    });
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (item: AttendanceRecord) => {
    setSelectedValidateItem({
      id: item.id,
      studentId: item.studentId,
      studentName: item.studentName,
      gradeLevel: item.gradeLevel,
      date: item.date,
      sessionInfo: item.sessionInfo,
      startTime: item.timeIn,
      endTime: "17:30",
      status: item.status,
      notes: item.notes,
      tentorName: item.tentorName,
    });
    setIsValidateModalOpen(true);
  };

  const filtered = attendances.filter((a) =>
    a.studentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
              <UserCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Presensi Siswa Hari Ini
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola status kehadiran siswa yang hadir di sesi mengajar Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter & Search */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Presensi Siswa */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama Siswa</th>
                <th className="px-4 py-3.5">Jenjang</th>
                <th className="px-4 py-3.5">Cabang</th>
                <th className="px-4 py-3.5">Waktu / Sesi</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data presensi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada data presensi pada tanggal ini.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {item.studentName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.gradeLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {item.branchName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {item.timeIn}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.status === "HADIR" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={13} /> Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <XCircle size={13} /> Tidak Hadir
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Edit Status"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleSendWA(
                              item.studentName,
                              item.status,
                              item.parentPhone,
                              item.parentName
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Kirim Notifikasi WA Ortu"
                        >
                          <Send size={16} />
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

      {/* Modals */}
      <ViewAttendanceModal
        isOpen={isViewModalOpen}
        item={selectedViewItem}
        onClose={() => setIsViewModalOpen(false)}
        onSendWA={handleSendWA}
      />

      <ValidateScheduleModal
        isOpen={isValidateModalOpen}
        item={selectedValidateItem}
        onClose={() => setIsValidateModalOpen(false)}
        onSuccess={() => fetchAttendances()}
      />
    </div>
  );
}
