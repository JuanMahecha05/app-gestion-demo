import type { FastifyInstance } from "fastify";
import { TimeEntryStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../infra/prisma.js";

const statsQuerySchema = z.object({
  company: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).superRefine((value, ctx) => {
  if (value.from && value.to && value.to < value.from) {
    ctx.addIssue({
      code: "custom",
      path: ["to"],
      message: "to date cannot be before from date",
    });
  }
});

export async function statsRoutes(app: FastifyInstance) {
  app.get("/overview", async (request) => {
    const query = statsQuerySchema.parse(request.query);

    const projects = await prisma.project.findMany({
      where: {
        id: query.projectId || undefined,
        company: query.company ? { equals: query.company, mode: "insensitive" } : undefined,
      },
      include: {
        timeEntries: {
          where: {
            workDate: {
              gte: query.from,
              lte: query.to,
            },
          },
        },
        expenses: {
          where: {
            expenseDate: {
              gte: query.from,
              lte: query.to,
            },
          },
        },
      },
    });

    const byProject = projects.map((project) => {
      const approvedHours = project.timeEntries
        .filter((entry) => entry.status === TimeEntryStatus.APPROVED)
        .reduce((acc, entry) => acc + Number(entry.hours), 0);

      const totalHours = project.timeEntries.reduce((acc, entry) => acc + Number(entry.hours), 0);
      const spent = project.expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
      const budget = Number(project.budget);

      return {
        projectId: project.id,
        projectName: project.name,
        company: project.company,
        currency: project.currency,
        budget,
        spent,
        remainingBudget: budget - spent,
        usedBudgetPercent: budget > 0 ? Number(((spent / budget) * 100).toFixed(2)) : 0,
        totalHours,
        approvedHours,
      };
    });

    return {
      data: {
        projects: byProject,
        totals: {
          budget: byProject.reduce((acc, item) => acc + item.budget, 0),
          spent: byProject.reduce((acc, item) => acc + item.spent, 0),
          totalHours: byProject.reduce((acc, item) => acc + item.totalHours, 0),
          approvedHours: byProject.reduce((acc, item) => acc + item.approvedHours, 0),
        },
      },
    };
  });
}
