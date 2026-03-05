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
  await storage.seedDatabase();

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

  app.get(api.analytics.report.path, async (req, res) => {
    const data = await storage.getAnalyticsReport();
    res.json(data);
  });

  app.get(api.departments.list.path, async (req, res) => {
    const data = await storage.getDepartments();
    res.json(data);
  });

  app.get(api.jobRoles.list.path, async (req, res) => {
    const data = await storage.getJobRoles();
    res.json(data);
  });

  return httpServer;
}
