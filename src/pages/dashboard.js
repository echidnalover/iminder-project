import React from "react";
import { usePlansStore } from "../utils/store";
import { PlanTypeSection } from "../components/PlanTypeSection";
import { Plan } from "../utils/types";
import { SharedContentList } from "../components/SharedContentList";

export default function Dashboard() {
  const { plans, updatePlan, deletePlan } = usePlansStore();

  const handleEditPlan = (plan: Plan) => {
    // TODO: Implement edit functionality
    console.log("Edit plan:", plan);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Plans</h1>
        </div>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
          <PlanTypeSection
            type="work"
            plans={plans}
            onEditPlan={handleEditPlan}
            onDeletePlan={deletePlan}
          />
          <PlanTypeSection
            type="study"
            plans={plans}
            onEditPlan={handleEditPlan}
            onDeletePlan={deletePlan}
          />
          <PlanTypeSection
            type="workout"
            plans={plans}
            onEditPlan={handleEditPlan}
            onDeletePlan={deletePlan}
          />
          <PlanTypeSection
            type="exam"
            plans={plans}
            onEditPlan={handleEditPlan}
            onDeletePlan={deletePlan}
          />
          </div>
          <div className="space-y-8">
            <SharedContentList />
          </div>
        </div>
      </div>
    </div>
  );
}
