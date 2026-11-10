import { InspectionDTO } from "@/lib/client/inspection.service";

export function DraftConfirmModal({
  draftTarget,
  onClose,
  onConfirm,
}: {
  draftTarget: InspectionDTO | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!draftTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h3 className="text-xl font-black text-slate-900">Passer le contrôle à « À revoir »</h3>
        <p className="mt-2 text-sm text-slate-500">
          Voulez-vous marquer le contrôle du véhicule <strong className="text-slate-800">{draftTarget.registration}</strong> comme étant à revoir ? Le statut repassera en brouillon.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl px-4 text-sm font-bold text-slate-500 hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}