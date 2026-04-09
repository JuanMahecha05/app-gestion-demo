import { AppRole } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorize } from "../../auth/guard.js";
import { prisma } from "../../infra/prisma.js";

const projectPayloadSchema = z.object({
  name: z.string().trim().min(1),
  company: z.string().trim().min(1),
  country: z.string().trim().min(1),
  currency: z
    .string()
    .trim()
    .length(3, "currency must be a 3-letter ISO code")
    .transform((value) => value.toUpperCase()),
  budget: z.coerce.number().nonnegative(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  description: z.string().trim().optional(),
});

const listProjectsQuerySchema = z.object({
  company: z.string().trim().optional(),
  country: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

const projectParamsSchema = z.object({ id: z.string().min(1) });

function ensureDateRange(startDate: Date, endDate: Date) {
  if (endDate < startDate) {
    throw new Error("endDate cannot be before startDate");
  }
}

export async function projectsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM, AppRole.CONSULTANT, AppRole.FINANCE, AppRole.VIEWER])],
    },
    async (request) => {
    const query = listProjectsQuerySchema.parse(request.query);

    const projects = await prisma.project.findMany({
      where: {
        company: query.company ? { equals: query.company, mode: "insensitive" } : undefined,
        country: query.country ? { equals: query.country, mode: "insensitive" } : undefined,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: "insensitive" } },
              { company: { contains: query.search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

      return { data: projects };
    },
  );

  app.post(
    "/",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const body = projectPayloadSchema.parse(request.body);

    try {
      ensureDateRange(body.startDate, body.endDate);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        company: body.company,
        country: body.country,
        currency: body.currency,
        budget: body.budget,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
      },
    });

      return reply.status(201).send({ data: project });
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM, AppRole.CONSULTANT, AppRole.FINANCE, AppRole.VIEWER])],
    },
    async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return reply.status(404).send({ message: "Project not found" });
    }

      return { data: project };
    },
  );

  app.put(
    "/:id",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);
    const body = projectPayloadSchema.parse(request.body);

    try {
      ensureDateRange(body.startDate, body.endDate);
    } catch (error) {
      return reply.status(400).send({ message: (error as Error).message });
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Project not found" });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        company: body.company,
        country: body.country,
        currency: body.currency,
        budget: body.budget,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
      },
    });

      return { data: project };
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM])],
    },
    async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ message: "Project not found" });
    }

      await prisma.project.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
