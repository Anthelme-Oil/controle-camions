import { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="mx-auto max-w-[1010px] overflow-hidden rounded-0 border border-slate-100 bg-white p-6 shadow-sm sm:p-10 transition-all">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#ef8c56]">
          RTGEP · Fiche de contrôle
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#102d56] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-500 sm:text-base">
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}