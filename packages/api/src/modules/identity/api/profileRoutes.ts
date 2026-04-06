import type { FastifyInstance } from 'fastify';
import { UserRepository } from '../infrastructure/UserRepository.js';
import { authenticate, requireAdmin } from '../../../plugins/authenticate.js';
import type { UpdateProfileInput } from '@cabinconnect/shared';

const repo = new UserRepository();

export async function profileRoutes(app: FastifyInstance) {
  // GET /api/v1/me — get current user profile
  app.get('/me', { preHandler: authenticate }, async (req, reply) => {
    const profile = await repo.findById(req.user!.id);
    if (!profile) return reply.notFound('Profile not found');
    return reply.send({ success: true, data: profile });
  });

  // PATCH /api/v1/me — update display name / locale
  app.patch<{ Body: UpdateProfileInput }>(
    '/me',
    { preHandler: authenticate },
    async (req, reply) => {
      const profile = await repo.update(req.user!.id, req.body);
      return reply.send({ success: true, data: profile });
    }
  );

  // PATCH /api/v1/users/:id/role — admin sets a user's role
  app.patch<{ Params: { id: string }; Body: { role: 'user' | 'supplier' | 'admin' } }>(
    '/users/:id/role',
    { preHandler: requireAdmin },
    async (req, reply) => {
      await repo.setRole(req.params.id, req.body.role);
      return reply.send({ success: true });
    }
  );
}
