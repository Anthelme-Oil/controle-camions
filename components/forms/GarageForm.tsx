'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Mail, X, Check, Save } from 'lucide-react'
import { GarageDTO } from '@/lib/client/garage.service'

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100'

export function GarageForm({
  garageToEdit,
  onSubmitSuccess,
  onCancelEdit,
}: {
  garageToEdit?: GarageDTO | null
  onSubmitSuccess: (data: { name?: string; location?: string; emails: string[] }, id?: string) => void
  onCancelEdit?: () => void
}) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (garageToEdit) {
      setName(garageToEdit.name || '')
      setLocation(garageToEdit.location || '')
      setEmails(garageToEdit.emails || [])
    } else {
      setName('')
      setLocation('')
      setEmails([])
    }
  }, [garageToEdit])

  function addEmail() {
    const value = emailInput.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!value) return

    if (!emailPattern.test(value)) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.')
      return
    }

    if (emails.includes(value)) {
      setErrorMsg('Cette adresse e-mail a déjà été ajoutée.')
      return
    }

    setEmails((current) => [...current, value])
    setEmailInput('')
    setErrorMsg('')
  }

  function removeEmail(email: string) {
    setEmails((current) => current.filter((item) => item !== email))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (emails.length === 0) {
      setErrorMsg('Ajoutez au moins une adresse e-mail.')
      return
    }

    onSubmitSuccess(
      {
        name: name.trim() || undefined,
        location: location.trim() || undefined,
        emails,
      },
      garageToEdit?.id
    )

    if (!garageToEdit) {
      setName('')
      setLocation('')
      setEmails([])
    }
    setErrorMsg('')
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            {garageToEdit ? <Save className="size-5" /> : <Plus className="size-5" />}
          </div>

          <h2 className="text-xl font-black tracking-tight text-slate-900">
            {garageToEdit ? 'Modifier le garage' : 'Créer un garage'}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Renseignez les e-mails qui recevront les rapports Safe to Operate.
          </p>
        </div>

        {garageToEdit && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
        {/* Nom */}
        <label className="flex w-full flex-col gap-2">
          <span className="text-xs font-bold text-slate-700">Nom du garage (optionnel)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Garage Central"
            className={inputClass}
          />
        </label>

        {/* Localité */}
        <label className="flex w-full flex-col gap-2">
          <span className="text-xs font-bold text-slate-700">Localité / Ville (optionnel)</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex. Lomé, Port"
            className={inputClass}
          />
        </label>

        {/* Adresses e-mail */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-xs font-bold text-slate-700">
            E-mails de notification <b className="text-orange-500">*</b>
          </label>

          <div className="flex w-full gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addEmail()
                }
              }}
              placeholder="atelier@entreprise.com"
              className={`${inputClass} flex-1`}
            />

            <button
              type="button"
              onClick={addEmail}
              aria-label="Ajouter un e-mail"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <Plus className="size-5" />
            </button>
          </div>

          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {emails.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-[11px] font-semibold text-orange-700"
                >
                  <Mail className="size-3 shrink-0" />
                  <span className="max-w-[180px] truncate">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="inline-flex size-5 items-center justify-center rounded text-orange-500 hover:bg-orange-100 hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={emails.length === 0}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {garageToEdit ? <Save className="size-4" /> : <Plus className="size-4" />}
          {garageToEdit ? 'Enregistrer les modifications' : 'Créer le garage'}
        </button>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  )
}