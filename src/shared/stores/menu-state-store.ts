import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MenuStateStore {
  unfoldedMenus: string[]
  toggleMenu: (id: string, isOpen: boolean) => void
}

export const useMenuStateStore = create<MenuStateStore>()(
  persist(
    (set) => ({
      unfoldedMenus: [],
      toggleMenu: (id, isOpen) =>
        set((state) => {
          if (isOpen) {
            return {
              unfoldedMenus: state.unfoldedMenus.includes(id)
                ? state.unfoldedMenus
                : [...state.unfoldedMenus, id],
            }
          } else {
            return {
              unfoldedMenus: state.unfoldedMenus.filter((item) => item !== id),
            }
          }
        }),
    }),
    {
      name: 'sidebar-unfolded',
    }
  )
)
