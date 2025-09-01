import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface VetFormValues {
  name: string;
  clinicName?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  imageUrl?: string;
}

interface VetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: VetFormValues;
  onSubmit: (values: VetFormValues) => void;
  loading?: boolean;
  title: string;
}

export function VetFormDialog({ open, onOpenChange, initialValues, onSubmit, loading, title }: VetFormDialogProps) {
  const { register, handleSubmit, reset } = useForm<VetFormValues>({
    defaultValues: initialValues || {
      name: "",
      clinicName: "",
      specialty: "",
      phone: "",
      email: "",
      address: "",
      imageUrl: "",
    },
  });

  // Reset form when dialog opens/closes or initialValues change
  React.useEffect(() => {
    reset(initialValues || {
      name: "",
      clinicName: "",
      specialty: "",
      phone: "",
      email: "",
      address: "",
      imageUrl: "",
    });
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill out the vet's details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} required />
          </div>
          <div>
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input id="clinicName" {...register("clinicName")} />
          </div>
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" {...register("specialty")} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} />
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" {...register("imageUrl")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
