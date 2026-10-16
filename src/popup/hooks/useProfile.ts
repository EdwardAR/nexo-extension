import { useCallback, useEffect, useState } from 'react'
import { getProfileName, saveProfileName } from '../lib/storage'

export function useProfile() {
  const [profileName, setProfileName] = useState('')

  useEffect(() => {
    let mounted = true

    getProfileName().then((name) => {
      if (mounted) setProfileName(name)
    })

    return () => {
      mounted = false
    }
  }, [])

  const updateProfileName = useCallback(async (name: string) => {
    const savedName = await saveProfileName(name)
    setProfileName(savedName)
    return savedName
  }, [])

  return { profileName, updateProfileName }
}
