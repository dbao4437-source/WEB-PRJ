import { create } from 'zustand'
import type { Booking, Tutor, TutorFilters } from '../types'

const initialFilters: TutorFilters = { search: '', subject: '', grade: '', minFee: '', maxFee: '', location: '', teachingMode: '', dayOfWeek: '', timeSlot: '' }
type State = { filters: TutorFilters; tutors: Tutor[]; bookings: Booking[]; loading: boolean; error: string; setFilter: (key: keyof TutorFilters, value: string) => void; resetFilters: () => void; loadTutors: () => Promise<void>; loadBookings: (status?: string) => Promise<void>; setError: (error: string) => void }

export const useTutorStore = create<State>((set, get) => ({
  filters: initialFilters, tutors: [], bookings: [], loading: false, error: '',
  setFilter: (key, value) => set({ filters: { ...get().filters, [key]: value } }),
  resetFilters: () => set({ filters: initialFilters }),
  setError: (error) => set({ error }),
  loadTutors: async () => {
    set({ loading: true, error: '' })
    try {
      const params = new URLSearchParams(Object.entries(get().filters).filter(([, value]) => value.trim()).map(([key, value]) => [key, value.trim()] as [string, string]))
      const { api } = await import('../services/api')
      const result = await api.tutors(params)
      set({ tutors: result.data, loading: false })
    } catch (error) { set({ error: error instanceof Error ? error.message : 'Không tải được danh sách gia sư', loading: false }) }
  },
  loadBookings: async (status = '') => {
    set({ loading: true, error: '' })
    try {
      const { api } = await import('../services/api')
      const result = await api.bookings(status)
      set({ bookings: result.data, loading: false })
    } catch (error) { set({ error: error instanceof Error ? error.message : 'Không tải được yêu cầu', loading: false }) }
  },
}))
