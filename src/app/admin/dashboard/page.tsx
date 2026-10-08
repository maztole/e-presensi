"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { RecentAttendance } from "@/components/dashboard/RecentAttendance";
import { WeeklyAttendanceTrend } from "@/components/dashboard/WeeklyAttendanceTrend";
import { AttendanceStatusDistribution } from "@/components/dashboard/AttendanceStatusDistribution";
import { ManualAttendanceModal } from "@/components/modals/ManualAttendanceModal";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { ThemeCustomizerModal } from "@/components/cms/ThemeCustomizerModal";
import {
  Users,
  GraduationCap,
  Building2,
  Percent,
} from "lucide-react";


export default function AdminDashboardPage() {
  const { settings, themeColors } = useThemeCMS();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Dynamic counts state
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [tutorCount, setTutorCount] = useState<number | null>(null);
  const [branchCount, setBranchCount] = useState<number | null>(null);
  const [attendanceRate, setAttendanceRate] = useState<string>("100%");

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const [resStudents, resTutors, resBranches, resAttendances] = await Promise.all([
          fetch("/api/students", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/tutors", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/branches", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
          fetch("/api/attendances", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        ]);

        if (resStudents?.data && Array.isArray(resStudents.data)) {
          setStudentCount(resStudents.data.length);
        }

        if (resTutors?.data && Array.isArray(resTutors.data)) {
          setTutorCount(resTutors.data.length);
        }

        if (resBranches?.data && Array.isArray(resBranches.data)) {
          setBranchCount(resBranches.data.length);
        }

        if (resAttendances?.data && Array.isArray(resAttendances.data) && resAttendances.data.length > 0) {
          const hadirCount = resAttendances.data.filter((a: any) => a.status === "HADIR").length;
          const rate = Math.round((hadirCount / resAttendances.data.length) * 100);
          setAttendanceRate(`${rate}%`);
        }
      } catch (e) {
        console.error("Gagal memuat metrik dashboard:", e);
      }
    }

    loadDashboardMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div
        className={`p-8 sm:p-10 md:p-12 rounded-3xl bg-linear-to-r ${themeColors.gradient} text-white shadow-xl ${themeColors.shadow} relative overflow-hidden transition-all duration-300 flex flex-col justify-center`}
      >
        {/* Background Batik PNG Berulang Setengah Banner - Gradasi Tebal ke Tipis */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none"
          style={{
            backgroundImage: "url(/images/batik.png)",
            backgroundRepeat: "repeat",
            backgroundSize: "140px auto",
            backgroundPosition: "center",
            opacity: 0.45,
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,1) 45%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 20%, rgba(0,0,0,1) 45%)",
          }}
        />
        <div className="absolute right-1/3 top-0 opacity-10 pointer-events-none">
          <div className="w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Selamat Datang, Admin E-Presensi! 👋
          </h1>
        </div>
      </div>

      {/* Metrik Utama (Overview Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Siswa Aktif"
          value={studentCount !== null ? `${studentCount} Siswa` : "Memuat..."}
          subtitle="Terdaftar di database tempat les"
          isPositive={true}
          icon={Users}
          colorVariant="blue"
        />
        <StatCard
          title="Total Tentor Aktif"
          value={tutorCount !== null ? `${tutorCount} Tentor` : "Memuat..."}
          subtitle="Tentor aktif mengajar"
          isPositive={true}
          icon={GraduationCap}
          colorVariant="violet"
        />
        <StatCard
          title="Total Cabang"
          value={branchCount !== null ? `${branchCount} Cabang` : "Memuat..."}
          subtitle="Cabang bimbingan belajar aktif"
          icon={Building2}
          colorVariant="amber"
        />
        <StatCard
          title="Tingkat Kehadiran Harian"
          value={attendanceRate}
          subtitle="Berdasarkan rekap presensi"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule />
        <RecentAttendance />
      </div>

      {/* Modals triggered from Dashboard */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
      <AddStudentModal
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
