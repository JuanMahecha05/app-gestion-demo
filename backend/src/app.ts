import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env.js";
import { registerRoutes } from "./routes/index.js";

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, "");
}

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
  });

  const allowAllOrigins = env.CORS_ORIGIN.trim() === "*";
  const allowedOrigins = allowAllOrigins
    ? []
    : env.CORS_ORIGIN.split(",").map(normalizeOrigin).filter(Boolean);

  await app.register(cors, {
    origin: (origin, callback) => {
      if (allowAllOrigins || !origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.includes(normalizeOrigin(origin));
      callback(null, isAllowed);
    },
    credentials: true,
  });

  await registerRoutes(app);

  return app;
}
