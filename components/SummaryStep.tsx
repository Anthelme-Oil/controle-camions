
"use client";

import {
  CheckCategory,
  CheckStatesMap,
  VehicleInfo,
} from "@/types";

import {
  CheckCircle2,
  XCircle,
  Truck,
  ClipboardList,
  Package,
  Image as ImageIcon,
} from "lucide-react";

interface SummaryStepProps {
  info: VehicleInfo;
  categories: CheckCategory[];
  states: CheckStatesMap;
  photoPreviews: Record<string, string[]>;
  photoFiles: Record<string, File[]>;
}

export function SummaryStep({
  info,
  categories,
  states,
  photoPreviews,
  photoFiles,
}: SummaryStepProps) {

  // console.log("SummaryStep - info:", info);
  // console.log("SummaryStep - categories:", categories);
  // console.log("SummaryStep - states:", states);
  // console.log("SummaryStep - photoPreviews:", photoPreviews);
  // console.log("SummaryStep - photoFiles:", photoFiles);

//   const photoCount = Object.values(photoFiles ?? {}).reduce(
//   (total, files) => total + (files?.length ?? 0),
//   0
// );
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Informations du véhicule */}
      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Truck className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Immatriculation
            </p>
            <p className="truncate text-base font-extrabold text-slate-800">
              {info.registration || "—"}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inspecteur
            </p>
            <p className="truncate text-base font-extrabold text-slate-800">
              {info.inspector || "—"}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Produit
            </p>
            <p className="truncate text-base font-extrabold text-slate-800">
              {info.product || "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Résumé des contrôles */}
      <section className="space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Résumé du contrôle
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vérifiez les résultats, les observations et les justificatifs
            photographiques avant la validation.
          </p>
        </div>

        {categories.map((category) => (
          <section
            key={category.title}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                {category.title}
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {category.items.map((item) => {
                const reference = item.reference || "—";
                const state = states[item.id] ?? {
                  ok: true,
                  observation: "",
                  photoUrls: [],
                };

                const savedPhotos = state.photoUrls ?? [];
                const pendingPreviews = photoPreviews[item.id] ?? [];
                const pendingFiles = photoFiles[item.id] ?? [];
                const phts = photoFiles[reference] ?? [];

                const photoCount = phts.length

                // Les photos déjà enregistrées et les aperçus locaux.
                const photos = [
                  ...savedPhotos.map((src) => ({
                    src,
                    name: "Photo enregistrée",
                    key: `saved-${src}`,
                  })),
                  ...pendingPreviews.map((src, index) => ({
                    src,
                    name: pendingFiles[index]?.name ?? `Photo ${index + 1}`,
                    key: `pending-${index}-${src}`,
                  })),
                ];

                return (
                  <article key={item.id} className="space-y-4 p-4 sm:p-5">
                    {/* Intitulé et statut */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                            {item.reference}
                          </span>

                          <p className="text-sm font-semibold leading-5 text-slate-800">
                            {item.text}
                          </p>
                        </div>

                        {state.observation?.trim() && (
                          <div
                            className={`rounded-lg border p-3 text-sm ${
                              state.ok
                                ? "border-slate-200 bg-slate-50 text-slate-700"
                                : "border-rose-100 bg-rose-50 text-rose-700"
                            }`}
                          >
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide">
                              Observation
                            </p>
                            <p className="whitespace-pre-wrap break-words">
                              {state.observation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {state.ok ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            CONFORME
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700">
                            <XCircle className="h-4 w-4" />
                            NON CONFORME
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Aperçu des photographies */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <ImageIcon className="h-4 w-4 text-slate-500" />
                          <span>Photographies </span>
                        </div>

                        {photoCount > 0 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {photoCount} photo{photoCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* {photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {photos.map((photo) => (
                            <div
                              key={photo.key}
                              className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                            >
                              <a
                                href={photo.src}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Afficher ${photo.name} en grand`}
                                className="block aspect-[4/3] overflow-hidden bg-slate-100"
                              >
                                <img
                                  src={photo.src}
                                  alt={photo.name}
                                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                                  loading="lazy"
                                />
                              </a>

                              <p
                                className="truncate px-2.5 py-2 text-xs text-slate-600"
                                title={photo.name}
                              >
                                {photo.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">
                          Aucune photographie associée à ce point de contrôle.
                        </p>
                      )} */}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
