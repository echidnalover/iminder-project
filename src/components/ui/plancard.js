import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plan } from "../utils/types";

interface Props {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, onEdit, onDelete }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.title}</span>
          <span className="text-sm text-muted-foreground capitalize">{plan.type}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{plan.description}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(plan.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
