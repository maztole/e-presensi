"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  Users,
  Search,
  GraduationCap,
  Clock,
  Loader2,
} from "lucide-react";

interface StudentReportItem {
  id: string;
  nis: string;
  name: string;
  gradeLevel: string;
  branchName: string;
  totalSessions: number;
  hadir: number;
  tidak_hadir: number;
  attendanceRate: number;
}

interface TutorReportItem {
  id: string;
  nip: string;
  name: string;
  specialization: string;
  totalSessions: number;
  totalHours: number;
  hadir: number;
  tidak_hadir: number;
  attendanceRate: number;
}

type TabType = "siswa" | "tentor";

export default function AttendanceReportPage() {
  const { settings, themeColors } = useThemeCMS();
  const [activeTab, setActiveTab] = useState<TabType>("siswa");
  const [data, setData] = useState<StudentReportItem[]>([]);
  const [tutorData, setTutorData] = useState<TutorReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/kehadiran?month=${selectedMonth}&type=${activeTab}`);
        const json = await res.json();
        if (json.success) {
          if (activeTab === "siswa") setData(json.data || []);
          else setTutorData(json.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil data laporan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [selectedMonth, activeTab]);

  const filtered = data.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nis.toLowerCase().includes(search.toLowerCase());
    const matchClass =
      selectedClass === "ALL" ||
      (item.gradeLevel && item.gradeLevel.toLowerCase().includes(selectedClass.toLowerCase()));
    return matchSearch && matchClass;
  });

  const filteredTutors = tutorData.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.includes(search) ||
      item.specialization.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const exportCSV = () => {
    if (activeTab === "siswa") {
      const headers = ["NIS", "Nama Siswa", "Jenjang/Kelas", "Cabang", "Total Sesi", "Hadir", "Tidak Hadir", "Persentase Kehadiran (%)"];
      const rows = filtered.map((item) => [
        `"${item.nis}"`,
        `"${item.name}"`,
        `"${item.gradeLevel}"`,
        `"${item.branchName}"`,
        item.totalSessions,
        item.hadir,
        item.tidak_hadir,
        `"${item.attendanceRate}%"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `laporan_kehadiran_siswa_${selectedMonth}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ["NIP", "Nama Tentor", "Mata Pelajaran", "Total Sesi", "Total Jam Mengajar", "Hadir", "Tidak Hadir", "Persentase Kehadiran (%)"];
      const rows = filteredTutors.map((item) => [
        `"${item.nip}"`,
        `"${item.name}"`,
        `"${item.specialization}"`,
        item.totalSessions,
        `${item.totalHours} Jam`,
        item.hadir,
        item.tidak_hadir,
        `"${item.attendanceRate}%"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `laporan_kehadiran_tentor_${selectedMonth}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setNotice(`Laporan Kehadiran ${activeTab === "siswa" ? "Siswa" : "Tentor"} CSV berhasil diunduh!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const avgAttendance =
    activeTab === "siswa"
      ? filtered.length > 0
        ? (
            filtered.reduce((acc, curr) => acc + curr.attendanceRate, 0) /
            filtered.length
          ).toFixed(1)
        : "0"
      : filteredTutors.length > 0
      ? (
          filteredTutors.reduce((acc, curr) => acc + curr.attendanceRate, 0) /
          filteredTutors.length
        ).toFixed(1)
      : "0";

  const totalTeachingHours = filteredTutors.reduce((acc, curr) => acc + curr.totalHours, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}
            >
              <FileSpreadsheet size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Laporan Rekap Kehadiran
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Rekap persentase kehadiran bulanan siswa & tentor serta evaluasi partisipasi kelas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all"
          >
            <Printer size={15} />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download size={15} />
            <span>Download Excel / CSV</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 print:hidden">
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "siswa"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Users size={16} />
          <span>Rekap Kehadiran Siswa</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filtered.length}
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
          <span>Rekap Kehadiran Tentor</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredTutors.length}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Rata-Rata Kehadiran {activeTab === "siswa" ? "Siswa" : "Tentor"}</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {avgAttendance}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            Kategori Sangat Baik (&gt;85%)
          </span>
        </div>

        {activeTab === "siswa" ? (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span>Total Siswa Terevaluasi</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {filtered.length} Siswa
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Periode aktif bulan berjalan
            </span>
          </div>
        ) : (
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
              <span>Total Jam Mengajar</span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {totalTeachingHours} Jam
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Akumulasi jam mengajar bulan ini
            </span>
          </div>
        )}

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Kehadiran Sempurna (100%)</span>
            <CheckCircle2 size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activeTab === "siswa"
              ? filtered.filter((s) => s.attendanceRate === 100).length
              : filteredTutors.filter((t) => t.attendanceRate === 100).length}{" "}
            {activeTab === "siswa" ? "Siswa" : "Tentor"}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Tanpa izin atau ketidakhadiran
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`grid grid-cols-1 ${activeTab === "siswa" ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden`}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "siswa" ? "Cari siswa atau NIS..." : "Cari nama tentor, NIP, atau mapel..."}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {activeTab === "siswa" && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="UTBK">UTBK</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400 shrink-0" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Rekapitulasi Kehadiran {activeTab === "siswa" ? "Siswa" : "Tentor"} - {settings.lesName}
          </h3>
          <p className="text-xs text-slate-500">
            Periode: {selectedMonth}
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat data dari database...</span>
            </div>
          ) : activeTab === "siswa" ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">NIS</th>
                  <th className="px-4 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5">Jenjang / Kelas</th>
                  <th className="px-4 py-3.5">Cabang</th>
                  <th className="px-3 py-3.5 text-center">Total Sesi</th>
                  <th className="px-3 py-3.5 text-center">Hadir</th>
                  <th className="px-3 py-3.5 text-center">Tidak Hadir</th>
                  <th className="px-5 py-3.5 text-right">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data siswa ditemukan untuk periode ini.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-slate-500">
                        {item.nis}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.gradeLevel}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.branchName}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.totalSessions}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-emerald-600">
                        {item.hadir}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-rose-600">
                        {item.tidak_hadir}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.attendanceRate >= 85
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                              : item.attendanceRate >= 75
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {item.attendanceRate}%
                        </span>
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
                  <th className="px-5 py-3.5">NIP</th>
                  <th className="px-4 py-3.5">Nama Tentor</th>
                  <th className="px-4 py-3.5">Bidang / Mapel</th>
                  <th className="px-3 py-3.5 text-center">Total Sesi</th>
                  <th className="px-3 py-3.5 text-center">Total Jam</th>
                  <th className="px-3 py-3.5 text-center">Hadir</th>
                  <th className="px-3 py-3.5 text-center">Tidak Hadir</th>
                  <th className="px-5 py-3.5 text-right">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTutors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data tentor ditemukan untuk periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredTutors.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-slate-500">
                        {item.nip}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {item.specialization}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.totalSessions}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {item.totalHours} Jam
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-emerald-600">
                        {item.hadir}
                      </td>
                      <td className="px-3 py-4 text-center font-bold text-rose-600">
                        {item.tidak_hadir}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.attendanceRate >= 85
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                              : item.attendanceRate >= 75
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                              : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {item.attendanceRate}%
                        </span>
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

