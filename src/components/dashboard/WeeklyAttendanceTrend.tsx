"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";

interface TrendData {
  day: string;
  siswa: number;
  tentor: number;
}

export function WeeklyAttendanceTrend() {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/trend?range=${timeRange}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data tren kehadiran:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [timeRange]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Tren Kehadiran
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} /> Data Real-time
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pergerakan grafik kehadiran siswa dan tentor dari database
          </p>
        </div>

        {/* Filter Range Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === "weekly"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === "monthly"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full flex items-center justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 size={18} className="animate-spin text-blue-500" />
            <span>Memuat data grafik...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415525" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "12px",
                  border: "1px solid #334155",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                name="Kehadiran Siswa"
                dataKey="siswa"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Kehadiran Tentor"
                dataKey="tentor"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
