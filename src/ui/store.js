import { create } from 'zustand';
import { Plan, CreatePlanInput } from './types';

interface PlansState {
  plans: Plan[];
  addPlan: (input: CreatePlanInput) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  addPlan: (input: CreatePlanInput) => {
    const newPlan: Plan = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ plans: [...state.plans, newPlan] }));
  },
  updatePlan: (id: string, updates: Partial<Plan>) => {
    set((state) => ({
      plans: state.plans.map((plan) =>
        plan.id === id
          ? { ...plan, ...updates, updatedAt: new Date().toISOString() }
          : plan
      ),
    }));
  },
  deletePlan: (id: string) => {
    set((state) => ({ plans: state.plans.filter((plan) => plan.id !== id) }));
  },
}));
