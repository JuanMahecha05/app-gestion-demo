import type { FastifyInstance } from "fastify";
import { prisma } from "../infra/prisma.js";

export async function healthRoutes(app: FastifyInstance) {
  const payload = async () => {
    let db: "up" | "down" = "up";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "down";
    }

    return {
      ok: db === "up",
      service: "app-gestion-backend",
      database: db,
      timestamp: new Date().toISOString(),
    };
  };

  app.get("/", async () => {
    return payload();
  });

  app.get("/health", async (_request, reply) => {
    const status = await payload();
    if (!status.ok) {
      return reply.status(503).send(status);
    }

    return status;
  });
}
