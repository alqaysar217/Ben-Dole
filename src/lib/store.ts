
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "SUPERVISOR" | "EMPLOYEE";

interface UIState {
  selectedDepartmentId: string | null;
  selectedEmployeeId: string | null;
  userRole: Role | null;
  setSelectedDepartmentId: (id: string | null) => void;
  setSelectedEmployeeId: (id: string | null) => void;
  setUserRole: (role: Role | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedDepartmentId: null,
      selectedEmployeeId: null,
      userRole: null,
      setSelectedDepartmentId: (id) => set({ selectedDepartmentId: id }),
      setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
      setUserRole: (role) => set({ userRole: role }),
    }),
    {
      name: "bank-talabat-ui-storage",
    }
  )
);
