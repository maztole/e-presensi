"use client";

import React, { useState } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentAttendance } from "@/components/dashboard/RecentAttendance";
import { AbsenceList } from "@/components/dashboard/AbsenceList";
import { WeeklyAttendanceTrend } from "@/components/dashboard/WeeklyAttendanceTrend";
import { AttendanceStatusDistribution } from "@/components/dashboard/AttendanceStatusDistribution";
import { ManualAttendanceModal } from "@/components/modals/ManualAttendanceModal";
import { AddUserModal } from "@/components/modals/AddUserModal";
import { ThemeCustomizerModal } from "@/components/cms/ThemeCustomizerModal";
import {
  Users,
  GraduationCap,
  CalendarDays,
  Percent,
  Download,
  Edit3,
  UserPlus,
  Palette,
  Sparkles,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { settings, themeColors } = useThemeCMS();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = (format: "PDF" | "Excel") => {
    setExportNotice(`Sedang mengunduh rekap presensi format ${format}...`);
    setTimeout(() => {
      setExportNotice(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div
        className={`p-6 rounded-3xl bg-linear-to-r ${themeColors.gradient} text-white shadow-xl ${themeColors.shadow} relative overflow-hidden transition-all duration-300`}
      >
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white">
                👋 {settings.lesName}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/20 text-[11px] font-medium text-white/90">
                Toleransi: {settings.lateToleranceMinutes} Menit
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Admin E-Presensi
            </h1>
            <p className="text-sm text-white/90 mt-1 max-w-xl">
              {settings.lesTagline} &bull; Pantau siswa, tentor, jadwal berjalan, dan log kehadiran secara real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Input Presensi</span>
            </button>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Tambah Siswa/Tentor</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-semibold text-xs sm:text-sm transition-all cursor-pointer">
                <Download size={15} />
                <span>Export Laporan</span>
              </button>

              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 hidden group-hover:block z-30">
                <button
                  onClick={() => handleExport("Excel")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Export Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("PDF")}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} className="text-rose-600" /> Cetak / Export PDF
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
              title="Setting Tema & Branding CMS"
            >
              <Palette size={16} />
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="mt-4 px-4 py-2 bg-emerald-500/90 backdrop-blur-md text-white rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={15} />
            <span>{exportNotice}</span>
          </div>
        )}
      </div>

      {/* Metrik Utama (Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Siswa Aktif"
          value="142 Siswa"
          subtitle="Terdaftar di semua kelas"
          change="+8 Siswa baru bulan ini"
          isPositive={true}
          icon={Users}
          colorVariant="blue"
        />
        <StatCard
          title="Total Tentor Aktif"
          value="18 Tentor"
          subtitle="6 Bertugas hari ini"
          change="100% Siap mengajar"
          isPositive={true}
          icon={GraduationCap}
          colorVariant="violet"
        />
        <StatCard
          title="Total Kelas Hari Ini"
          value="8 Sesi"
          subtitle="4 Sedang / Akan berlangsung"
          icon={CalendarDays}
          colorVariant="amber"
        />
        <StatCard
          title="Tingkat Kehadiran Harian"
          value="94.2%"
          subtitle="48 Hadir, 4 Absen/Izin"
          change="+2.1% dari minggu lalu"
          isPositive={true}
          icon={Percent}
          colorVariant="emerald"
        />
      </div>

      {/* Visualisasi Data (Grafik) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tren Kehadiran Line Chart */}
        <div className="lg:col-span-2">
          <WeeklyAttendanceTrend />
        </div>

        {/* Distribusi Status Kehadiran Pie Chart */}
        <div>
          <AttendanceStatusDistribution />
        </div>
      </div>

      {/* Pemantauan Harian & Live Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Kelas Berjalan / Terdekat (2 col on lg) */}
        <div className="lg:col-span-2 space-y-6">
          <TodaySchedule />
          <RecentAttendance />
        </div>

        {/* Daftar Ketidakhadiran Hari Ini (1 col on lg) */}
        <div className="space-y-6">
          <AbsenceList />
        </div>
      </div>

      {/* Modals triggered from Dashboard */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}
