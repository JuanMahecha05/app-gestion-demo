import { resolvePermissions } from "../../auth/roles.js";
import { authenticate } from "../../auth/guard.js";
import type { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const user = request.authUser!;
      return {
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          roles: user.roles,
          permissions: resolvePermissions(user.roles),
        },
      };
    },
  );
}
