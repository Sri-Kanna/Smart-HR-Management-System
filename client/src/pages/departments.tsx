import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Department, JobRole } from "@shared/schema";
import {
  Building2, Briefcase, Plus, Trash2, Pencil, Check, X, DollarSign, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AddDepartmentDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: (n: string) => apiRequest("POST", "/api/departments", { name: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "Department created" });
      setName(""); setOpen(false);
    },
    onError: () => toast({ title: "Failed to create department", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 rounded-xl h-9" data-testid="button-add-department">
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Department</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(name); }} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Department Name *</Label>
            <Input id="dept-name" data-testid="input-dept-name" placeholder="e.g. Engineering" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-department">
            {mutation.isPending ? "Creating..." : "Create Department"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddJobRoleDialog({ departments }: { departments: Department[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", baseSalary: "", deptId: "" });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => apiRequest("POST", "/api/job-roles", { ...d, deptId: Number(d.deptId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-roles"] });
      toast({ title: "Job role created" });
      setForm({ title: "", baseSalary: "", deptId: "" }); setOpen(false);
    },
    onError: () => toast({ title: "Failed to create job role", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 rounded-xl h-9" data-testid="button-add-job-role">
          <Plus className="w-4 h-4" /> Add Job Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New Job Role</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input data-testid="input-role-title" placeholder="e.g. Software Engineer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Base Annual Salary (USD) *</Label>
            <Input data-testid="input-role-salary" type="number" min="0" placeholder="e.g. 120000" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Department *</Label>
            <Select value={form.deptId} onValueChange={v => setForm({ ...form, deptId: v })}>
              <SelectTrigger data-testid="select-role-dept"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending || !form.deptId} data-testid="button-submit-job-role">
            {mutation.isPending ? "Creating..." : "Create Job Role"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditJobRoleDialog({ role, departments, onClose }: { role: JobRole; departments: Department[]; onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: role.title, baseSalary: role.baseSalary, deptId: String(role.deptId) });

  const mutation = useMutation({
    mutationFn: (d: typeof form) => apiRequest("PUT", `/api/job-roles/${role.id}`, { ...d, deptId: Number(d.deptId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-roles"] });
      toast({ title: "Job role updated" });
      onClose();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <Label>Base Annual Salary (USD) *</Label>
        <Input type="number" min="0" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <Label>Department *</Label>
        <Select value={form.deptId} onValueChange={v => setForm({ ...form, deptId: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {departments.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default function Departments() {
  const { toast } = useToast();
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);

  const { data: departments = [], isLoading: deptLoading } = useQuery<Department[]>({ queryKey: ["/api/departments"] });
  const { data: jobRoles = [], isLoading: rolesLoading } = useQuery<JobRole[]>({ queryKey: ["/api/job-roles"] });

  const deleteDept = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-roles"] });
      toast({ title: "Department deleted" });
    },
    onError: () => toast({ title: "Cannot delete — job roles may still be assigned", variant: "destructive" }),
  });

  const deleteRole = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/job-roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-roles"] });
      toast({ title: "Job role deleted" });
    },
    onError: () => toast({ title: "Cannot delete — employees may be assigned to this role", variant: "destructive" }),
  });

  const getDeptName = (deptId: number) => departments.find(d => d.id === deptId)?.name ?? "—";
  const rolesForDept = (deptId: number) => jobRoles.filter(r => r.deptId === deptId).length;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Departments & Job Roles</h1>
        <p className="text-muted-foreground text-lg mt-1">Manage your organization structure. Start by adding departments, then assign job roles.</p>
      </div>

      <Tabs defaultValue="departments">
        <TabsList className="rounded-xl">
          <TabsTrigger value="departments" className="gap-2 rounded-lg" data-testid="tab-departments">
            <Building2 className="w-4 h-4" /> Departments
            <Badge variant="secondary" className="ml-1 h-5 text-xs">{departments.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 rounded-lg" data-testid="tab-roles">
            <Briefcase className="w-4 h-4" /> Job Roles
            <Badge variant="secondary" className="ml-1 h-5 text-xs">{jobRoles.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Departments Tab ── */}
        <TabsContent value="departments" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{departments.length} department{departments.length !== 1 ? "s" : ""} in the organization</p>
            <AddDepartmentDialog />
          </div>

          {deptLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : departments.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center text-muted-foreground">
                <Building2 className="w-10 h-10 opacity-30" />
                <p className="font-medium">No departments yet</p>
                <p className="text-sm">Add your first department to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <Card key={dept.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-dept-${dept.id}`}>
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-base" data-testid={`text-dept-name-${dept.id}`}>{dept.name}</div>
                      <div className="text-sm text-muted-foreground">{rolesForDept(dept.id)} job role{rolesForDept(dept.id) !== 1 ? "s" : ""}</div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg" data-testid={`button-delete-dept-${dept.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{dept.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete the department. This cannot be undone if job roles are still assigned.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteDept.mutate(dept.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Job Roles Tab ── */}
        <TabsContent value="roles" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{jobRoles.length} job role{jobRoles.length !== 1 ? "s" : ""} defined</p>
            {departments.length > 0 ? (
              <AddJobRoleDialog departments={departments} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Add a department first
              </div>
            )}
          </div>

          {rolesLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
          ) : jobRoles.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2 border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center text-muted-foreground">
                <Briefcase className="w-10 h-10 opacity-30" />
                <p className="font-medium">No job roles yet</p>
                <p className="text-sm">Add departments first, then create job roles for them.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/50">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Title</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Department</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Annual Salary</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobRoles.map((role) => (
                    <tr key={role.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors" data-testid={`row-role-${role.id}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-chart-2/10 text-chart-2 flex items-center justify-center shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-foreground">{role.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="rounded-lg">{getDeptName(role.deptId)}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-foreground font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-green-600" />
                          {Number(role.baseSalary).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 justify-end">
                          <Dialog open={editingRole?.id === role.id} onOpenChange={open => !open && setEditingRole(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground" data-testid={`button-edit-role-${role.id}`} onClick={() => setEditingRole(role)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Job Role</DialogTitle></DialogHeader>
                              {editingRole?.id === role.id && <EditJobRoleDialog role={role} departments={departments} onClose={() => setEditingRole(null)} />}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-role-${role.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{role.title}"?</AlertDialogTitle>
                                <AlertDialogDescription>This will delete the job role. Employees assigned to it must be reassigned first.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteRole.mutate(role.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
