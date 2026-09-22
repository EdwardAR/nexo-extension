export const VAULT_SESSION_KEY = 'vaultSession'

export interface VaultSession {
  active: boolean
  password: string
}

function isVaultSession(value: unknown): value is VaultSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<VaultSession>
  return session.active === true && typeof session.password === 'string' && session.password.length > 0
}

export async function getVaultSession(): Promise<VaultSession | null> {
  const result = await chrome.storage.session.get(VAULT_SESSION_KEY)
  const session = result[VAULT_SESSION_KEY]
  return isVaultSession(session) ? session : null
}

export async function startVaultSession(password: string) {
  await chrome.storage.session.set({
    [VAULT_SESSION_KEY]: { active: true, password },
  })
}

export async function clearVaultSession() {
  await chrome.storage.session.remove(VAULT_SESSION_KEY)
}
