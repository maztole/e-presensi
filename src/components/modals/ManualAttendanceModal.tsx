"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Clock, UserCheck } from "lucide-react";
import { useThemeCMS } from "@/context/ThemeContext";

interface StudentOption {
  id: string;
  name: string;
  nis: string;
  gradeLevel?: string;
  branchId?: string;
  branch?: {
    id?: string;
    name: string;
  };
}

export interface AttendanceDataToEdit {
  id: string;
  studentId?: string;
  studentName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  sessionInfo?: string;
  status: "HADIR" | "TIDAK_HADIR";
  notes?: string;
  tentorName?: string;
}

interface ManualAttendanceModalProps {
  isOpen: boolean;
  initialData?: AttendanceDataToEdit | null;
  onClose: () => void;
  onSave?: (data: any) => void;
}

export function ManualAttendanceModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: ManualAttendanceModalProps) {
  const { themeColors } = useThemeCMS();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [studentNameInput, setStudentNameInput] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [tentorNameInput, setTentorNameInput] = useState("");
  const [startTime, setStartTime] = useState("15:30");
  const [endTime, setEndTime] = useState("17:00");
  const [status, setStatus] = useState<"HADIR" | "TIDAK_HADIR">("HADIR");
  const [notes, setNotes] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchTutors();

      if (initialData) {
        setStudentNameInput(initialData.studentName || "");
        setSelectedStudentId(initialData.studentId || "");
        setAttendanceDate(initialData.date || new Date().toISOString().split("T")[0]);
        setStatus(initialData.status || "HADIR");
        setNotes(initialData.notes === "-" ? "" : initialData.notes || "");
        setTentorNameInput(initialData.tentorName === "-" ? "" : initialData.tentorName || "");

        if (initialData.sessionInfo && initialData.sessionInfo.includes("-")) {
          const parts = initialData.sessionInfo.split("-").map((s) => s.trim());
          if (parts[0]) setStartTime(parts[0]);
          if (parts[1]) setEndTime(parts[1]);
        } else {
          setStartTime(initialData.startTime || "15:30");
          setEndTime(initialData.endTime || "17:00");
        }
      } else {
        setStudentNameInput("");
        setSelectedStudentId("");
        setNotes("");
        setStatus("HADIR");
        setAttendanceDate(new Date().toISOString().split("T")[0]);

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMins = String(now.getMinutes()).padStart(2, "0");
        setStartTime(`${currentHours}:${currentMins}`);

        const endH = String((now.getHours() + 1) % 24).padStart(2, "0");
        const endM = String((now.getMinutes() + 30) % 60).padStart(2, "0");
        setEndTime(`${endH}:${endM}`);
      }
    }
  }, [isOpen, initialData]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch("/api/tutors", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setTutors(data.data);
        if (data.data.length > 0 && !tentorNameInput && !initialData) {
          setTentorNameInput(data.data[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToSubmit = studentNameInput.trim();
    if (!nameToSubmit) {
      alert("Silakan isi nama siswa!");
      return;
    }

    setSubmitting(true);
    try {
      const matchedStudent = students.find(
        (s) => s.name.toLowerCase() === nameToSubmit.toLowerCase() || s.id === selectedStudentId
      );

      const matchedTutor = tutors.find(
        (t) => t.name.toLowerCase() === tentorNameInput.trim().toLowerCase()
      );

      const method = initialData ? "PUT" : "POST";
      const payload = {
        ...(initialData ? { id: initialData.id } : {}),
        studentId: matchedStudent?.id || null,
        studentName: nameToSubmit,
        branchId: matchedStudent?.branchId || null,
        tutorId: matchedTutor?.id || null,
        date: attendanceDate,
        startTime,
        endTime,
        sessionInfo: `${startTime} - ${endTime}`,
        status,
        notes,
        tentorName: tentorNameInput || "Kak Admin",
      };

      const res = await fetch("/api/attendances", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        alert(resData.error || "Gagal menyimpan presensi.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSave) {
          onSave(resData.data);
        }
        onClose();
      }, 900);
    } catch (err: any) {
      alert(err?.message || "Terjadi kesalahan saat menyimpan presensi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                {initialData ? "Edit Jurnal & Presensi Siswa" : "Input Presensi Siswa Baru"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {initialData ? "Perbarui detail kehadiran dan catatan belajar siswa" : "Catat presensi kehadiran & jam belajar siswa oleh tentor"}
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

        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <Check size={32} />
            </div>
            <h4 className="font-bold text-xl text-slate-800 dark:text-slate-100">
              {initialData ? "Presensi Berhasil Diperbarui!" : "Presensi Berhasil Dicatat!"}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Data kehadiran siswa telah tersimpan di sistem
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 space-y-5 text-sm">
            {/* 1. Nama Siswa */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                Nama Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="student-names-list"
                value={studentNameInput}
                onChange={(e) => {
                  setStudentNameInput(e.target.value);
                  const matched = students.find((s) => s.name === e.target.value);
                  if (matched) setSelectedStudentId(matched.id);
                }}
                placeholder="Ketik atau pilih nama siswa..."
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="student-names-list">
                {students.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.gradeLevel ? `(${st.gradeLevel})` : ""}
                  </option>
                ))}
              </datalist>
            </div>

            {/* 2. Tentor Pengampu & Tanggal Presensi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                  Tentor Pengampu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="tutor-names-list"
                  value={tentorNameInput}
                  onChange={(e) => setTentorNameInput(e.target.value)}
                  placeholder="Ketik nama tentor..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="tutor-names-list">
                  {tutors.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} {t.specialization ? `(${t.specialization})` : ""}
                    </option>
                  ))}
                </datalist>
              </div>

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
            </div>

            {/* 3. Jam Masuk & Jam Selesai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* 4. Status Kehadiran */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                Status Kehadiran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "HADIR", label: "Hadir" },
                  { id: "TIDAK_HADIR", label: "Tidak Hadir" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                      status === st.id
                        ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Catatan */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2 text-sm">
                Catatan Jurnal Belajar
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Belajar Bab 3 Matriks, aktif bertanya dan menyelesaikan soal latihan dengan baik..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer`}
              >
                {submitting ? "Menyimpan..." : initialData ? "Simpan Perubahan" : "Simpan Presensi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
