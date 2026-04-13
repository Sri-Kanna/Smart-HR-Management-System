import { db, pool } from "./db";
import { 
  employees, attendance, departments, jobRoles, performance, companyEvents, leaves, users,
  type InsertEmployee, type UpdateEmployeeRequest, type InsertAttendance, type InsertCompanyEvent, type InsertLeave,
  type User,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { AnalyticsReportSchema, EmployeeWithDetailsSchema } from "@shared/routes";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

type EmployeeWithDetails = z.infer<typeof EmployeeWithDetailsSchema>;
type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>;

export interface IStorage {
  getEmployees(): Promise<EmployeeWithDetails[]>;
  getEmployee(id: number): Promise<EmployeeWithDetails | undefined>;
  createEmployee(emp: InsertEmployee): Promise<typeof employees.$inferSelect>;
  updateEmployee(id: number, updates: UpdateEmployeeRequest): Promise<typeof employees.$inferSelect>;
  deleteEmployee(id: number): Promise<void>;
  
  getAttendances(): Promise<typeof attendance.$inferSelect[]>;
  logAttendance(att: InsertAttendance): Promise<typeof attendance.$inferSelect>;
  
  getAnalyticsReport(): Promise<AnalyticsReport[]>;
  
  getPerformances(): Promise<typeof performance.$inferSelect[]>;
  createPerformance(input: { empId: number; score: number; reviewDate: string; topic: string }): Promise<typeof performance.$inferSelect>;
  getCompanyEvents(): Promise<typeof companyEvents.$inferSelect[]>;
  createCompanyEvent(input: InsertCompanyEvent): Promise<typeof companyEvents.$inferSelect>;
  deleteCompanyEvent(id: number): Promise<void>;
  getDepartments(): Promise<typeof departments.$inferSelect[]>;
  createDepartment(name: string): Promise<typeof departments.$inferSelect>;
  deleteDepartment(id: number): Promise<void>;
  getJobRoles(): Promise<typeof jobRoles.$inferSelect[]>;
  createJobRole(input: { title: string; baseSalary: string; deptId: number }): Promise<typeof jobRoles.$inferSelect>;
  updateJobRole(id: number, input: { title?: string; baseSalary?: string; deptId?: number }): Promise<typeof jobRoles.$inferSelect>;
  deleteJobRole(id: number): Promise<void>;
  getLeaves(): Promise<(typeof leaves.$inferSelect & { employeeName: string })[]>;
  createLeave(input: InsertLeave): Promise<typeof leaves.$inferSelect>;
  updateLeaveStatus(id: number, status: string): Promise<typeof leaves.$inferSelect>;
  deleteLeave(id: number): Promise<void>;
  getPayrollSummary(): Promise<{ departmentName: string; headcount: number; totalMonthlyPayroll: number }[]>;

  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(username: string, passwordHash: string): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  countUsers(): Promise<number>;

  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getEmployees(): Promise<EmployeeWithDetails[]> {
    const results = await db
      .select({
        id: employees.id,
        name: employees.name,
        email: employees.email,
        dob: employees.dob,
        roleId: employees.roleId,
        skills: employees.skills,
        roleTitle: jobRoles.title,
        departmentName: departments.name,
        baseSalary: jobRoles.baseSalary
      })
      .from(employees)
      .leftJoin(jobRoles, eq(employees.roleId, jobRoles.id))
      .leftJoin(departments, eq(jobRoles.deptId, departments.id));
      
    return results.map(r => ({
      ...r,
      dob: String(r.dob),
      skills: r.skills || []
    }));
  }

  async getEmployee(id: number): Promise<EmployeeWithDetails | undefined> {
    const results = await db
      .select({
        id: employees.id,
        name: employees.name,
        email: employees.email,
        dob: employees.dob,
        roleId: employees.roleId,
        skills: employees.skills,
        roleTitle: jobRoles.title,
        departmentName: departments.name,
        baseSalary: jobRoles.baseSalary
      })
      .from(employees)
      .leftJoin(jobRoles, eq(employees.roleId, jobRoles.id))
      .leftJoin(departments, eq(jobRoles.deptId, departments.id))
      .where(eq(employees.id, id));
      
    if (!results[0]) return undefined;
    return {
      ...results[0],
      dob: String(results[0].dob),
      skills: results[0].skills || []
    };
  }

  async createEmployee(emp: InsertEmployee): Promise<typeof employees.$inferSelect> {
    const [created] = await db.insert(employees).values(emp).returning();
    return created;
  }

  async updateEmployee(id: number, updates: UpdateEmployeeRequest): Promise<typeof employees.$inferSelect> {
    const [updated] = await db.update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getAttendances(): Promise<typeof attendance.$inferSelect[]> {
    return await db.select().from(attendance);
  }

  async logAttendance(att: InsertAttendance): Promise<typeof attendance.$inferSelect> {
    const [logged] = await db.insert(attendance).values(att).returning();
    return logged;
  }

  async getAnalyticsReport(): Promise<AnalyticsReport[]> {
    const query = sql`
      SELECT 
        d.name AS "departmentName",
        ROUND(AVG(p.score), 2) AS "averagePerformanceScore",
        COUNT(a.id) AS "totalPresentCount"
      FROM departments d
      JOIN job_roles jr ON d.id = jr.dept_id
      JOIN employees e ON jr.id = e.role_id
      LEFT JOIN performance p ON e.id = p.emp_id
      LEFT JOIN attendance a ON e.id = a.emp_id AND a.status = 'Present'
      GROUP BY d.id, d.name
    `;
    
    const { rows } = await db.execute(query);
    return rows.map((r: any) => ({
      departmentName: r.departmentName,
      averagePerformanceScore: String(r.averagePerformanceScore || '0'),
      totalPresentCount: Number(r.totalPresentCount || 0)
    }));
  }

  async getPerformances() {
    return await db.select().from(performance);
  }

  async createPerformance(input: { empId: number; score: number; reviewDate: string; topic: string }) {
    const [created] = await db.insert(performance).values(input).returning();
    return created;
  }

  async getCompanyEvents() {
    return await db.select().from(companyEvents).orderBy(companyEvents.eventDate);
  }

  async createCompanyEvent(input: InsertCompanyEvent) {
    const [created] = await db.insert(companyEvents).values(input).returning();
    return created;
  }

  async deleteCompanyEvent(id: number) {
    await db.delete(companyEvents).where(eq(companyEvents.id, id));
  }

  async getDepartments() {
    return await db.select().from(departments);
  }

  async createDepartment(name: string) {
    const [created] = await db.insert(departments).values({ name }).returning();
    return created;
  }

  async deleteDepartment(id: number) {
    await db.delete(departments).where(eq(departments.id, id));
  }

  async getJobRoles() {
    return await db.select().from(jobRoles);
  }

  async createJobRole(input: { title: string; baseSalary: string; deptId: number }) {
    const [created] = await db.insert(jobRoles).values(input).returning();
    return created;
  }

  async updateJobRole(id: number, input: { title?: string; baseSalary?: string; deptId?: number }) {
    const [updated] = await db.update(jobRoles).set(input).where(eq(jobRoles.id, id)).returning();
    return updated;
  }

  async deleteJobRole(id: number) {
    await db.delete(jobRoles).where(eq(jobRoles.id, id));
  }

  async getLeaves() {
    const result = await db
      .select({
        id: leaves.id,
        empId: leaves.empId,
        leaveType: leaves.leaveType,
        startDate: leaves.startDate,
        endDate: leaves.endDate,
        reason: leaves.reason,
        status: leaves.status,
        employeeName: employees.name,
      })
      .from(leaves)
      .leftJoin(employees, eq(leaves.empId, employees.id))
      .orderBy(leaves.startDate);
    return result.map(r => ({ ...r, employeeName: r.employeeName ?? 'Unknown' }));
  }

  async createLeave(input: InsertLeave) {
    const [created] = await db.insert(leaves).values(input).returning();
    return created;
  }

  async updateLeaveStatus(id: number, status: string) {
    const [updated] = await db.update(leaves).set({ status }).where(eq(leaves.id, id)).returning();
    return updated;
  }

  async deleteLeave(id: number) {
    await db.delete(leaves).where(eq(leaves.id, id));
  }

  async getPayrollSummary() {
    const { rows } = await db.execute(sql`
      SELECT d.name AS "departmentName",
             COUNT(e.id)::int AS headcount,
             COALESCE(SUM(jr.base_salary::numeric), 0)::float AS "totalMonthlyPayroll"
      FROM departments d
      LEFT JOIN job_roles jr ON jr.dept_id = d.id
      LEFT JOIN employees e ON e.role_id = jr.id
      GROUP BY d.id, d.name
      ORDER BY d.name
    `);
    return (rows as any[]).map(r => ({
      departmentName: r.departmentName,
      headcount: Number(r.headcount),
      totalMonthlyPayroll: Number(r.totalMonthlyPayroll),
    }));
  }

  async seedDatabase() {
    const existingDepts = await this.getDepartments();
    if (existingDepts.length === 0) {
      const [hr, engineering] = await db.insert(departments).values([
        { name: 'HR' },
        { name: 'Engineering' }
      ]).returning();

      const [recruiter, dev] = await db.insert(jobRoles).values([
        { title: 'Recruiter', baseSalary: '60000', deptId: hr.id },
        { title: 'Software Engineer', baseSalary: '120000', deptId: engineering.id }
      ]).returning();

      const [emp1, emp2] = await db.insert(employees).values([
        { name: 'Alice Smith', email: 'alice@example.com', dob: '1990-01-01', roleId: recruiter.id, skills: ['Communication'] },
        { name: 'Bob Jones', email: 'bob@example.com', dob: '1992-05-15', roleId: dev.id, skills: ['TypeScript', 'Node.js'] }
      ]).returning();

      await db.insert(attendance).values([
        { empId: emp1.id, date: '2023-10-01', status: 'Present' },
        { empId: emp1.id, date: '2023-10-02', status: 'Present' },
        { empId: emp2.id, date: '2023-10-01', status: 'Present' },
        { empId: emp2.id, date: '2023-10-02', status: 'Absent' },
      ]);

      await db.insert(performance).values([
        { empId: emp1.id, score: 8, reviewDate: '2023-06-01', topic: 'Mid-Year Review' },
        { empId: emp2.id, score: 9, reviewDate: '2023-06-01', topic: 'Mid-Year Review' }
      ]);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(username: string, passwordHash: string): Promise<User> {
    const result = await db.insert(users).values({ username, passwordHash }).returning();
    return result[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async countUsers(): Promise<number> {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    return Number((result as any).rows[0].count);
  }
}

export const storage = new DatabaseStorage();
