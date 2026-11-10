import { FileText } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  positive,
  warning,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${
            warning
              ? "bg-[#fff1dc] text-[#a45c16]"
              : positive
              ? "bg-[#e4f6ef] text-[#16745e]"
              : "bg-[#e4f0ff] text-[#2670bb]"
          }`}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-[#102d56]">{value}</p>
      <p
        className={`mt-1 text-xs font-bold ${
          positive ? "text-[#16866e]" : warning ? "text-[#a45c16]" : "text-slate-400"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}