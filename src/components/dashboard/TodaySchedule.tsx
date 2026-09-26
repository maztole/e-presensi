"use client";

import React, { useEffect, useState } from "react";
import { Clock, MapPin, User, ChevronRight, Loader2 } from "lucide-react";
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

export function TodaySchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    try {
      const sess = localStorage.getItem("user_session");
      if (sess) {
        const parsed = JSON.parse(sess);
        if (parsed.role) setUserRole(parsed.role);
      }
    } catch {}
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/today", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.schedules) {
          setSchedules(json.data.schedules);
        }
      } catch (e) {
        console.error("Gagal memuat jadwal hari ini:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
          href={userRole === "tutor" ? "/tutor/presensi" : "/admin/presensi/siswa"}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Presensi <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Tidak ada jadwal sesi aktif untuk hari ini.
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
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
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>{schedule.tutor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{schedule.room}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>{schedule.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-800">
                {getStatusBadge(schedule.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
