
"use client";

import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

interface PhotoUploadProps {
  files: File[];
  existingUrls?: string[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (index: number) => void;
  disabled?: boolean;
}

export function PhotoUpload({
  files,
  existingUrls = [],
  onFilesChange,
  onRemoveExisting,
  disabled = false,
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);

    if (selected.length) {
      onFilesChange([...files, ...selected]);
    }

    // Permet de sélectionner à nouveau le même fichier
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-blue-500 hover:bg-blue-50 ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <ImagePlus className="size-5 text-blue-700" />

        <span className="text-sm font-semibold text-slate-700">
          Ajouter des photos
        </span>

        <input
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={handleSelect}
          className="sr-only"
        />
      </label>

      {(existingUrls.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {existingUrls.map((url, index) => (
            <div
              key={`existing-${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <img
                src={url}
                alt={`Photo enregistrée ${index + 1}`}
                className="h-32 w-full object-contain"
              />

              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(index)}
                  disabled={disabled}
                  aria-label="Supprimer cette photo"
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50"
                >
                  <X className="size-4" />
                </button>
              )}

              <p className="truncate border-t px-2 py-1.5 text-xs text-slate-500">
                Photo enregistrée
              </p>
            </div>
          ))}

          {previews.map((url, index) => (
            <div
              key={`${files[index]?.name}-${index}`}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <img
                src={url}
                alt={`Aperçu ${index + 1}`}
                className="h-32 w-full object-contain"
              />

              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label="Retirer cette photo"
                className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-600 shadow-sm hover:bg-red-50"
              >
                <X className="size-4" />
              </button>

              <p className="truncate border-t px-2 py-1.5 text-xs text-slate-500">
                {files[index]?.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Les photos sélectionnées seront envoyées au serveur lors de la validation.
      </p>
    </div>
  );
}
