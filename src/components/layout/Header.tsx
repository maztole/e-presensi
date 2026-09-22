"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Menu,
  Bell,
  Search,
  QrCode,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Palette,
  UserPlus,
  Edit3,
} from "lucide-react";

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  onOpenThemeModal?: () => void;
  onOpenManualAttendanceModal?: () => void;
  onOpenAddUserModal?: () => void;
}

export function Header({
  setMobileOpen,
  onOpenThemeModal,
  onOpenManualAttendanceModal,
  onOpenAddUserModal,
}: HeaderProps) {
  const { settings } = useThemeCMS();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa, tutor, atau jadwal..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Right: Live Clock, Quick Actions & Notifications */}
      <div className="flex items-center gap-3">
        {/* Live Clock & Date badge */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/40">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Calendar size={14} />
            <span>{date || "Memuat tanggal..."}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200">
            <Clock size={14} />
            <span>{time || "--:--:--"}</span>
          </div>
        </div>

        {/* Quick QR Scanner Button */}
        <button
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          title="Buka Scan QR Presensi"
        >
          <QrCode size={16} />
          <span className="hidden sm:inline">Scan QR Presensi</span>
        </button>

        {/* Quick Add Presensi Button */}
        <button
          onClick={onOpenManualAttendanceModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          title="Input Presensi Manual"
        >
          <Edit3 size={16} />
          <span className="hidden sm:inline">Input Presensi</span>
        </button>

        {/* Quick Add User Button */}
        <button
          onClick={onOpenAddUserModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/20 transition-all active:scale-95 cursor-pointer"
          title="Daftar Siswa/Tentor Baru"
        >
          <UserPlus size={16} />
          <span className="hidden sm:inline">Tambah Data</span>
        </button>

        {/* Theme CMS Button */}
        <button
          onClick={onOpenThemeModal}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Pengaturan Tema & CMS Tempat Les"
        >
          <Palette size={19} />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </button>
      </div>
    </header>
  );
}
