"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

const statusData = [
  { name: "Hadir", value: 48, color: "#10b981" },
  { name: "Terlambat", value: 4, color: "#f59e0b" },
  { name: "Izin", value: 2, color: "#3b82f6" },
  { name: "Sakit", value: 1, color: "#8b5cf6" },
  { name: "Alpha", value: 1, color: "#ef4444" },
];

export function AttendanceStatusDistribution() {
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

        {/* Pie Chart */}
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
      </div>

      {/* Legend list */}
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
              {st.value} ({Math.round((st.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
