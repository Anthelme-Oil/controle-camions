import { X, Download, Mail } from "lucide-react";
import { InspectionDTO } from "@/lib/client/inspection.service";

export function DetailModal({
  selected,
  onClose,
  onDownload,
  onMail,
}: {
  selected: InspectionDTO | null;
  onClose: () => void;
  onDownload: (item: InspectionDTO) => void;
  onMail: (item: InspectionDTO) => void;
}) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/30 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#ef8c56]">
              Détail de l'inspection
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#102d56]">{selected.registration}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Detail label="Région" value={selected.region || "Non définie"} />
          <Detail label="Capacité" value={selected.capacity || "N/A"} />
          <Detail label="Produit" value={selected.product || "N/A"} />
          <Detail label="Inspecteur" value={selected.inspectorName || selected.inspector?.name || "N/A"} />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onDownload(selected)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 font-bold text-[#102d56] hover:bg-slate-50 transition-colors"
          >
            <Download className="size-4" /> Télécharger PDF
          </button>
          <button
            type="button"
            onClick={() => onMail(selected)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#102d56] font-bold text-white hover:bg-[#183f75] transition-colors"
          >
            <Mail className="size-4" /> Envoyer par e-mail
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f9fc] p-3.5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}