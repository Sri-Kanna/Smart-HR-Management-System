import { pgTable, text, serial, integer, date, varchar, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const jobRoles = pgTable("job_roles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  baseSalary: numeric("base_salary").notNull(),
  deptId: integer("dept_id").references(() => departments.id).notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  dob: date("dob").notNull(),
  roleId: integer("role_id").references(() => jobRoles.id).notNull(),
  skills: text("skills").array(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  empId: integer("emp_id").references(() => employees.id).notNull(),
  date: date("date").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'Present' or 'Absent'
});

export const performance = pgTable("performance", {
  id: serial("id").primaryKey(),
  empId: integer("emp_id").references(() => employees.id).notNull(),
  score: integer("score").notNull(), // 1-10
  reviewDate: date("review_date").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
});

export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  empId: integer("emp_id").references(() => employees.id).notNull(),
  leaveType: varchar("leave_type", { length: 50 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("Pending"),
});

export const companyEvents = pgTable("company_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  eventDate: date("event_date").notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull().default("General"),
});

export const dependents = pgTable("dependents", {
  id: serial("id").primaryKey(),
  empId: integer("emp_id").references(() => employees.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relation: varchar("relation", { length: 255 }).notNull(),
});

// Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  jobRoles: many(jobRoles),
}));

export const jobRolesRelations = relations(jobRoles, ({ one, many }) => ({
  department: one(departments, {
    fields: [jobRoles.deptId],
    references: [departments.id],
  }),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  jobRole: one(jobRoles, {
    fields: [employees.roleId],
    references: [jobRoles.id],
  }),
  attendances: many(attendance),
  performances: many(performance),
  dependents: many(dependents),
}));

// Schemas
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true });
export const insertCompanyEventSchema = createInsertSchema(companyEvents).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertJobRoleSchema = createInsertSchema(jobRoles);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertPerformanceSchema = createInsertSchema(performance);
export const insertDependentSchema = createInsertSchema(dependents);

// Types
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type JobRole = typeof jobRoles.$inferSelect;
export type InsertJobRole = z.infer<typeof insertJobRoleSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Performance = typeof performance.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type CompanyEvent = typeof companyEvents.$inferSelect;
export type InsertCompanyEvent = z.infer<typeof insertCompanyEventSchema>;

export type Dependent = typeof dependents.$inferSelect;
export type InsertDependent = z.infer<typeof insertDependentSchema>;

// Request Types
export type CreateEmployeeRequest = InsertEmployee;
export type UpdateEmployeeRequest = Partial<InsertEmployee>;
export type CreateAttendanceRequest = InsertAttendance;
