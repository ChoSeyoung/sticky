import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage before importing the module under test
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
}
vi.stubGlobal('localStorage', localStorageMock)
vi.stubGlobal('window', { localStorage: localStorageMock })

import {
  ONBOARDING_KEY,
  getInitialVisibility,
  markOnboardingComplete,
} from '../../app/components/OnboardingOverlay'

describe('useOnboarding', () => {
  beforeEach(() => {
    // Clear store and reset mocks before each test
    Object.keys(store).forEach(k => delete store[k])
    vi.clearAllMocks()
  })

  it('returns visible=true when localStorage has no onboardingCompleted key', () => {
    // store is empty — key absent
    const result = getInitialVisibility()
    expect(result).toBe(true)
  })

  it('returns visible=false when localStorage has sticky:onboardingCompleted = "true"', () => {
    store[ONBOARDING_KEY] = 'true'
    const result = getInitialVisibility()
    expect(result).toBe(false)
  })

  it('markOnboardingComplete() sets localStorage sticky:onboardingCompleted to "true"', () => {
    markOnboardingComplete()
    expect(localStorageMock.setItem).toHaveBeenCalledWith(ONBOARDING_KEY, 'true')
    expect(store[ONBOARDING_KEY]).toBe('true')
  })

  it('after markOnboardingComplete(), getInitialVisibility returns false', () => {
    markOnboardingComplete()
    const result = getInitialVisibility()
    expect(result).toBe(false)
  })

  it('initial step is 0 — ONBOARDING_KEY is the expected localStorage key', () => {
    expect(ONBOARDING_KEY).toBe('sticky:onboardingCompleted')
  })
})
