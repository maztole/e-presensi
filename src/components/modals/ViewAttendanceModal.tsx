"use client";

import React from "react";
import {
  X,
  UserCheck,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  FileText,
  Send,
  Edit,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { useThemeCMS } from "@/context/ThemeContext";

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
}

interface ViewAttendanceModalProps {
  isOpen: boolean;
  item: StudentAttendanceItem | null;
  onClose: () => void;
  onEdit?: (item: StudentAttendanceItem) => void;
  onSendWA?: (studentName: string, status: string, parentPhone?: string, parentName?: string, time?: string) => void;
}

export function ViewAttendanceModal({
  isOpen,
  item,
  onClose,
  onEdit,
  onSendWA,
}: ViewAttendanceModalProps) {
  const { themeColors } = useThemeCMS();

  if (!isOpen || !item) return null;

  const getStatusBadge = (status: StudentAttendanceItem["status"]) => {
    switch (status) {
      case "HADIR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={13} /> Hadir
          </span>
        );
      case "TIDAK_HADIR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle size={13} /> Tidak Hadir
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                Detail Presensi & Jurnal
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Informasi lengkap presensi bimbingan belajar siswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 space-y-5 text-sm">
          {/* Main Info Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {item.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>{item.studentName}</span>
                    {item.gradeLevel && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Kelas {item.gradeLevel}
                      </span>
                    )}
                  </h4>
                </div>
              </div>
              <div>{getStatusBadge(item.status)}</div>
            </div>
          </div>

          {/* Grid Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Building2 size={14} className="text-purple-500" /> Cabang Les
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {item.branchName || "Cabang Utama"}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <CalendarDays size={14} className="text-blue-500" /> Hari & Tanggal
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {item.fullDateFormatted || item.date}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" /> Jam Belajar (Masuk - Selesai)
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {item.sessionInfo || "-"}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-emerald-500" /> Tentor Pengampu
              </span>
              <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">
                {item.tentorName || "-"}
              </p>
            </div>
          </div>

          {/* Catatan Jurnal Belajar */}
          <div className="p-5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2">
            <span className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <FileText size={15} /> Catatan Jurnal Belajar
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap min-h-15">
              {item.notes && item.notes !== "-"
                ? item.notes
                : "Tidak ada catatan khusus untuk pembelajaran ini."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-7 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-semibold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Edit size={15} />
                <span>Edit</span>
              </button>
            )}
            {onSendWA && (
              <button
                type="button"
                onClick={() => {
                  onSendWA(item.studentName, item.status, item.parentPhone, undefined, item.timeIn);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Send size={15} />
                <span>Kirim WA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
