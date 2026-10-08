"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Clock, UserCheck, GraduationCap, Building2, Calendar, FileText, BookOpen } from "lucide-react";
import { useThemeCMS } from "@/context/ThemeContext";

export interface ScheduledItemToValidate {
  id: string;
  scheduleId?: string;
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
  status: string;
  notes?: string;
  materi?: string; // Materi/topik pelajaran
  isValidated: boolean;
  parentPhone?: string;
  parentName?: string;
}

interface ValidateScheduleModalProps {
  isOpen: boolean;
  item: ScheduledItemToValidate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ValidateScheduleModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: ValidateScheduleModalProps) {
  const { themeColors } = useThemeCMS();
  const [tutors, setTutors] = useState<any[]>([]);
  const [tentorNameInput, setTentorNameInput] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [startTime, setStartTime] = useState("15:30");
  const [endTime, setEndTime] = useState("17:00");
  const [status, setStatus] = useState<"HADIR" | "TIDAK_HADIR">("HADIR");
  const [materi, setMateri] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchTutors();
      setStatus(item.status === "TIDAK_HADIR" ? "TIDAK_HADIR" : "HADIR");
      setMateri(item.materi || "");
      setNotes(item.notes && item.notes !== "Menunggu validasi tentor" ? item.notes : "");
      setTentorNameInput(item.tentorName && item.tentorName !== "-" ? item.tentorName : "");
      setSelectedTutorId(item.tutorId || "");

      if (item.startTime) setStartTime(item.startTime);
      if (item.endTime) setEndTime(item.endTime);

      if (!item.startTime && item.sessionInfo && item.sessionInfo.includes("-")) {
        const parts = item.sessionInfo.split("-").map((s) => s.trim());
        if (parts[0]) setStartTime(parts[0]);
        if (parts[1]) setEndTime(parts[1]);
      }
    }
  }, [isOpen, item]);

  const fetchTutors = async () => {
    try {
      const res = await fetch("/api/tutors", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setTutors(data.data);
        if (item?.tutorId) {
          setSelectedTutorId(item.tutorId);
          const found = data.data.find((t: any) => t.id === item.tutorId);
          if (found) setTentorNameInput(found.name);
        } else if (item?.tentorName) {
          const found = data.data.find((t: any) => t.name.toLowerCase() === item.tentorName?.toLowerCase());
          if (found) {
            setSelectedTutorId(found.id);
            setTentorNameInput(found.name);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedTutorObj = tutors.find((t) => t.id === selectedTutorId);
      const finalTutorId = selectedTutorId || selectedTutorObj?.id || item.tutorId || null;
      const finalTentorName = selectedTutorObj?.name || tentorNameInput || item.tentorName || null;

      const isExisting = item.isValidated && !item.id.startsWith("sch-");
      const url = "/api/attendances";
      const method = isExisting ? "PUT" : "POST";

      const payload = isExisting
        ? {
            id: item.id,
            studentId: item.studentId,
            studentName: item.studentName,
            status,
            date: item.date,
            startTime,
            endTime,
            sessionInfo: `${startTime} - ${endTime}`,
            materi: materi || null,
            notes: notes || `Divalidasi dari jadwal (${status})`,
            tentorName: finalTentorName,
            tutorId: finalTutorId,
            branchId: item.branchId,
          }
        : {
            studentId: item.studentId,
            studentName: item.studentName,
            branchId: item.branchId,
            tutorId: finalTutorId,
            tentorName: finalTentorName,
            date: item.date,
            startTime,
            endTime,
            sessionInfo: `${startTime} - ${endTime}`,
            status,
            materi: materi || null,
            notes: notes || `Divalidasi dari jadwal (${status})`,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Gagal memvalidasi presensi.");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memvalidasi presensi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${themeColors.bg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Validasi Presensi Jadwal Siswa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.studentName} ({item.gradeLevel || "Siswa"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Info Card Ringkas */}
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-1.5 text-slate-700 dark:text-slate-200">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-blue-900 dark:text-blue-300 font-bold text-sm">{item.studentName}</span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                {item.branchName || "Cabang Utama"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1"><Calendar size={12} className="text-blue-500" /> {item.date}</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500" /> {item.sessionInfo} WIB</span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-200">Status Kehadiran *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("HADIR")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === "HADIR"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <Check size={14} />
                <span>Hadir</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("TIDAK_HADIR")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === "TIDAK_HADIR"
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <X size={14} />
                <span>Tidak Hadir</span>
              </button>
            </div>
          </div>

          {/* Jam Sesi Les */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <Clock size={12} className="text-blue-500" /> Jam Masuk / Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <Clock size={12} className="text-amber-500" /> Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Tentor Pengampu */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <GraduationCap size={13} className="text-purple-500" /> Tentor Pengampu
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Bisa diganti jika tentor berhalangan</span>
            </div>
            <select
              value={selectedTutorId}
              onChange={(e) => {
                setSelectedTutorId(e.target.value);
                const found = tutors.find((t) => t.id === e.target.value);
                if (found) setTentorNameInput(found.name);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">-- Pilih Tentor Pengampu --</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization || "Tentor"})
                </option>
              ))}
            </select>
          </div>

          {/* Materi / Topik Pelajaran */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <BookOpen size={13} className="text-emerald-500" /> Materi / Topik Pelajaran
            </label>
            <input
              type="text"
              placeholder="Contoh: Matematika - Persamaan Kuadrat Bab 3"
              value={materi}
              onChange={(e) => setMateri(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Catatan / Keterangan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <FileText size={13} className="text-slate-400" /> Catatan / Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Siswa aktif, latihan soal selesai 5 nomor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer`}
            >
              <Check size={16} />
              <span>{submitting ? "Menyimpan..." : "Simpan Validasi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
