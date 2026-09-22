import React from "react";
import { Clock, MapPin, User, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ScheduleItem {
  id: string;
  className: string;
  subject: string;
  tutor: string;
  room: string;
  time: string;
  studentsAttended: number;
  totalStudents: number;
  status: "ongoing" | "upcoming" | "completed";
}

const mockSchedules: ScheduleItem[] = [
  {
    id: "1",
    className: "Kelas 12 SMA - Intensif UTBK",
    subject: "Matematika Saintek",
    tutor: "Kak Aris Munandar, S.Si.",
    room: "Ruang Newton (Lt. 2)",
    time: "14:00 - 15:30",
    studentsAttended: 12,
    totalStudents: 12,
    status: "ongoing",
  },
  {
    id: "2",
    className: "Kelas 9 SMP - Persiapan ASPD",
    subject: "Bahasa Inggris",
    tutor: "Kak Dinda Rahma, S.Pd.",
    room: "Ruang Einstein (Lt. 1)",
    time: "15:45 - 17:15",
    studentsAttended: 0,
    totalStudents: 8,
    status: "upcoming",
  },
  {
    id: "3",
    className: "Private 1-on-1 SD",
    subject: "Calistung & Sains Dasar",
    tutor: "Kak Bayu Pratama",
    room: "Ruang Privat A",
    time: "16:00 - 17:00",
    studentsAttended: 0,
    totalStudents: 1,
    status: "upcoming",
  },
  {
    id: "4",
    className: "Kelas 11 SMA - Reguler",
    subject: "Fisika Dasar",
    tutor: "Kak Rian Hidayat, M.Si.",
    room: "Ruang Galileo (Lt. 2)",
    time: "10:00 - 11:30",
    studentsAttended: 9,
    totalStudents: 10,
    status: "completed",
  },
];

export function TodaySchedule() {
  const getStatusBadge = (status: ScheduleItem["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Sedang Berjalan
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Akan Datang
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            Jadwal Sesi Hari Ini
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar kelas dan sesi bimbingan yang aktif
          </p>
        </div>
        <Link
          href="/admin/akademik/jadwal"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Semua <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {mockSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {schedule.className}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 font-medium text-slate-700 dark:text-slate-300">
                  {schedule.subject}
                </span>
                {getStatusBadge(schedule.status)}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>{schedule.tutor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{schedule.room}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>{schedule.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-700/50">
              <div className="text-left sm:text-right">
                <p className="text-[11px] text-slate-400">Kehadiran</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {schedule.studentsAttended} / {schedule.totalStudents} Siswa
                </p>
              </div>
              <Link
                href={`/admin/presensi/siswa?jadwalId=${schedule.id}`}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Absensi
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
