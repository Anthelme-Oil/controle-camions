'use client'

import { GarageDTO } from '@/lib/client/garage.service'
import { AlertTriangle, X } from 'lucide-react'

export function DeleteGarageModal({
  garage,
  onClose,
  onConfirm,
}: {
  garage: GarageDTO | null
  onClose: () => void
  onConfirm: () => void
}) {
  if (!garage) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-900">Supprimer le garage</h3>
        <p className="mt-2 text-sm text-slate-500">
          Voulez-vous vraiment supprimer le garage{' '}
          <strong className="text-slate-800">{garage.name || 'Sans nom'}</strong> ? Cette action est irréversible.
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
  )
}