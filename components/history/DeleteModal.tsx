import { InspectionDTO } from "@/lib/client/inspection.service";

export function DeleteModal({
  deleteTarget,
  onClose,
  onConfirm,
}: {
  deleteTarget: InspectionDTO | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d56]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h3 className="text-xl font-black text-slate-900">Confirmer la suppression</h3>
        <p className="mt-2 text-sm text-slate-500">
          Êtes-vous sûr de vouloir supprimer définitivement le contrôle du véhicule{" "}
          <strong className="text-slate-800">{deleteTarget.registration}</strong> ? Cette action est irréversible.
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
            className="h-11 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}