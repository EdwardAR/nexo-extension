import type { PasswordDraft, PasswordEntry, EncryptedVault } from '../types'
import { encryptVault, decryptVault, hashPassword } from './crypto'
import { addCalendarMonths, DEFAULT_RENEWAL_MONTHS } from '../../shared/renewal'

export const VAULT_KEY = 'password_vault'
export const HASH_KEY = 'master_password_hash'
export const SALT_KEY = 'master_salt'
export const DRAFT_KEY = 'password_entry_draft'
export const RENEWAL_SCHEDULE_KEY = 'renewal_schedule'

export interface RenewalScheduleItem {
  entryId: string
  dueOn: string
  advanceNotifiedFor?: string
  dueNotifiedFor?: string
}

export interface VaultSnapshot {
  hasMasterPassword: boolean
  masterPasswordHash?: string
  masterSalt?: string
  vault?: EncryptedVault
  draft?: EncryptedVault
  renewalSchedule: RenewalScheduleItem[]
}

export interface LoadedVaultData {
  entries: PasswordEntry[]
  draft: PasswordDraft | null
}

interface DecryptedDraft {
  value: PasswordDraft | null
  shouldClear: boolean
}

function isEncryptedVault(value: unknown): value is EncryptedVault {
  if (!value || typeof value !== 'object') return false
  const vault = value as Partial<EncryptedVault>
  return typeof vault.salt === 'string' && typeof vault.iv === 'string' && typeof vault.data === 'string'
}

function readRenewalSchedule(value: unknown): RenewalScheduleItem[] {
  return Array.isArray(value) ? value as RenewalScheduleItem[] : []
}

export async function readVaultSnapshot(): Promise<VaultSnapshot> {
  const result = await chrome.storage.local.get([
    HASH_KEY,
    SALT_KEY,
    VAULT_KEY,
    DRAFT_KEY,
    RENEWAL_SCHEDULE_KEY,
  ])

  return {
    hasMasterPassword: HASH_KEY in result,
    masterPasswordHash: typeof result[HASH_KEY] === 'string' ? result[HASH_KEY] : undefined,
    masterSalt: typeof result[SALT_KEY] === 'string' ? result[SALT_KEY] : undefined,
    vault: isEncryptedVault(result[VAULT_KEY]) ? result[VAULT_KEY] : undefined,
    draft: isEncryptedVault(result[DRAFT_KEY]) ? result[DRAFT_KEY] : undefined,
    renewalSchedule: readRenewalSchedule(result[RENEWAL_SCHEDULE_KEY]),
  }
}

export async function isMasterPasswordSet(): Promise<boolean> {
  const result = await chrome.storage.local.get(HASH_KEY)
  return HASH_KEY in result
}

export async function verifyMasterPassword(password: string): Promise<boolean> {
  const result = await chrome.storage.local.get([HASH_KEY, SALT_KEY])
  if (!(HASH_KEY in result) || !(SALT_KEY in result)) return false

  const hash = await hashPassword(password + result[SALT_KEY])
  return hash === result[HASH_KEY]
}

export async function setMasterPassword(password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16)).join('')
  const hash = await hashPassword(password + salt)
  await chrome.storage.local.set({
    [HASH_KEY]: hash,
    [SALT_KEY]: salt,
  })
}

export async function verifyOrSetMasterPassword(
  password: string,
  snapshot: VaultSnapshot
): Promise<boolean> {
  if (!snapshot.hasMasterPassword) {
    await setMasterPassword(password)
    return true
  }

  if (!snapshot.masterPasswordHash || !snapshot.masterSalt) return false
  const hash = await hashPassword(password + snapshot.masterSalt)
  return hash === snapshot.masterPasswordHash
}

async function decryptEntries(
  vault: EncryptedVault | undefined,
  masterPassword: string
): Promise<PasswordEntry[]> {
  if (!vault) return []

  try {
    return JSON.parse(await decryptVault(vault, masterPassword)) as PasswordEntry[]
  } catch {
    throw new Error('Failed to decrypt vault. Incorrect master password.')
  }
}

async function decryptDraftValue(
  draft: EncryptedVault | undefined,
  masterPassword: string
): Promise<DecryptedDraft> {
  if (!draft) return { value: null, shouldClear: false }

  try {
    return {
      value: JSON.parse(await decryptVault(draft, masterPassword)) as PasswordDraft,
      shouldClear: false,
    }
  } catch {
    return { value: null, shouldClear: true }
  }
}

