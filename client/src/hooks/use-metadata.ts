import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDepartments() {
  return useQuery({
    queryKey: [api.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.departments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch departments");
      return api.departments.list.responses[200].parse(await res.json());
    },
  });
}

export function useJobRoles() {
  return useQuery({
    queryKey: [api.jobRoles.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobRoles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch job roles");
      return api.jobRoles.list.responses[200].parse(await res.json());
    },
  });
}
