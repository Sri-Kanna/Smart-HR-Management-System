import { db, pool } from "./db";
import { 
  employees, attendance, departments, jobRoles, performance, companyEvents,
  type InsertEmployee, type UpdateEmployeeRequest, type InsertAttendance, type InsertCompanyEvent,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { AnalyticsReportSchema, EmployeeWithDetailsSchema } from "@shared/routes";
import { z } from "zod";

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
  getJobRoles(): Promise<typeof jobRoles.$inferSelect[]>;
  
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
        departmentName: departments.name
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
        departmentName: departments.name
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

  async getJobRoles() {
    return await db.select().from(jobRoles);
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
}

export const storage = new DatabaseStorage();
