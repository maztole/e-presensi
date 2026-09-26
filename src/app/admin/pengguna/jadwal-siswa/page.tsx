"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  CalendarDays,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  X,
  Check,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    nis: string;
    gradeLevel?: string;
    schoolOrigin?: string;
  };
  branchId: string;
  branch: {
    id: string;
    name: string;
    code: string;
  };
  tutorId?: string | null;
  tutor?: {
    id: string;
    name: string;
    nip: string;
    specialization?: string;
  } | null;
  tentorName?: string | null;
  days: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface StudentOption {
  id: string;
  name: string;
  nis: string;
  gradeLevel?: string;
  branchId?: string;
}

interface BranchOption {
  id: string;
  name: string;
  code: string;
}

interface TutorOption {
  id: string;
  nip: string;
  name: string;
  specialization?: string;
}

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function StudentSchedulePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Memuat Jadwal Siswa...</div>}>
      <StudentScheduleContent />
    </Suspense>
  );
}

function StudentScheduleContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const { themeColors } = useThemeCMS();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedDays, setSelectedDays] = useState<string[]>(["Senin", "Rabu", "Jumat"]);
  const [formData, setFormData] = useState({
    studentId: "",
    branchId: "",
    startTime: "16:00",
    endTime: "17:30",
    tutorId: "",
    isActive: true,
  });

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setBranches(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await fetch("/api/tutors", { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setTutors(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (selectedBranchFilter) params.append("branchId", selectedBranchFilter);

      const res = await fetch(`/api/schedules?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        setSchedules(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStudents();
    fetchTutors();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [search, selectedBranchFilter]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setSelectedDays(["Senin", "Rabu", "Jumat"]);
    setFormData({
      studentId: students.length > 0 ? students[0].id : "",
      branchId: branches.length > 0 ? branches[0].id : "",
      startTime: "16:00",
      endTime: "17:30",
      tutorId: tutors.length > 0 ? tutors[0].id : "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: ScheduleItem) => {
    setEditingSchedule(sch);
    const parsedDays = sch.days
      ? sch.days.split(",").map((d) => d.trim()).filter(Boolean)
      : [];
    setSelectedDays(parsedDays);

    const matchedTutor = tutors.find(
      (t) =>
        t.id === sch.tutorId ||
        (sch.tutor?.name && t.name.toLowerCase().trim() === sch.tutor.name.toLowerCase().trim()) ||
        (sch.tentorName && t.name.toLowerCase().trim() === sch.tentorName.toLowerCase().trim())
    );

    setFormData({
      studentId: sch.studentId,
      branchId: sch.branchId,
      startTime: sch.startTime,
      endTime: sch.endTime,
      tutorId: matchedTutor ? matchedTutor.id : (sch.tutorId || sch.tutor?.id || ""),
      isActive: sch.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.branchId || selectedDays.length === 0 || !formData.startTime || !formData.endTime) {
      alert("Harap pilih Siswa, Cabang Bimbel, minimal satu Hari Belajar, dan Jam Belajar!");
      return;
    }

    const sortedDays = ALL_DAYS.filter((d) => selectedDays.includes(d));
    const daysString = sortedDays.join(", ");

    setSubmitting(true);
    try {
      const selectedTutorObj = tutors.find((t) => t.id === formData.tutorId);
      const url = "/api/schedules";
      const method = editingSchedule ? "PUT" : "POST";
      const tutorIdToSend = (formData.tutorId && selectedTutorObj) ? formData.tutorId : (formData.tutorId || null);
      const tentorNameToSend = selectedTutorObj?.name || (editingSchedule?.tentorName ?? null);
      const bodyPayload = {
        studentId: formData.studentId,
        branchId: formData.branchId,
        days: daysString,
        startTime: formData.startTime,
        endTime: formData.endTime,
        tutorId: tutorIdToSend,
        tentorName: tentorNameToSend,
        isActive: formData.isActive,
        ...(editingSchedule ? { id: editingSchedule.id } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        alert(resData.error || "Gagal menyimpan jadwal.");
        return;
      }

      setNotice(
        editingSchedule
          ? "Jadwal siswa berhasil diperbarui!"
          : "Jadwal siswa baru berhasil ditambahkan!"
      );
      setIsModalOpen(false);
      fetchSchedules();
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Yakin ingin menghapus jadwal untuk "${studentName}"?`)) return;
    try {
      const res = await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Gagal menghapus jadwal.");
        return;
      }
      setNotice(`Jadwal ${studentName} berhasil dihapus.`);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setNotice(null), 3000);
    } catch (e: any) {
      alert(e?.message || "Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <CalendarDays size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Jadwal Belajar Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Atur hari belajar secara fleksibel untuk setiap siswa beserta jam bimbingan dan tentor pengampu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer`}
          >
            <Plus size={16} />
            <span>Tambah Jadwal Siswa</span>
          </button>
          <button
            onClick={fetchSchedules}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <div className="relative flex-1 min-w-45">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari siswa, NIS, hari, tentor..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Total: <span className="font-bold text-slate-800 dark:text-slate-200">{schedules.length} Jadwal</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama Siswa & NIS</th>
                <th className="px-4 py-3.5">Hari Belajar</th>
                <th className="px-4 py-3.5">Waktu Belajar</th>
                <th className="px-4 py-3.5">Tentor Pengampu</th>
                <th className="px-4 py-3.5">Cabang</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {loading ? "Memuat jadwal siswa..." : "Belum ada jadwal siswa terdaftar."}
                  </td>
                </tr>
              ) : (
                schedules.map((sch) => {
                  const tutorDisplay = sch.tutor?.name || sch.tentorName || "-";
                  const tutorSpecialization = sch.tutor?.specialization;

                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {sch.student?.name ? sch.student.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div>
                            <div className="text-sm">{sch.student?.name || "Tanpa Nama"}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              NIS: <span className="font-mono">{sch.student?.nis || "-"}</span> • {sch.student?.gradeLevel || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {sch.days.split(",").map((day, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            >
                              {day.trim()}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span className="font-semibold">{sch.startTime} - {sch.endTime} WIB</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <User size={13} className="text-purple-500 shrink-0" />
                          <span>{tutorDisplay}</span>
                        </div>
                        {tutorSpecialization && (
                          <div className="text-[10px] text-slate-400 ml-4.5">
                            {tutorSpecialization}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium text-xs">
                          <Building2 size={12} className="text-slate-400" />
                          <span>{sch.branch?.name || "Utama"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sch.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                        }`}>
                          <span>{sch.isActive ? "Aktif" : "Nonaktif"}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(sch)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Edit Jadwal Siswa"
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(sch.id, sch.student?.name || "siswa")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors cursor-pointer"
                            title="Hapus Jadwal"
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  {editingSchedule ? "Edit Jadwal Siswa" : "Tambah Jadwal Siswa Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Siswa *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => {
                    const selectedSt = students.find((s) => s.id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      studentId: e.target.value,
                      branchId: selectedSt?.branchId || prev.branchId,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>-- Pilih Siswa --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nis}) - {s.gradeLevel || "Tanpa Jenjang"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cabang Bimbel *
                </label>
                <select
                  required
                  value={formData.branchId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, branchId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>-- Pilih Cabang --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flexible Days Selection (Checkboxes / Chips) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pilih Hari Belajar (Bebas / Fleksibel) *
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {selectedDays.length} Hari Terpilih
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? `${themeColors.bg} text-white border-transparent shadow-xs`
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                        }`}
                      >
                        <span>{day}</span>
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1">Pilih minimal 1 hari belajar.</p>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Select Tentor directly from Tentor Table */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tentor Pengampu (Dari Data Tentor)
                </label>
                <select
                  value={formData.tutorId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tutorId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Tanpa Tentor Khusus --</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.nip}) {t.specialization ? `- ${t.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Jadwal Aktif
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl ${themeColors.bg} ${themeColors.hover} text-white font-semibold text-xs shadow-md transition-all cursor-pointer`}
                >
                  {submitting ? "Menyimpan..." : editingSchedule ? "Simpan Perubahan" : "Tambah Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
