
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "SUPERVISOR" | "EMPLOYEE";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: "Sandwiches" | "Add-ons" | "Drinks";
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  employeeName: string;
  items: OrderItem[];
  total: number;
  timestamp: number;
  status: "pending" | "completed";
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  deliveryDone: boolean;
  isEligible: boolean;
}

interface AppState {
  role: Role;
  currentUser: string | null;
  menu: MenuItem[];
  employees: Employee[];
  orders: Order[];
  currentRotationIndex: number;
  
  setRole: (role: Role) => void;
  setCurrentUser: (name: string | null) => void;
  
  addMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;
  
  addOrder: (order: Order) => void;
  clearOrders: () => void;
  
  markDeliveryDone: (employeeId: string) => void;
  skipDelivery: () => void;
  resetRotation: () => void;
}

const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'شيبس سادة', price: 400, category: 'Sandwiches' },
  { id: '2', name: 'شيبس بيض', price: 600, category: 'Sandwiches' },
  { id: '3', name: 'شيبس بيض جبن', price: 700, category: 'Sandwiches' },
  { id: '4', name: 'شيبس جبن', price: 500, category: 'Sandwiches' },
  { id: '5', name: 'بيض جبن', price: 500, category: 'Sandwiches' },
  { id: '6', name: 'مربى جبن', price: 400, category: 'Sandwiches' },
  { id: '7', name: 'مربى سادة', price: 300, category: 'Sandwiches' },
  { id: '8', name: 'بيض سادة', price: 400, category: 'Sandwiches' },
  { id: '9', name: 'جبن سادة', price: 300, category: 'Sandwiches' },
  { id: '10', name: 'بيض مسلوق (بدون خبز)', price: 200, category: 'Add-ons' },
  { id: '11', name: 'عصير ليمون', price: 300, category: 'Drinks' },
  { id: '12', name: 'ماء بارد', price: 200, category: 'Drinks' },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'أحمد علي', department: 'IT', deliveryDone: false, isEligible: true },
  { id: 'e2', name: 'محمد سالم', department: 'IT', deliveryDone: false, isEligible: true },
  { id: 'e3', name: 'سارة عبدالله', department: 'IT', deliveryDone: false, isEligible: true },
  { id: 'e4', name: 'خالد عمر', department: 'IT', deliveryDone: false, isEligible: true },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "EMPLOYEE",
      currentUser: null,
      menu: INITIAL_MENU,
      employees: INITIAL_EMPLOYEES,
      orders: [],
      currentRotationIndex: 0,

      setRole: (role) => set({ role }),
      setCurrentUser: (currentUser) => set({ currentUser }),

      addMenuItem: (item) => set((state) => ({ menu: [...state.menu, item] })),
      removeMenuItem: (id) => set((state) => ({ menu: state.menu.filter(i => i.id !== id) })),

      addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
      clearOrders: () => set({ orders: [] }),

      markDeliveryDone: (id) => set((state) => {
        const updatedEmployees = state.employees.map(e => e.id === id ? { ...e, deliveryDone: true } : e);
        const allDone = updatedEmployees.every(e => !e.isEligible || e.deliveryDone);
        if (allDone) {
            return { employees: updatedEmployees.map(e => ({...e, deliveryDone: false})), currentRotationIndex: 0 };
        }
        return { employees: updatedEmployees };
      }),

      skipDelivery: () => set((state) => ({
        currentRotationIndex: (state.currentRotationIndex + 1) % state.employees.filter(e => e.isEligible).length
      })),

      resetRotation: () => set({ currentRotationIndex: 0, employees: INITIAL_EMPLOYEES }),
    }),
    {
      name: "bank-talabat-storage",
    }
  )
);
