import { useState, useEffect } from 'react'

const ONBOARDING_KEY = 'onboarding_completed'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)

  useEffect(() => {
    chrome.storage.local.get(ONBOARDING_KEY).then((result) => {
      setShowOnboarding(!(result[ONBOARDING_KEY] === true))
    })
  }, [])

  const completeOnboarding = () => {
    void chrome.storage.local.set({ [ONBOARDING_KEY]: true })
    setShowOnboarding(false)
  }

  return { showOnboarding, completeOnboarding }
}
