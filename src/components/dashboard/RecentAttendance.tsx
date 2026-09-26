"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  name: string;
  role: "siswa" | "tutor";
  classOrSubject: string;
  timestamp: string;
  status: "hadir" | "tidak_hadir";
}

export function RecentAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/today", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.recentActivities) {
          setRecords(json.data.recentActivities);
        }
      } catch (e) {
        console.error("Gagal memuat riwayat presensi terbaru:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "hadir":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} /> Hadir
          </span>
        );
      case "tidak_hadir":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle size={12} /> Tidak Hadir
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            Aktivitas Presensi Terbaru
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log kehadiran real-time hari ini
          </p>
        </div>
        <Link
          href="/admin/presensi/riwayat"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Rekap <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : records.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Belum ada aktivitas presensi yang tercatat hari ini.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((record) => (
            <div
              key={record.id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    record.role === "tutor"
                      ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {record.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {record.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        record.role === "tutor"
                          ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {record.role === "tutor" ? "Tutor" : "Siswa"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {record.classOrSubject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {record.timestamp}
                  </p>
                </div>
                {getStatusBadge(record.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
