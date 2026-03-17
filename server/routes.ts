import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Call seed on startup
  // await storage.seedDatabase();

  app.get(api.employees.list.path, async (req, res) => {
    const data = await storage.getEmployees();
    res.json(data);
  });

  app.get(api.employees.get.path, async (req, res) => {
    const data = await storage.getEmployee(Number(req.params.id));
    if (!data) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(data);
  });

  app.post(api.employees.create.path, async (req, res) => {
    try {
      const input = api.employees.create.input.parse({
        ...req.body,
        roleId: z.coerce.number().parse(req.body.roleId),
      });
      const data = await storage.createEmployee(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.employees.update.path, async (req, res) => {
    try {
      const parsedBody = { ...req.body };
      if (parsedBody.roleId !== undefined) {
        parsedBody.roleId = z.coerce.number().parse(parsedBody.roleId);
      }
      const input = api.employees.update.input.parse(parsedBody);
      const data = await storage.updateEmployee(Number(req.params.id), input);
      res.status(200).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.employees.delete.path, async (req, res) => {
    await storage.deleteEmployee(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.attendance.list.path, async (req, res) => {
    const data = await storage.getAttendances();
    res.json(data);
  });

  app.post(api.attendance.log.path, async (req, res) => {
    try {
      const input = api.attendance.log.input.parse({
        ...req.body,
        empId: z.coerce.number().parse(req.body.empId),
      });
      const data = await storage.logAttendance(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get("/api/events", async (req, res) => {
    const data = await storage.getCompanyEvents();
    res.json(data);
  });

  app.post("/api/events", async (req, res) => {
    try {
      const input = {
        title: z.string().min(1).parse(req.body.title),
        eventDate: z.string().min(1).parse(req.body.eventDate),
        location: z.string().optional().parse(req.body.location),
        description: z.string().optional().parse(req.body.description),
        category: z.string().min(1).parse(req.body.category),
      };
      const data = await storage.createCompanyEvent(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    await storage.deleteCompanyEvent(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/performance", async (req, res) => {
    const data = await storage.getPerformances();
    res.json(data);
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const input = {
        empId: z.coerce.number().parse(req.body.empId),
        score: z.coerce.number().min(1).max(10).parse(req.body.score),
        reviewDate: z.string().min(1).parse(req.body.reviewDate),
        topic: z.string().min(1).parse(req.body.topic),
      };
      const data = await storage.createPerformance(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.analytics.report.path, async (req, res) => {
    const data = await storage.getAnalyticsReport();
    res.json(data);
  });

  app.get(api.departments.list.path, async (req, res) => {
    const data = await storage.getDepartments();
    res.json(data);
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const name = z.string().min(1).parse(req.body.name);
      const data = await storage.createDepartment(name);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    await storage.deleteDepartment(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.jobRoles.list.path, async (req, res) => {
    const data = await storage.getJobRoles();
    res.json(data);
  });

  app.post("/api/job-roles", async (req, res) => {
    try {
      const input = {
        title: z.string().min(1).parse(req.body.title),
        baseSalary: z.string().min(1).parse(req.body.baseSalary),
        deptId: z.coerce.number().parse(req.body.deptId),
      };
      const data = await storage.createJobRole(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put("/api/job-roles/:id", async (req, res) => {
    try {
      const input: { title?: string; baseSalary?: string; deptId?: number } = {};
      if (req.body.title) input.title = z.string().min(1).parse(req.body.title);
      if (req.body.baseSalary) input.baseSalary = z.string().min(1).parse(req.body.baseSalary);
      if (req.body.deptId) input.deptId = z.coerce.number().parse(req.body.deptId);
      const data = await storage.updateJobRole(Number(req.params.id), input);
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/job-roles/:id", async (req, res) => {
    await storage.deleteJobRole(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/leaves", async (req, res) => {
    const data = await storage.getLeaves();
    res.json(data);
  });

  app.post("/api/leaves", async (req, res) => {
    try {
      const input = {
        empId: z.coerce.number().parse(req.body.empId),
        leaveType: z.string().min(1).parse(req.body.leaveType),
        startDate: z.string().min(1).parse(req.body.startDate),
        endDate: z.string().min(1).parse(req.body.endDate),
        reason: z.string().optional().parse(req.body.reason),
        status: "Pending" as const,
      };
      const data = await storage.createLeave(input);
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put("/api/leaves/:id/status", async (req, res) => {
    try {
      const status = z.enum(["Pending", "Approved", "Rejected"]).parse(req.body.status);
      const data = await storage.updateLeaveStatus(Number(req.params.id), status);
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete("/api/leaves/:id", async (req, res) => {
    await storage.deleteLeave(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/payroll-summary", async (req, res) => {
    const data = await storage.getPayrollSummary();
    res.json(data);
  });

  return httpServer;
}
