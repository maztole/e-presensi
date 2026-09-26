"use client";

import React, { useState, useEffect } from "react";
import { useThemeCMS } from "@/context/ThemeContext";
import {
  Receipt,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  Calendar,
} from "lucide-react";

interface HonorItem {
  id: string;
  tutorName: string;
  specialization: string;
  sessionsSD: number;
  sessionsSMP: number;
  sessionsSMA: number;
  totalSessions: number;
  totalHonor: number;
  status: "LUNAS" | "PENDING";
}

interface SppItem {
  id: string;
  studentName: string;
  gradeLevel: string;
  amount: number;
  dueDate: string;
  status: "LUNAS" | "BELUM_LUNAS";
}

export default function FinancialReportPage() {
  const { settings, themeColors } = useThemeCMS();
  const [tab, setTab] = useState<"honor" | "spp">("honor");
  const [honors, setHonors] = useState<HonorItem[]>([]);
  const [spps, setSpps] = useState<SppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [honorRes, sppRes] = await Promise.all([
          fetch(`/api/reports/keuangan?month=${selectedMonth}&type=honor`),
          fetch(`/api/reports/keuangan?month=${selectedMonth}&type=spp`),
        ]);
        const honorJson = await honorRes.json();
        const sppJson = await sppRes.json();
        if (honorJson.success) setHonors(honorJson.data || []);
        if (sppJson.success) setSpps(sppJson.data || []);
      } catch (err) {
        console.error("Gagal mengambil laporan keuangan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const toggleHonorStatus = async (id: string) => {
    if (!confirm("Yakin ingin mengubah status honor ini?")) return;
    const target = honors.find((h) => h.id === id);
    if (!target) return;
    const newStatus = target.status === "LUNAS" ? "PENDING" : "LUNAS";
    // Optimistic update - hanya kolom status yang berubah, kolom lain absolut tidak bergeser
    setHonors((prev) => prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h)));
    try {
      const res = await fetch("/api/reports/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "honor", id, month: selectedMonth, status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menyimpan");
      setNotice(`Status honor ${target.tutorName} diubah menjadi ${newStatus}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      // Rollback jika gagal
      setHonors((prev) => prev.map((h) => (h.id === id ? { ...h, status: target.status } : h)));
      setNotice("Gagal menyimpan status honor ke database");
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const toggleSppStatus = async (id: string) => {
    if (!confirm("Yakin ingin mengubah status pembayaran SPP ini?")) return;
    const target = spps.find((s) => s.id === id);
    if (!target) return;
    const newStatus = target.status === "LUNAS" ? "BELUM_LUNAS" : "LUNAS";
    setSpps((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
    try {
      const res = await fetch("/api/reports/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "spp", id, month: selectedMonth, status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menyimpan");
      setNotice(`Status SPP ${target.studentName} diubah menjadi ${newStatus}`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setSpps((prev) => prev.map((s) => (s.id === id ? { ...s, status: target.status } : s)));
      setNotice("Gagal menyimpan status SPP ke database");
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const filteredHonors = honors.filter((h) =>
    h.tutorName.toLowerCase().includes(search.toLowerCase()) ||
    h.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSpps = spps.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.gradeLevel.toLowerCase().includes(search.toLowerCase())
  );

  const totalHonorExpense = filteredHonors.reduce((acc, curr) => acc + curr.totalHonor, 0);
  const totalSppIncome = filteredSpps.reduce((acc, curr) => acc + curr.amount, 0);

  const exportFinancialCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (tab === "honor") {
      headers = ["Nama Tentor", "Sesi SD", "Sesi SMP", "Sesi SMA", "Total Sesi", "Total Honor", "Status"];
      rows = filteredHonors.map((h) => [
        `"${h.tutorName}"`,
        h.sessionsSD,
        h.sessionsSMP,
        h.sessionsSMA,
        h.totalSessions,
        h.totalHonor,
        h.status,
      ]);
    } else {
      headers = ["Nama Siswa", "Jenjang/Kelas", "Nominal SPP", "Jatuh Tempo", "Status Pembayaran"];
      rows = filteredSpps.map((s) => [
        `"${s.studentName}"`,
        `"${s.gradeLevel}"`,
        s.amount,
        `"${s.dueDate}"`,
        s.status,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_${tab}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice(`Laporan ${tab.toUpperCase()} CSV berhasil diunduh!`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-xl ${themeColors.bg} text-white flex items-center justify-center`}>
              <Receipt size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Laporan Honor Tentor & SPP Siswa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Rekapitulasi pembayaran honor pengajar berbasis jam mengajar &amp; pencatatan SPP siswa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all"
          >
            <Printer size={15} />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={exportFinancialCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Download size={15} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in print:hidden">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Total Estimasi Honor Tentor
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            Rp {totalHonorExpense.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-400">{filteredHonors.length} Tentor Terdata</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Total Pemasukan SPP Siswa
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Rp {totalSppIncome.toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {filteredSpps.filter((s) => s.status === "LUNAS").length} Lunas, {filteredSpps.filter((s) => s.status === "BELUM_LUNAS").length} Belum
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Margin Operasional Bimbel
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Rp {(totalSppIncome - totalHonorExpense).toLocaleString("id-ID")}
          </div>
          <span className="text-[11px] text-slate-400">Pemasukan SPP - Honor Tentor</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "honor" ? "Cari nama tentor atau mapel..." : "Cari nama siswa atau jenjang..."}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 print:hidden">
        <button
          onClick={() => setTab("honor")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            tab === "honor"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <DollarSign size={16} />
          <span>Laporan Honor Tentor</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredHonors.length}
          </span>
        </button>
        <button
          onClick={() => setTab("spp")}
          className={`flex items-center gap-2 pb-3 pt-1 px-2 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            tab === "spp"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <CreditCard size={16} />
          <span>Laporan SPP Siswa</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {filteredSpps.length}
          </span>
        </button>
      </div>

      {/* Table Content */}
      {tab === "honor" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Rekapitulasi Honor Pengajar / Tentor
              </h3>
              <p className="text-xs text-slate-500">
                Dihitung dari log mengajar per sesi sesuai konfigurasi tarif &bull; Periode: {selectedMonth}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> SD
              <span className="w-2 h-2 rounded-full bg-blue-500 ml-1"></span> SMP
              <span className="w-2 h-2 rounded-full bg-purple-500 ml-1"></span> SMA
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memuat data dari database...</span>
              </div>
            ) : (
              <table className="w-full table-fixed text-left text-xs min-w-72">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="w-[24%] px-5 py-3.5">Nama Tentor</th>
                    <th className="w-[12%] px-3 py-3.5 text-center">Sesi SD</th>
                    <th className="w-[12%] px-3 py-3.5 text-center">Sesi SMP</th>
                    <th className="w-[12%] px-3 py-3.5 text-center">Sesi SMA</th>
                    <th className="w-[11%] px-4 py-3.5 text-center">Total Sesi</th>
                    <th className="w-[15%] px-4 py-3.5">Total Honor</th>
                    <th className="w-[14%] px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHonors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data honor tentor ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredHonors.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 truncate">
                          <span className="block truncate">{h.tutorName}</span>
                          <span className="block text-[11px] font-normal text-slate-400 truncate">{h.specialization}</span>
                        </td>
                        <td className="px-3 py-4 text-center font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                          {h.sessionsSD} Sesi
                        </td>
                        <td className="px-3 py-4 text-center font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {h.sessionsSMP} Sesi
                        </td>
                        <td className="px-3 py-4 text-center font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                          {h.sessionsSMA} Sesi
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {h.totalSessions} Sesi
                        </td>
                        <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          Rp {h.totalHonor.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => toggleHonorStatus(h.id)}
                            className={`w-32 inline-flex items-center justify-center py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              h.status === "LUNAS"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300"
                            }`}
                          >
                            {h.status === "LUNAS" ? "✓ Lunas Dibayar" : "⏳ Pending"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Status Pembayaran SPP / Biaya Bimbingan Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan status iuran bulanan tempat les &bull; Periode: {selectedMonth}
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memuat data dari database...</span>
              </div>
            ) : (
              <table className="w-full table-fixed text-left text-xs min-w-72">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="w-[28%] px-5 py-3.5">Nama Siswa</th>
                    <th className="w-[18%] px-4 py-3.5">Jenjang / Kelas</th>
                    <th className="w-[18%] px-4 py-3.5">Tagihan SPP</th>
                    <th className="w-[18%] px-4 py-3.5">Jatuh Tempo</th>
                    <th className="w-[18%] px-5 py-3.5 text-right">Status SPP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSpps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Tidak ada data SPP siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSpps.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 truncate">
                          <span className="block truncate">{s.studentName}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300 truncate whitespace-nowrap">
                          {s.gradeLevel}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          Rp {s.amount.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-500 whitespace-nowrap">
                          {s.dueDate}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => toggleSppStatus(s.id)}
                            className={`w-32 inline-flex items-center justify-center py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                              s.status === "LUNAS"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300"
                            }`}
                          >
                            {s.status === "LUNAS" ? "✓ Lunas" : "❌ Belum Lunas"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
