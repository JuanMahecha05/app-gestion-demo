import { AppRole } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorize } from "../../auth/guard.js";
import { prisma } from "../../infra/prisma.js";

const fxPayloadSchema = z.object({
  baseCode: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  quoteCode: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  rate: z.coerce.number().positive(),
});

export async function fxConfigRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [
        authenticate,
        authorize([AppRole.ADMIN, AppRole.PM, AppRole.CONSULTANT, AppRole.FINANCE, AppRole.VIEWER]),
      ],
    },
    async () => {
      const config = await prisma.fxConfig.findFirst({
        orderBy: { updatedAt: "desc" },
      });

      if (!config) {
        return {
          data: {
            baseCode: "USD",
            quoteCode: "COP",
            rate: 4000,
          },
        };
      }

      return {
        data: {
          id: config.id,
          baseCode: config.baseCode,
          quoteCode: config.quoteCode,
          rate: Number(config.rate),
          updatedAt: config.updatedAt,
        },
      };
    },
  );

  app.put(
    "/",
    {
      preHandler: [authenticate, authorize([AppRole.ADMIN, AppRole.PM, AppRole.FINANCE])],
    },
    async (request) => {
      const payload = fxPayloadSchema.parse(request.body);

      const existing = await prisma.fxConfig.findFirst({ orderBy: { updatedAt: "desc" } });
      if (existing) {
        const config = await prisma.fxConfig.update({
          where: { id: existing.id },
          data: payload,
        });

        return {
          data: {
            id: config.id,
            baseCode: config.baseCode,
            quoteCode: config.quoteCode,
            rate: Number(config.rate),
            updatedAt: config.updatedAt,
          },
        };
      }

      const config = await prisma.fxConfig.create({
        data: payload,
      });

      return {
        data: {
          id: config.id,
          baseCode: config.baseCode,
          quoteCode: config.quoteCode,
          rate: Number(config.rate),
          updatedAt: config.updatedAt,
        },
      };
    },
  );
}
