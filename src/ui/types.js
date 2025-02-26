export type PlanType = 'work' | 'study' | 'workout' | 'exam';

export interface Plan {
  id: string;
  type: PlanType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  type: PlanType;
  title: string;
  description: string;
}
