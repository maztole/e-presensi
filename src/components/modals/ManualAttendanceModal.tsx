"use client";

import React, { useState } from "react";
import { X, UserCheck, Check, Search, Calendar, Clock, Edit3 } from "lucide-react";

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  onSave,
}: ManualAttendanceModalProps) {
  const [role, setRole] = useState<"siswa" | "tutor">("siswa");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedClass, setSelectedClass] = useState("Kelas 12 SMA - UTBK");
  const [status, setStatus] = useState<"hadir" | "terlambat" | "izin" | "sakit" | "alpa">("hadir");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const mockUsers = role === "siswa" 
    ? ["Ahmad Rizky (SMA 12)", "Siti Nurhaliza (SMA 12)", "Budi Santoso (SMP 9)", "Clarissa Putri (SD)"]
    : ["Kak Aris Munandar, S.Si.", "Kak Dinda Rahma, S.Pd.", "Kak Bayu Pratama", "Kak Rian Hidayat, M.Si."];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSave) {
        onSave({ role, selectedUser, selectedClass, status, notes });
      }
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Edit3 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Input Presensi Manual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Catat kehadiran atau pengajuan izin siswa & tentor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <Check size={28} />
            </div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              Presensi Berhasil Dicatat!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data kehadiran telah diperbarui di sistem
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Peran Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Kategori Pengguna
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole("siswa");
                    setSelectedUser("");
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === "siswa"
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("tutor");
                    setSelectedUser("");
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    role === "tutor"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  Tentor / Pengajar
                </button>
              </div>
            </div>

            {/* Nama Pengguna */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Pilih Nama {role === "siswa" ? "Siswa" : "Tentor"}
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Nama {role === "siswa" ? "Siswa" : "Tentor"} --</option>
                {mockUsers.map((u, i) => (
                  <option key={i} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Class / Session */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Kelas / Sesi Les Hari Ini
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Kelas 12 SMA - UTBK">Kelas 12 SMA - Intensif UTBK</option>
                <option value="Kelas 9 SMP - Persiapan ASPD">Kelas 9 SMP - Persiapan ASPD</option>
                <option value="Private SD">Private 1-on-1 SD</option>
                <option value="Kelas 11 SMA - Reguler">Kelas 11 SMA - Reguler</option>
              </select>
            </div>

            {/* Status Presensi */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Status Kehadiran
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: "hadir", label: "Hadir", color: "emerald" },
                  { id: "terlambat", label: "Terlambat", color: "amber" },
                  { id: "izin", label: "Izin", color: "blue" },
                  { id: "sakit", label: "Sakit", color: "violet" },
                  { id: "alpa", label: "Alpha", color: "rose" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      status === st.id
                        ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan / Alasan */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Catatan / Alasan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Surat izin sakit dilampirkan via WA orang tua..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                Simpan Presensi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
