import type { EncryptedVault } from '../types'
import { DRAFT_KEY, HASH_KEY, RENEWAL_SCHEDULE_KEY, SALT_KEY, VAULT_KEY } from './storage'

const BACKUP_FORMAT = 'passsave-backup'
const BACKUP_VERSION = 1

interface VaultBackup {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  data: {
    vault: EncryptedVault | null
    masterPasswordHash: string
    masterSalt: string
  }
}

function isEncryptedVault(value: unknown): value is EncryptedVault {
  if (!value || typeof value !== 'object') return false
  const vault = value as Record<string, unknown>
  return ['salt', 'iv', 'data'].every((key) => typeof vault[key] === 'string')
}

function parseBackup(value: unknown): VaultBackup {
  if (!value || typeof value !== 'object') throw new Error('El archivo no es válido')

  const backup = value as Partial<VaultBackup>
  const data = backup.data
  if (
    backup.format !== BACKUP_FORMAT ||
    backup.version !== BACKUP_VERSION ||
    !data ||
    typeof data.masterPasswordHash !== 'string' ||
    typeof data.masterSalt !== 'string' ||
    (data.vault !== null && !isEncryptedVault(data.vault))
  ) {
    throw new Error('El respaldo no es compatible')
  }

  return backup as VaultBackup
}

export async function createBackup(): Promise<VaultBackup> {
  const stored = await chrome.storage.local.get([VAULT_KEY, HASH_KEY, SALT_KEY])
  const masterPasswordHash = stored[HASH_KEY]
  const masterSalt = stored[SALT_KEY]

  if (typeof masterPasswordHash !== 'string' || typeof masterSalt !== 'string') {
    throw new Error('Primero debes configurar la contraseña maestra')
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      vault: stored[VAULT_KEY] ?? null,
      masterPasswordHash,
      masterSalt,
    },
  }
}

export async function restoreBackup(value: unknown): Promise<void> {
  const backup = parseBackup(value)
  const values: Record<string, unknown> = {
    [HASH_KEY]: backup.data.masterPasswordHash,
    [SALT_KEY]: backup.data.masterSalt,
  }

  if (backup.data.vault) values[VAULT_KEY] = backup.data.vault

  await chrome.storage.local.set(values)
  if (!backup.data.vault) await chrome.storage.local.remove(VAULT_KEY)
  await chrome.storage.local.remove([DRAFT_KEY, RENEWAL_SCHEDULE_KEY])
}
