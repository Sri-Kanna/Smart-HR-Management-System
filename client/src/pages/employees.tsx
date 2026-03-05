import { useState } from "react";
import { useEmployees, useDeleteEmployee } from "@/hooks/use-employees";
import { EmployeeDialog } from "@/components/employee-dialog";
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search,
  Mail,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const deleteMutation = useDeleteEmployee();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const filteredEmployees = employees?.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.roleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddClick = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete !== null) {
      deleteMutation.mutate(employeeToDelete);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground mt-1">Manage employees, roles, and departments.</p>
        </div>
        <Button 
          onClick={handleAddClick} 
          className="rounded-xl h-11 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 shadow-sm flex-1 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-border/60 bg-secondary/30 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search employees by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background border-border/50 focus-visible:ring-primary/20"
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium ml-auto">
            {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table List */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-xl" />
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-3">
              <Users className="w-12 h-12 text-muted" />
              <p className="text-lg">No employees found.</p>
              {searchTerm && <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0">
              {filteredEmployees.map((emp, index) => (
                <div 
                  key={emp.id} 
                  className={`
                    flex flex-col md:flex-row md:items-center justify-between p-5 gap-4
                    ${index !== filteredEmployees.length - 1 ? 'border-b border-border/40' : ''}
                    hover:bg-secondary/50 transition-colors duration-200
                  `}
                >
                  
                  {/* Basic Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
                      {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{emp.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {emp.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role & Dept */}
                  <div className="flex-1">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {emp.roleTitle || "Unassigned Role"}
                      </div>
                      <Badge variant="outline" className="w-fit text-xs font-medium bg-background text-muted-foreground border-border/80">
                        {emp.departmentName || "No Department"}
                      </Badge>
                    </div>
                  </div>

                  {/* Skills (Hidden on small) */}
                  <div className="hidden lg:flex flex-1 flex-wrap gap-1.5">
                    {emp.skills && emp.skills.length > 0 ? (
                      emp.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No skills listed</span>
                    )}
                    {emp.skills && emp.skills.length > 3 && (
                      <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                        +{emp.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg">
                        <DropdownMenuItem onClick={() => handleEditClick(emp)} className="gap-2 cursor-pointer">
                          <Pencil className="w-4 h-4 text-muted-foreground" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(emp.id)}
                          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EmployeeDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        employee={editingEmployee}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground mt-2">
              This action cannot be undone. This will permanently delete the employee
              from the system and remove their data from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl h-11 px-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
