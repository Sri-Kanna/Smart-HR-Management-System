import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { useJobRoles } from "@/hooks/use-metadata";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const employeeFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  dob: z.string().min(1, "Date of birth is required"),
  roleId: z.coerce.number().min(1, "Role is required"),
  skills: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any | null; // The existing employee if editing
}

export function EmployeeDialog({ open, onOpenChange, employee }: EmployeeDialogProps) {
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const { data: roles, isLoading: rolesLoading } = useJobRoles();

  const isEditing = !!employee;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      dob: "",
      roleId: 0,
      skills: [],
    },
  });

  // Reset form when opened with new data
  useEffect(() => {
    if (open) {
      if (employee) {
        // Format date to YYYY-MM-DD for input type="date"
        const formattedDate = employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "";
        form.reset({
          name: employee.name || "",
          email: employee.email || "",
          dob: formattedDate,
          roleId: employee.roleId || 0,
          skills: employee.skills ? employee.skills.join(", ") : "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          dob: "",
          roleId: 0,
          skills: [],
        });
      }
    }
  }, [open, employee, form]);

  const onSubmit = (data: EmployeeFormValues) => {
    // Skills are already transformed to array by Zod
    if (isEditing && employee) {
      updateMutation.mutate({ id: employee.id, data }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate(data as any, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="p-6 bg-gradient-to-b from-secondary/50 to-background border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              {isEditing ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              {isEditing 
                ? "Update the employee's details below." 
                : "Fill in the details to add a new employee to the system."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="font-semibold text-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="h-11 rounded-xl bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="font-semibold text-foreground">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" className="h-11 rounded-xl bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11 rounded-xl bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-foreground">Job Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl bg-background">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles?.map((role: any) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel className="font-semibold text-foreground">Skills (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="React, TypeScript, Management" className="h-11 rounded-xl bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl h-11 px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
