import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  colorVariant: "blue" | "emerald" | "amber" | "violet" | "rose";
}

const colorStyles = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-900/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/40",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-900/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-900/40",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  colorVariant,
}: StatCardProps) {
  const styles = colorStyles[colorVariant] || colorStyles.blue;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} border ${styles.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {change && (
          <span
            className={`font-semibold inline-flex items-center gap-1 ${
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
        {subtitle && (
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
