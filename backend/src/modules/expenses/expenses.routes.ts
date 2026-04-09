import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/prisma.js";

const expensePayloadSchema = z.object({
  projectId: z.string().min(1),
  expenseDate: z.coerce.date(),
  category: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  currency: z
    .string()
    .trim()
    .length(3, "currency must be a 3-letter ISO code")
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().optional(),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

export async function expensesRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const expenses = await prisma.expense.findMany({
      include: { project: true },
      orderBy: { expenseDate: "desc" },
    });

    return { data: expenses };
  });

  app.post("/", async (request, reply) => {
    const payload = expensePayloadSchema.parse(request.body);

    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      return reply.status(400).send({ message: "Invalid projectId" });
    }

    const expense = await prisma.expense.create({
      data: payload,
    });

    return reply.status(201).send({ data: expense });
  });

  app.put("/:id", async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const payload = expensePayloadSchema.parse(request.body);

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Expense not found" });
    }

    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      return reply.status(400).send({ message: "Invalid projectId" });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: payload,
    });

    return { data: expense };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Expense not found" });
    }

    await prisma.expense.delete({ where: { id } });
    return reply.status(204).send();
  });
}
