import type { PasswordEntry, EncryptedVault } from '../types'
import { encryptVault, decryptVault, hashPassword } from './crypto'

const VAULT_KEY = 'password_vault'
const HASH_KEY = 'master_password_hash'
const SALT_KEY = 'master_salt'

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

export async function loadVault(
  masterPassword: string
): Promise<PasswordEntry[]> {
  const result = await chrome.storage.local.get(VAULT_KEY)
  if (!(VAULT_KEY in result)) return []

  try {
    const decrypted = await decryptVault(result[VAULT_KEY], masterPassword)
    return JSON.parse(decrypted) as PasswordEntry[]
  } catch {
    throw new Error('Failed to decrypt vault. Incorrect master password.')
  }
}

export async function saveVault(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<void> {
  const plaintext = JSON.stringify(entries)
  const encrypted = await encryptVault(plaintext, masterPassword)
  await chrome.storage.local.set({ [VAULT_KEY]: encrypted })
}

export async function addEntry(
  entry: PasswordEntry,
  masterPassword: string
): Promise<void> {
  const entries = await loadVault(masterPassword)
  entries.push(entry)
  await saveVault(entries, masterPassword)
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
  await saveVault(entries, masterPassword)
}

export async function deleteEntry(
  id: string,
  masterPassword: string
): Promise<void> {
  const entries = await loadVault(masterPassword)
  const filtered = entries.filter((e) => e.id !== id)
  await saveVault(filtered, masterPassword)
}
