import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useLogAttendance } from "@/hooks/use-attendance";
import { 
  CalendarCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Attendance() {
  const { data: employees, isLoading } = useEmployees();
  const logMutation = useLogAttendance();
  
  // Default to today
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Keep track of visually logged statuses before refetch
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>({});

  const handleLog = (empId: number, status: 'Present' | 'Absent') => {
    logMutation.mutate({
      empId,
      date: selectedDate,
      status
    }, {
      onSuccess: () => {
        setLocalStatuses(prev => ({ ...prev, [empId]: status }));
      }
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Daily Attendance</h1>
          <p className="text-muted-foreground mt-2 text-lg">Record employee presence for the selected date.</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" /> Log Date
          </label>
          <Input 
            type="date" 
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setLocalStatuses({}); // Reset local visual state on date change
            }}
            className="w-full md:w-48 h-12 rounded-xl bg-card border-border/80 shadow-sm focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden flex-1">
        
        <div className="p-4 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
          <div className="font-semibold text-foreground">Employee List</div>
          <Badge variant="outline" className="bg-background">
            {format(new Date(selectedDate), 'EEEE, MMM do, yyyy')}
          </Badge>
        </div>

        <div className="p-2 sm:p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-full h-16 rounded-xl" />
              ))}
            </div>
          ) : employees?.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
              <p>No employees found. Add employees first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {employees?.map((emp) => {
                const currentStatus = localStatuses[emp.id];
                
                return (
                  <Card key={emp.id} className={`rounded-xl border-border/50 shadow-sm transition-all duration-200 hover:shadow-md ${currentStatus === 'Present' ? 'bg-green-50/30 border-green-100' : currentStatus === 'Absent' ? 'bg-red-50/30 border-red-100' : ''}`}>
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-secondary-foreground">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{emp.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{emp.departmentName || "Unassigned"}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span>{emp.roleTitle || "No Role"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant={currentStatus === 'Present' ? "default" : "outline"}
                          className={`flex-1 sm:flex-none h-10 rounded-lg transition-colors ${currentStatus === 'Present' ? 'bg-green-600 hover:bg-green-700 text-white border-transparent' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-200'}`}
                          onClick={() => handleLog(emp.id, 'Present')}
                          disabled={logMutation.isPending}
                        >
                          <CheckCircle2 className={`w-4 h-4 mr-2 ${currentStatus === 'Present' ? '' : 'text-green-600'}`} />
                          Present
                        </Button>
                        <Button
                          variant={currentStatus === 'Absent' ? "destructive" : "outline"}
                          className={`flex-1 sm:flex-none h-10 rounded-lg transition-colors ${currentStatus === 'Absent' ? '' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-200'}`}
                          onClick={() => handleLog(emp.id, 'Absent')}
                          disabled={logMutation.isPending}
                        >
                          <XCircle className={`w-4 h-4 mr-2 ${currentStatus === 'Absent' ? '' : 'text-red-600'}`} />
                          Absent
                        </Button>
                      </div>
                      
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
