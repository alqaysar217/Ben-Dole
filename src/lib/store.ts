"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "SUPERVISOR" | "EMPLOYEE";

interface UIState {
  selectedDepartmentId: string | null;
  selectedEmployeeId: string | null;
  setSelectedDepartmentId: (id: string | null) => void;
  setSelectedEmployeeId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedDepartmentId: null,
      selectedEmployeeId: null,
      setSelectedDepartmentId: (id) => set({ selectedDepartmentId: id }),
      setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
    }),
    {
      name: "bank-talabat-ui-storage",
    }
  )
);