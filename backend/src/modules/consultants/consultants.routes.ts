import { AppRole } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorize } from "../../auth/guard.js";
import { prisma } from "../../infra/prisma.js";

const consultantPayloadSchema = z.object({
  fullName: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  role: z.string().trim().min(1),
  hourlyRate: z.coerce.number().nonnegative().optional(),
  rateCurrency: z.string().trim().toUpperCase().length(3).default("USD"),
  country: z.string().trim().optional(),
  costPerMonth: z.coerce.number().nonnegative().optional(),
  active: z.coerce.boolean().default(true),
});

const consultantParamsSchema = z.object({ id: z.string().min(1) });

export async function consultantsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM, AppRole.CONSULTANT, AppRole.FINANCE, AppRole.VIEWER])],
    },
    async () => {
    const consultants = await prisma.consultant.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { data: consultants };
    },
  );

  app.post(
    "/",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const payload = consultantPayloadSchema.parse(request.body);

    const consultant = await prisma.consultant.create({
      data: {
        fullName: payload.fullName,
        email: payload.email || null,
        role: payload.role,
        hourlyRate: payload.hourlyRate,
        rateCurrency: payload.rateCurrency,
        country: payload.country,
        costPerMonth: payload.costPerMonth,
        active: payload.active,
      },
    });

      return reply.status(201).send({ data: consultant });
    },
  );

  app.put(
    "/:id",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const { id } = consultantParamsSchema.parse(request.params);
    const payload = consultantPayloadSchema.parse(request.body);

    const existing = await prisma.consultant.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Consultant not found" });
    }

    const consultant = await prisma.consultant.update({
      where: { id },
      data: {
        fullName: payload.fullName,
        email: payload.email || null,
        role: payload.role,
        hourlyRate: payload.hourlyRate,
        rateCurrency: payload.rateCurrency,
        country: payload.country,
        costPerMonth: payload.costPerMonth,
        active: payload.active,
      },
    });

      return { data: consultant };
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const { id } = consultantParamsSchema.parse(request.params);

    const existing = await prisma.consultant.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Consultant not found" });
    }

    const linkedTimeEntries = await prisma.timeEntry.count({ where: { consultantId: id } });
    const linkedForecasts = await prisma.forecast.count({ where: { consultantId: id } });
    const linkedAssignments = await prisma.assignment.count({ where: { consultantId: id } });

    if (linkedTimeEntries > 0 || linkedForecasts > 0 || linkedAssignments > 0) {
      return reply
        .status(409)
        .send({ message: "Cannot delete consultant with related time entries, forecasts or assignments" });
    }

    try {
      await prisma.consultant.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "P2003" || code === "P2014") {
        return reply.status(409).send({ message: "Cannot delete consultant: it has related records" });
      }
      throw err;
    }
    },
  );

  app.delete(
    "/by-name",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
      const { name } = z.object({ name: z.string().trim().min(1) }).parse(request.query);

      const existing = await prisma.consultant.findFirst({
        where: { fullName: { equals: name, mode: "insensitive" } },
      });
      if (!existing) {
        return reply.status(404).send({ message: "Consultant not found" });
      }

      const { id } = existing;

      const linkedTimeEntries = await prisma.timeEntry.count({ where: { consultantId: id } });
      const linkedForecasts = await prisma.forecast.count({ where: { consultantId: id } });
      const linkedAssignments = await prisma.assignment.count({ where: { consultantId: id } });

      if (linkedTimeEntries > 0 || linkedForecasts > 0 || linkedAssignments > 0) {
        return reply
          .status(409)
          .send({ message: "Cannot delete consultant with related time entries, forecasts or assignments" });
      }

      try {
        await prisma.consultant.delete({ where: { id } });
        return reply.status(204).send();
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2003" || code === "P2014") {
          return reply.status(409).send({ message: "Cannot delete consultant: it has related records" });
        }
        throw err;
      }
    },
  );
  app.delete(
    "/by-name",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
      const { name } = z.object({ name: z.string().trim().min(1) }).parse(request.query);

      const existing = await prisma.consultant.findFirst({
        where: { fullName: { equals: name, mode: "insensitive" } },
      });
      if (!existing) {
        return reply.status(404).send({ message: "Consultant not found" });
      }

      const { id } = existing;

      const linkedTimeEntries = await prisma.timeEntry.count({ where: { consultantId: id } });
      const linkedForecasts = await prisma.forecast.count({ where: { consultantId: id } });
      const linkedAssignments = await prisma.assignment.count({ where: { consultantId: id } });

      if (linkedTimeEntries > 0 || linkedForecasts > 0 || linkedAssignments > 0) {
        return reply
          .status(409)
          .send({ message: "Cannot delete consultant with related time entries, forecasts or assignments" });
      }

      try {
        await prisma.consultant.delete({ where: { id } });
        return reply.status(204).send();
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2003" || code === "P2014") {
          return reply.status(409).send({ message: "Cannot delete consultant: it has related records" });
        }
        throw err;
      }
    },
  );
}
