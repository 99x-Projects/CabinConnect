import type { FastifyInstance } from 'fastify';
import { ToolRepository } from '../infrastructure/ToolRepository.js';
import { authenticate } from '../../../plugins/authenticate.js';
import type { ToolSearchParams, BorrowStatus } from '@cabinconnect/shared';

const repo = new ToolRepository();

export async function toolRoutes(app: FastifyInstance) {
  // GET /api/v1/tools — browse available tools
  app.get<{ Querystring: Partial<ToolSearchParams> }>('/', async (req, reply) => {
    const result = await repo.search({
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
      category: req.query.category,
      resort: req.query.resort,
      availableOnly: req.query.availableOnly !== false,
    });
    return reply.send({ success: true, ...result });
  });

  // GET /api/v1/tools/my-listings — my shared tools + incoming requests
  app.get(
    '/my-listings',
    { preHandler: authenticate },
    async (req, reply) => {
      const [tools, requests] = await Promise.all([
        repo.listByOwner(req.user!.id),
        repo.listRequestsForOwner(req.user!.id),
      ]);
      return reply.send({ success: true, data: { tools, requests } });
    }
  );

  // GET /api/v1/tools/my-requests — my borrow requests
  app.get(
    '/my-requests',
    { preHandler: authenticate },
    async (req, reply) => {
      const requests = await repo.listRequestsByRequester(req.user!.id);
      return reply.send({ success: true, data: requests });
    }
  );

  // GET /api/v1/tools/:id
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const tool = await repo.findById(req.params.id);
    if (!tool) return reply.notFound('Tool not found');
    return reply.send({ success: true, data: tool });
  });

  // POST /api/v1/tools — list a new tool
  app.post(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      const tool = await repo.create(req.user!.id, req.body as any);
      return reply.status(201).send({ success: true, data: tool });
    }
  );

  // PATCH /api/v1/tools/:id — update (owner)
  app.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      const tool = await repo.update(req.params.id, req.user!.id, req.body as any);
      return reply.send({ success: true, data: tool });
    }
  );

  // DELETE /api/v1/tools/:id
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      await repo.delete(req.params.id, req.user!.id);
      return reply.status(204).send();
    }
  );

  // POST /api/v1/tools/:id/request — borrow request
  app.post<{ Params: { id: string }; Body: { startDate: string; endDate: string; message?: string } }>(
    '/:id/request',
    { preHandler: authenticate },
    async (req, reply) => {
      const tool = await repo.findById(req.params.id);
      if (!tool) return reply.notFound('Tool not found');
      if (!tool.available) return reply.conflict('Tool is not available');

      const request = await repo.createRequest({
        toolId: req.params.id,
        requesterId: req.user!.id,
        ownerId: tool.ownerId,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        message: req.body.message,
        status: 'pending',
      });
      return reply.status(201).send({ success: true, data: request });
    }
  );

  // PATCH /api/v1/tools/requests/:id — approve / reject / mark returned
  app.patch<{ Params: { id: string }; Body: { status: BorrowStatus } }>(
    '/requests/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      await repo.updateRequestStatus(req.params.id, req.user!.id, req.body.status);
      return reply.send({ success: true });
    }
  );
}
