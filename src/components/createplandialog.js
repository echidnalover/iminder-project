import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlanType, CreatePlanInput } from "../utils/types";
import { usePlansStore } from "../utils/store";

interface Props {
  trigger?: React.ReactNode;
}

export function CreatePlanDialog({ trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<PlanType>("work");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const addPlan = usePlansStore((state) => state.addPlan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreatePlanInput = {
      type,
      title,
      description,
    };
    addPlan(input);
    setOpen(false);
    // Reset form
    setType("work");
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create New Plan</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Type</label>
            <Select value={type} onValueChange={(value: PlanType) => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter plan title"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter plan description"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
