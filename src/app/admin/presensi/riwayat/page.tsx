"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Users,
  GraduationCap,
  Calendar,
} from "lucide-react";

type TabType = "siswa" | "tentor";

export default function AttendanceHistoryPage() {
  const { settings, themeColors } = useThemeCMS();
  const [activeTab, setActiveTab] = useState<TabType>("siswa");
  const [attendances, setAttendances] = useState<any[]>([]);
  const [tutorAttendances, setTutorAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [monthFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStudent, resTutor] = await Promise.all([
        fetch(`/api/attendances?month=${monthFilter || ""}`),
        fetch(`/api/tutor-attendances?month=${monthFilter || ""}`),
      ]);
      const dataStudent = await resStudent.json();
      const dataTutor = await resTutor.json();
      if (dataStudent.success && dataStudent.data) {
        setAttendances(dataStudent.data);
      }
      if (dataTutor.success && dataTutor.data) {
        setTutorAttendances(dataTutor.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSiswa = attendances.filter((item) => {
    const matchSearch =
      item.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sessionInfo?.toLowerCase().includes(search.toLowerCase()) ||
      item.materi?.toLowerCase().includes(search.toLowerCase()) ||
      item.notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredTentor = tutorAttendances.filter((item) => {
    const matchSearch =
      item.tutorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sessionTopic?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportToCSV = () => {
    if (activeTab === "siswa") {
      const headers = ["Nama Siswa", "Tentor Pengampu", "Cabang", "Hari & Tanggal", "Jam Mulai - Selesai", "Materi / Topik", "Catatan"];
      const rows = filteredSiswa.map((item) => [
        `"${item.studentName}"`,
        `"${item.tentorName || "-"}"`,
        `"${item.branchName || "-"}"`,
        `"${item.fullDateFormatted || item.date || "-"}"`,
        `"${item.sessionInfo || item.timeIn || "-"}"`,
        `"${item.materi || "-"}"`,
        `"${item.notes || "-"}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rekap_presensi_siswa_${monthFilter || new Date().toISOString().slice(0, 7)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["Nama Tentor", "Cabang", "Tanggal", "Jam Masuk - Keluar", "Status"];
      const rows = filteredTentor.map((item) => [
        `"${item.tutorName}"`,
        `"${item.branchName || "-"}"`,
        `"${item.date}"`,
        `"${item.timeDisplay || item.timeIn || "-"}"`,
        `"${item.status}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rekap_presensi_tentor_${monthFilter || new Date().toISOString().slice(0, 7)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <History size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Riwayat & Rekap Presensi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Laporan riwayat seluruh aktivitas presensi dan ekspor laporan berkala.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Download size={16} />
          <span>Download Rekap CSV</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>File rekap presensi CSV berhasil diunduh!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "siswa"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users size={16} />
          <span>Presensi Siswa</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredSiswa.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tentor")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "tentor"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <GraduationCap size={16} />
          <span>Presensi Tentor</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredTentor.length}
          </span>
        </button>
      </div>

      {/* Filter & Search - Per Bulan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "siswa" ? "Cari nama siswa atau sesi..." : "Cari nama tentor atau topik..."}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400 shrink-0" />
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="HADIR">Hadir</option>
            <option value="TIDAK_HADIR">Tidak Hadir</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {activeTab === "siswa" ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5">Tentor Pengampu</th>
                  <th className="px-4 py-3.5">Cabang</th>
                  <th className="px-4 py-3.5">Hari & Tanggal</th>
                  <th className="px-4 py-3.5">Jam Mulai - Selesai</th>
                  <th className="px-4 py-3.5">Materi / Topik</th>
                  <th className="px-5 py-3.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data presensi siswa.
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {item.studentName}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.tentorName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.branchName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.fullDateFormatted || item.date}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-mono">
                        {item.sessionInfo || item.timeIn || "-"}
                      </td>
                      <td className="px-4 py-4 text-emerald-700 dark:text-emerald-400 font-medium max-w-xs truncate">
                        {item.materi || "-"}
                      </td>
                      <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Nama Tentor</th>
                  <th className="px-4 py-3.5">Cabang</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Jam Masuk - Keluar</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTentor.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data presensi tentor.
                    </td>
                  </tr>
                ) : (
                  filteredTentor.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {item.tutorName}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.branchName || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-mono">
                        {item.date}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-mono">
                        {item.timeDisplay || item.timeIn || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold">{item.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
