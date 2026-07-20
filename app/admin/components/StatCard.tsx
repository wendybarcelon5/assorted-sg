import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-red-600/10 p-4 text-red-500">
          {icon}
        </div>
      </div>
    </div>
  );
}