async function decryptDraft(
  draft: EncryptedVault | undefined,
  masterPassword: string
): Promise<PasswordDraft | null> {
  const result = await decryptDraftValue(draft, masterPassword)
  if (result.shouldClear) await chrome.storage.local.remove(DRAFT_KEY)
  return result.value
}

export async function loadVaultSnapshot(
  snapshot: VaultSnapshot,
  masterPassword: string
): Promise<LoadedVaultData> {
  const [entries, decryptedDraft] = await Promise.all([
    decryptEntries(snapshot.vault, masterPassword),
    decryptDraftValue(snapshot.draft, masterPassword),
  ])
  if (decryptedDraft.shouldClear) await chrome.storage.local.remove(DRAFT_KEY)
  await syncRenewalSchedule(entries, snapshot.renewalSchedule)
  return { entries, draft: decryptedDraft.value }
}

export async function loadVault(
  masterPassword: string
): Promise<PasswordEntry[]> {
  const result = await chrome.storage.local.get(VAULT_KEY)
  return decryptEntries(
    isEncryptedVault(result[VAULT_KEY]) ? result[VAULT_KEY] : undefined,
    masterPassword
  )
}

export async function saveVault(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<void> {
  const plaintext = JSON.stringify(entries)
  const encrypted = await encryptVault(plaintext, masterPassword)
  await chrome.storage.local.set({ [VAULT_KEY]: encrypted })
}

export async function loadDraft(masterPassword: string): Promise<PasswordDraft | null> {
  const result = await chrome.storage.local.get(DRAFT_KEY)
  return decryptDraft(
    isEncryptedVault(result[DRAFT_KEY]) ? result[DRAFT_KEY] : undefined,
    masterPassword
  )
}

export async function saveDraft(draft: PasswordDraft, masterPassword: string) {
  const encrypted = await encryptVault(JSON.stringify(draft), masterPassword)
  await chrome.storage.local.set({ [DRAFT_KEY]: encrypted })
}

export async function clearDraft() {
  await chrome.storage.local.remove(DRAFT_KEY)
}

function schedulesMatch(current: RenewalScheduleItem[], next: RenewalScheduleItem[]) {
  return current.length === next.length && current.every((item, index) => {
    const candidate = next[index]
    return item.entryId === candidate.entryId &&
      item.dueOn === candidate.dueOn &&
      item.advanceNotifiedFor === candidate.advanceNotifiedFor &&
      item.dueNotifiedFor === candidate.dueNotifiedFor
  })
}

export async function syncRenewalSchedule(
  entries: PasswordEntry[],
  currentSchedule?: RenewalScheduleItem[]
) {
  const current = currentSchedule ?? readRenewalSchedule(
    (await chrome.storage.local.get(RENEWAL_SCHEDULE_KEY))[RENEWAL_SCHEDULE_KEY]
  )

  const schedule = entries.flatMap((entry) => {
    if (!entry.passwordChangedOn) return []
    const dueOn = addCalendarMonths(
      entry.passwordChangedOn,
      entry.renewalIntervalMonths || DEFAULT_RENEWAL_MONTHS
    )
    const previous = current.find((item) => item.entryId === entry.id && item.dueOn === dueOn)
    return [{
      entryId: entry.id,
      dueOn,
      advanceNotifiedFor: previous?.advanceNotifiedFor,
      dueNotifiedFor: previous?.dueNotifiedFor,
    }]
  })

  if (!schedulesMatch(current, schedule)) {
    await chrome.storage.local.set({ [RENEWAL_SCHEDULE_KEY]: schedule })
  }
}

export async function persistVault(entries: PasswordEntry[], masterPassword: string) {
  await Promise.all([
    saveVault(entries, masterPassword),
    syncRenewalSchedule(entries),
  ])
}

export async function addEntry(
  entry: PasswordEntry,
  masterPassword: string
): Promise<void> {
  const entries = await loadVault(masterPassword)
  entries.push(entry)
  await persistVault(entries, masterPassword)
}

export async function updateEntry(
  id: string,
  updates: Partial<PasswordEntry>,
  masterPassword: string
): Promise<void> {
  const entries = await loadVault(masterPassword)
  const index = entries.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Entry not found')

  entries[index] = { ...entries[index], ...updates, updatedAt: Date.now() }
  await persistVault(entries, masterPassword)
}

export async function deleteEntry(
  id: string,
  masterPassword: string
): Promise<void> {
  const entries = await loadVault(masterPassword)
  const filtered = entries.filter((e) => e.id !== id)
  await persistVault(filtered, masterPassword)
}
