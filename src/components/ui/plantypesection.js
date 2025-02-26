import React from "react";
import { PlanType, Plan } from "../utils/types";
import { PlanCard } from "./PlanCard";
import { CreatePlanDialog } from "./CreatePlanDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  type: PlanType;
  plans: Plan[];
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => void;
}

export function PlanTypeSection({ type, plans, onEditPlan, onDeletePlan }: Props) {
  const filteredPlans = plans.filter((plan) => plan.type === type);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{type} Plans</h2>
        <CreatePlanDialog
          trigger={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New {type} Plan
            </Button>
          }
        />
      </div>
      {filteredPlans.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No {type} plans yet. Create your first one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={onEditPlan}
              onDelete={onDeletePlan}
            />
          ))})
        </div>
      )}
    </div>
  );
}
