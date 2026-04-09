import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/prisma.js";

const forecastPayloadSchema = z.object({
  projectId: z.string().min(1),
  consultantId: z.string().min(1),
  period: z.string().trim().regex(/^\d{4}-Q[1-4]$/, "period must use format YYYY-Qn"),
  hoursProjected: z.coerce.number().positive(),
  hourlyRate: z.coerce.number().nonnegative().optional(),
  note: z.string().trim().optional(),
});

const idParamsSchema = z.object({ id: z.string().min(1) });

export async function forecastsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const forecasts = await prisma.forecast.findMany({
      include: {
        project: true,
        consultant: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = forecasts.map((item) => {
      const effectiveRate = item.hourlyRate ?? item.consultant.hourlyRate ?? 0;
      const projectedCost = Number(item.hoursProjected) * Number(effectiveRate);

      return {
        ...item,
        projectedCost,
      };
    });

    return { data };
  });

  app.post("/", async (request, reply) => {
    const payload = forecastPayloadSchema.parse(request.body);

    const [project, consultant] = await Promise.all([
      prisma.project.findUnique({ where: { id: payload.projectId } }),
      prisma.consultant.findUnique({ where: { id: payload.consultantId } }),
    ]);

    if (!project) {
      return reply.status(400).send({ message: "Invalid projectId" });
    }

    if (!consultant) {
      return reply.status(400).send({ message: "Invalid consultantId" });
    }

    const forecast = await prisma.forecast.create({
      data: payload,
    });

    return reply.status(201).send({ data: forecast });
  });

  app.put("/:id", async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);
    const payload = forecastPayloadSchema.parse(request.body);

    const existing = await prisma.forecast.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Forecast not found" });
    }

    const [project, consultant] = await Promise.all([
      prisma.project.findUnique({ where: { id: payload.projectId } }),
      prisma.consultant.findUnique({ where: { id: payload.consultantId } }),
    ]);

    if (!project) {
      return reply.status(400).send({ message: "Invalid projectId" });
    }

    if (!consultant) {
      return reply.status(400).send({ message: "Invalid consultantId" });
    }

    const forecast = await prisma.forecast.update({
      where: { id },
      data: payload,
    });

    return { data: forecast };
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamsSchema.parse(request.params);

    const existing = await prisma.forecast.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Forecast not found" });
    }

    await prisma.forecast.delete({ where: { id } });
    return reply.status(204).send();
  });
}
