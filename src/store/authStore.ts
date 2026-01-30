import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPb } from '@/lib/pocketbase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const authData = await getPb().collection('users').authWithPassword(email, password)
          set({
            user: authData.record as unknown as User,
            token: authData.token,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          await getPb().collection('users').create({
            email,
            password,
            passwordConfirm: password,
            name,
            role: 'reader',
          })
          // Auto login after registration
          const authData = await getPb().collection('users').authWithPassword(email, password)
          set({
            user: authData.record as unknown as User,
            token: authData.token,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        }
      },

      logout: () => {
        getPb().authStore.clear()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      checkAuth: () => {
        if (getPb().authStore.isValid) {
          set({
            user: getPb().authStore.record as unknown as User,
            token: getPb().authStore.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
