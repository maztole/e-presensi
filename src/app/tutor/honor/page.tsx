"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Receipt,
  Calendar,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  BookOpen,
  Award,
  Wallet,
} from "lucide-react";

interface HonorRecord {
  id: string;
  date: string;
  gradeLevel: string;
  teachingHours: number;
  sessionTopic: string;
  ratePerSession: number;
  totalHonor: number;
  status: string;
}

export default function TutorHonorPage() {
  const { themeColors } = useThemeCMS();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HonorRecord[]>([]);
  const [tutorUser, setTutorUser] = useState<any>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Summary Metrics
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [totalHonorAmount, setTotalHonorAmount] = useState(0);

  useEffect(() => {
    try {
      const sess = localStorage.getItem("user_session");
      if (sess) {
        setTutorUser(JSON.parse(sess));
      }
    } catch {} finally {
      setUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!userLoaded) return;

    async function fetchTutorHonor() {
      setLoading(true);
      try {
        // Kirim tutorName ke backend untuk filter ketat
        const currentTutorName = tutorUser?.name?.trim() || "";
        const queryParams = new URLSearchParams();
        queryParams.set("month", selectedMonth);
        if (currentTutorName) {
          queryParams.set("tutorName", currentTutorName);
        }

        const res = await fetch(
          `/api/tutor-attendances?${queryParams.toString()}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          let list = data.data;

          // Selalu filter ketat hanya milik tentor login
          if (currentTutorName) {
            const nameLower = currentTutorName.toLowerCase();
            list = list.filter(
              (a: any) =>
                a.tutorName && a.tutorName.toLowerCase().includes(nameLower)
            );
          } else {
            list = [];
          }

          // Dynamic rate config fallback
          const rateMap: { [key: string]: number } = {
            SD: 18000,
            SMP: 20000,
            SMA: 22000,
          };

          let calculatedSessions = 0;
          let calculatedHours = 0;
          let calculatedHonor = 0;

          const mapped: HonorRecord[] = list.map((item: any) => {
            const grade = item.gradeLevel || "SMA";
            const rate = rateMap[grade] || 20000;
            const hours = item.teachingHours || 1;
            const itemTotal = rate * hours;

            calculatedSessions += 1;
            calculatedHours += hours;
            calculatedHonor += itemTotal;

            return {
              id: item.id,
              date: item.date ? item.date.split("T")[0] : "-",
              gradeLevel: grade,
              teachingHours: hours,
              sessionTopic: item.sessionTopic || "Materi Mengajar Regular",
              ratePerSession: rate,
              totalHonor: itemTotal,
              status: item.status || "HADIR",
            };
          });

          setRecords(mapped);
          setTotalSessions(calculatedSessions);
          setTotalHours(calculatedHours);
          setTotalHonorAmount(calculatedHonor);
        } else {
          setRecords([]);
          setTotalSessions(0);
          setTotalHours(0);
          setTotalHonorAmount(0);
        }
      } catch (e) {
        console.error("Gagal memuat rekap honor tentor:", e);
        setRecords([]);
        setTotalSessions(0);
        setTotalHours(0);
        setTotalHonorAmount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchTutorHonor();
  }, [selectedMonth, tutorUser, userLoaded]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl ${themeColors.bg} text-white flex items-center justify-center shadow-md`}>
              <Receipt size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Rekap Honor & Mengajar Tentor
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rincian jam mengajar dan estimasi akumulasi honor bulanan Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Metrik Honor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Sesi Mengajar
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {totalSessions} Sesi
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Jam Mengajar
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {totalHours} Jam
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Estimasi Total Honor
            </p>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              Rp {totalHonorAmount.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabel Log Sesi Mengajar & Honor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Rincian Sesi Mengajar Bulan {selectedMonth}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tarif: SD (Rp 18k), SMP (Rp 20k), SMA (Rp 22k)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Jenjang</th>
                <th className="px-4 py-3.5">Topik / Materi</th>
                <th className="px-4 py-3.5">Durasi</th>
                <th className="px-4 py-3.5">Tarif / Sesi</th>
                <th className="px-5 py-3.5 text-right">Subtotal Honor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data rekap honor...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Belum ada sesi mengajar tercatat di bulan ini.
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {item.date}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.gradeLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {item.sessionTopic}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {item.teachingHours} Jam
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      Rp {item.ratePerSession.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {item.totalHonor.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
