import type { AppRole } from "@prisma/client";
import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: {
      id: string;
      email: string;
      displayName: string;
      roles: AppRole[];
    };
  }
}
