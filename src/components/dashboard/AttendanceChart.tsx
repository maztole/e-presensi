import React from "react";
import { TrendingUp, Users, Calendar } from "lucide-react";

export function AttendanceChart() {
  const weeklyData = [
    { day: "Senin", hadir: 42, izin: 3, sakit: 1, alpa: 1 },
    { day: "Selasa", hadir: 48, izin: 2, sakit: 0, alpa: 0 },
    { day: "Rabu", hadir: 45, izin: 1, sakit: 2, alpa: 1 },
    { day: "Kamis", hadir: 50, izin: 0, sakit: 1, alpa: 0 },
    { day: "Jumat", hadir: 38, izin: 4, sakit: 2, alpa: 2 },
    { day: "Sabtu", hadir: 55, izin: 2, sakit: 1, alpa: 0 },
  ];

  const maxTotal = 60;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
              Statistik Kehadiran Minggu Ini
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={12} /> 94% Tingkat Kehadiran
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perbandingan total siswa hadir dari Senin hingga Sabtu
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Hadir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Izin/Sakit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Alpa</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Bars */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
        {weeklyData.map((item, idx) => {
          const hadirHeight = (item.hadir / maxTotal) * 100;
          const izinSakitHeight = ((item.izin + item.sakit) / maxTotal) * 100;
          const alpaHeight = (item.alpa / maxTotal) * 100;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
            >
              <div className="w-full max-w-9 bg-slate-100 dark:bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all group-hover:opacity-90 relative">
                {/* Bar Segments */}
                <div
                  style={{ height: `${alpaHeight}%` }}
                  className="w-full bg-rose-500 transition-all duration-500"
                  title={`Alpa: ${item.alpa}`}
                />
                <div
                  style={{ height: `${izinSakitHeight}%` }}
                  className="w-full bg-amber-500 transition-all duration-500"
                  title={`Izin/Sakit: ${item.izin + item.sakit}`}
                />
                <div
                  style={{ height: `${hadirHeight}%` }}
                  className="w-full bg-blue-600 transition-all duration-500"
                  title={`Hadir: ${item.hadir}`}
                />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {item.hadir} Hadir
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
