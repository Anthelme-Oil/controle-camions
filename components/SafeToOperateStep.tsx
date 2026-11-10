import { Check, Upload, AlertCircle, ShieldCheck, X } from "lucide-react";
import { CheckCategory, CheckStatesMap } from "@/types";
import { PhotoUpload } from "./PhotoUpload";
interface SafeToOperateStepProps {
  categories: CheckCategory[];
  states: CheckStatesMap;
  conformCount: number;
  totalChecks: number;
  onToggle: (id: string) => void;
  onObservationChange: (id: string, value: string) => void;
  onPhotosUpload: (id: string, files: FileList | null) => void;
  onRemovePhoto?: (id: string, photoIndex: number) => void;
  photoFiles: Record<string, File[]>;
  onPendingPhotosChange: (id: string, files: File[]) => void;
  onRemovePendingPhoto: (id: string, index: number) => void;
}

export function SafeToOperateStep({
  categories,
  states,
  conformCount,
  totalChecks,
  onToggle,
  onObservationChange,
  onPhotosUpload,
  onRemovePhoto,
  photoFiles,
  onPendingPhotosChange,
  onRemovePendingPhoto,
}: SafeToOperateStepProps) {
  const percentage = Math.round((conformCount / (totalChecks || 1)) * 100);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Barre d'état globale */}
      <div className="sticky top-2 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 p-5 text-white shadow-xl backdrop-blur-md bg-opacity-95 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Progression de la conformité
            </h2>
            <p className="text-xs text-slate-400">
              {conformCount} sur {totalChecks} points de contrôle validés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xl font-extrabold text-emerald-400">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Groupes par catégorie */}
      <div className="space-y-8">
        {categories.map((category) => {
          const catConform = category.items.filter(
            (item) => states[item.id]?.ok,
          ).length;
          const isCatComplete = catConform === category.items.length;

          return (
            <section
              key={category.title}
              className="overflow-hidden rounded-0 border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* En-tête de la Catégorie */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                  <h3 className="text-base font-black text-slate-800 tracking-wide uppercase">
                    {category.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCatComplete
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {catConform} / {category.items.length}
                </span>
              </div>

              {/* Items de la catégorie */}
              <div className="divide-y divide-slate-100">
                {category.items.map((item) => {
                  const state = states[item.id] || {
                    ok: true,
                    observation: "",
                    photoUrls: [],
                  };
                  const photoUrls: string[] = state.photoUrls || [];

                  return (
                    <article
                      key={item.id}
                      className={`p-5 transition-colors ${
                        state.ok
                          ? "bg-white hover:bg-slate-50/50"
                          : "bg-rose-50/40"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => onToggle(item.id)}
                          aria-label={`Basculer ${item.reference}`}
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                            state.ok
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                              : "border-rose-400 bg-white text-transparent hover:border-rose-500"
                          }`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              {item.reference}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700 font-medium">
                            {item.text}
                          </p>

                          {/* Zone de saisie en cas de non-conformité */}
                          {!state.ok && (
                            <div className="mt-4 rounded-xl border border-rose-200 bg-white p-4 shadow-sm animate-in fade-in duration-200 space-y-4">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Remarque / Observation requise</span>
                              </div>

                              <textarea
                                required
                                value={state.observation}
                                onChange={(e) =>
                                  onObservationChange(item.id, e.target.value)
                                }
                                placeholder="Décrivez précisément l'anomalie constatée..."
                                className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
                              />

                              {/* Section d'upload multiple */}
                              <div className="flex flex-col gap-3">
                                <PhotoUpload
                                  files={photoFiles[item.id] ?? []}
                                  existingUrls={
                                    states[item.id]?.photoUrls ?? []
                                  }
                                  onFilesChange={(files) =>
                                    onPendingPhotosChange(item.id, files)
                                  }
                                  onRemoveExisting={
                                    onRemovePhoto
                                      ? (index) => onRemovePhoto(item.id, index)
                                      : undefined
                                  }
                                  disabled={false}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
