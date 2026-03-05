import { z } from 'zod';
import { 
  insertEmployeeSchema, employees, 
  insertAttendanceSchema, attendance,
  departments, jobRoles
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Joined types for responses
export const EmployeeWithDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  dob: z.string(),
  roleId: z.number(),
  skills: z.array(z.string()).nullable(),
  roleTitle: z.string().optional(),
  departmentName: z.string().optional(),
});

export const AnalyticsReportSchema = z.object({
  departmentName: z.string(),
  averagePerformanceScore: z.string(),
  totalPresentCount: z.number(),
});

export const api = {
  employees: {
    list: {
      method: 'GET' as const,
      path: '/api/employees' as const,
      responses: {
        200: z.array(EmployeeWithDetailsSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/employees/:id' as const,
      responses: {
        200: EmployeeWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/employees' as const,
      input: insertEmployeeSchema.omit({ id: true }),
      responses: {
        201: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/employees/:id' as const,
      input: insertEmployeeSchema.omit({ id: true }).partial(),
      responses: {
        200: z.custom<typeof employees.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/employees/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance' as const,
      responses: {
        200: z.array(z.custom<typeof attendance.$inferSelect>()),
      },
    },
    log: {
      method: 'POST' as const,
      path: '/api/attendance' as const,
      input: insertAttendanceSchema.omit({ id: true }),
      responses: {
        201: z.custom<typeof attendance.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  analytics: {
    report: {
      method: 'GET' as const,
      path: '/api/analytics/report' as const,
      responses: {
        200: z.array(AnalyticsReportSchema),
      },
    }
  },
  departments: {
    list: {
      method: 'GET' as const,
      path: '/api/departments' as const,
      responses: {
        200: z.array(z.custom<typeof departments.$inferSelect>()),
      }
    }
  },
  jobRoles: {
    list: {
      method: 'GET' as const,
      path: '/api/job-roles' as const,
      responses: {
        200: z.array(z.custom<typeof jobRoles.$inferSelect>()),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
