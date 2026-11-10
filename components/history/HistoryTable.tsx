import { Archive, CheckCircle2, Download, Eye, Send, Trash2, XCircle, Pencil, AlertCircle, Building2 } from "lucide-react";
import { InspectionDTO } from "@/lib/client/inspection.service";

const tone: Record<string, string> = {
  VALIDATED: "bg-[#e4f6ef] text-[#16745e]",
  DRAFT: "bg-[#fff1dc] text-[#a45c16]",
  ARCHIVED: "bg-[#eef1f5] text-[#68788b]",
};

const statusLabels: Record<string, string> = {
  VALIDATED: "Conforme",
  DRAFT: "À revoir",
  ARCHIVED: "Archivé",
};

export function HistoryTable({
  visible,
  loading,
  onView,
  onEdit,
  onMarkAsDraft,
  onDownloadPDF,
  onMail,
  onArchive,
  onDelete,
}: {
  visible: InspectionDTO[];
  loading: boolean;
  onView: (item: InspectionDTO) => void;
  onEdit: (item: InspectionDTO) => void;
  onMarkAsDraft: (item: InspectionDTO) => void;
  onDownloadPDF: (item: InspectionDTO) => void;
  onMail: (item: InspectionDTO) => void;
  onArchive: (item: InspectionDTO) => void;
  onDelete: (item: InspectionDTO) => void;
}) {
  if (loading) return null;

  return (
    <>
      {/* Table Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#fbfcfe] text-[11px] uppercase tracking-[.12em] text-slate-400">
            <tr>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Véhicule & Garage</th>
              <th className="px-6 py-4">Date de contrôle</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((item: any) => (
              <tr key={item.id} className="group transition-colors hover:bg-[#fbfdff]">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-700">{item.product || "Non spécifié"}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="font-extrabold text-[#102d56]">{item.registration}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="size-3.5 text-orange-500 shrink-0" />
                    <span className="font-semibold text-slate-700">
                      {item.garage?.name ? `${item.garage.name}${item.garage.location ? ` (${item.garage.location})` : ""}` : item.region || "Garage non spécifié"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">
                  <p className="font-semibold">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Inspecteur : {item.inspectorName || item.inspector?.name || "N/A"}
                  </p>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                      tone[item.status] || tone.DRAFT
                    }`}
                  >
                    {item.status === "VALIDATED" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : item.status === "DRAFT" ? (
                      <XCircle className="size-3.5" />
                    ) : (
                      <Archive className="size-3.5" />
                    )}
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-1">
                    <IconButton label="Voir le détail" onClick={() => onView(item)}>
                      <Eye className="size-4" />
                    </IconButton>
                    <IconButton label="Modifier le Safe to Operate" onClick={() => onEdit(item)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    {item.status !== "DRAFT" && (
                      <IconButton label="Marquer comme à revoir" onClick={() => onMarkAsDraft(item)}>
                        <AlertCircle className="size-4 text-amber-500" />
                      </IconButton>
                    )}
                    <IconButton label="Télécharger PDF" onClick={() => onDownloadPDF(item)}>
                      <Download className="size-4" />
                    </IconButton>
                    <IconButton label="Envoyer par mail" onClick={() => onMail(item)}>
                      <Send className="size-4" />
                    </IconButton>
                    {item.status !== "ARCHIVED" && (
                      <IconButton label="Archiver" onClick={() => onArchive(item)}>
                        <Archive className="size-4" />
                      </IconButton>
                    )}
                    <IconButton label="Supprimer" danger onClick={() => onDelete(item)}>
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Version Mobile */}
      <div className="grid gap-3 p-4 md:hidden">
        {visible.map((item: any) => (
          <article key={item.id} className="rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#102d56]">{item.registration}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Building2 className="size-3 text-orange-500" />
                  <span>{item.garage?.name || item.region || "Garage non spécifié"}</span>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone[item.status] || tone.DRAFT}`}>
                {statusLabels[item.status] || item.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : ""}
              </p>
              <div className="flex gap-1">
                <IconButton label="Voir" onClick={() => onView(item)}>
                  <Eye className="size-4" />
                </IconButton>
                <IconButton label="Modifier" onClick={() => onEdit(item)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label="Mail" onClick={() => onMail(item)}>
                  <Send className="size-4" />
                </IconButton>
                <IconButton label="Supprimer" danger onClick={() => onDelete(item)}>
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function IconButton({
  label,
  children,
  onClick,
  danger,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-xl p-2 transition-colors ${
        danger
          ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          : "text-slate-400 hover:bg-blue-50 hover:text-[#2670bb]"
      }`}
    >
      {children}
    </button>
  );
}