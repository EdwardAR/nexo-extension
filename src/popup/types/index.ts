export interface PasswordEntry {
  id: string
  site: string
  username: string
  password: string
  notes: string
  createdAt: number
  updatedAt: number
  passwordChangedOn?: string
  renewalIntervalMonths?: number
}

export interface PasswordDraft {
  site: string
  username: string
  password: string
  notes: string
  passwordChangedOn: string
  renewalIntervalMonths: number
  updatedAt: number
}

export interface EncryptedVault {
  salt: string
  iv: string
  data: string
}

export interface VaultState {
  unlocked: boolean
  entries: PasswordEntry[]
  locked: boolean
}

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}
