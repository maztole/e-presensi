"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, Loader2 } from "lucide-react";

interface StatusItem {
  name: string;
  value: number;
  color: string;
}

export function AttendanceStatusDistribution() {
  const [statusData, setStatusData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch("/api/reports/today", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data?.statusDistribution) {
          setStatusData(json.data.statusDistribution);
        }
      } catch (e) {
        console.error("Gagal memuat distribusi status:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const total = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <PieIcon size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Distribusi Status Kehadiran
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Persentase status presensi hari ini
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart / Loading */}
        {loading ? (
          <div className="h-52 w-full flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : total === 0 ? (
          <div className="h-52 w-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <span className="text-xs">Belum ada data presensi hari ini</span>
          </div>
        ) : (
          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                {total}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Presensi
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend list */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {statusData.map((st) => (
            <div key={st.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: st.color }}
                />
                <span className="text-slate-600 dark:text-slate-400">{st.name}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {st.value} ({total > 0 ? Math.round((st.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
