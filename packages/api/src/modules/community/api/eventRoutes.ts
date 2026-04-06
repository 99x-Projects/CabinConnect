import type { FastifyInstance } from 'fastify';
import { EventRepository } from '../infrastructure/EventRepository.js';
import { authenticate, requireAdmin } from '../../../plugins/authenticate.js';
import type { EventSearchParams, CreateEventInput, RSVPStatus } from '@cabinconnect/shared';

const repo = new EventRepository();

export async function eventRoutes(app: FastifyInstance) {
  // GET /api/v1/events — public search
  app.get<{ Querystring: EventSearchParams }>('/', async (req, reply) => {
    const result = await repo.search({
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 20, 100),
      resort: req.query.resort,
      category: req.query.category,
      from: req.query.from,
      to: req.query.to,
      status: req.query.status ?? 'published',
    });
    return reply.send({ success: true, ...result });
  });

  // GET /api/v1/events/:id — public detail
  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const event = await repo.findById(req.params.id);
    if (!event) return reply.notFound('Event not found');
    return reply.send({ success: true, data: event });
  });

  // POST /api/v1/events — create (auth required)
  app.post<{ Body: CreateEventInput }>(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      const event = await repo.create(req.user!.id, req.body);
      return reply.status(201).send({ success: true, data: event });
    }
  );

  // PATCH /api/v1/events/:id — update (organizer only)
  app.patch<{ Params: { id: string }; Body: Partial<CreateEventInput> }>(
    '/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      const event = await repo.update(req.params.id, req.user!.id, req.body);
      return reply.send({ success: true, data: event });
    }
  );

  // PATCH /api/v1/events/:id/status — publish/cancel (organizer or admin)
  app.patch<{ Params: { id: string }; Body: { status: CabinEvent['status'] } }>(
    '/:id/status',
    { preHandler: authenticate },
    async (req, reply) => {
      await repo.setStatus(req.params.id, (req.body as { status: 'published' | 'cancelled' | 'draft' }).status);
      return reply.send({ success: true });
    }
  );

  // POST /api/v1/events/:id/rsvp — RSVP (auth required)
  app.post<{ Params: { id: string }; Body: { status: RSVPStatus } }>(
    '/:id/rsvp',
    { preHandler: authenticate },
    async (req, reply) => {
      const rsvp = await repo.upsertRSVP(req.params.id, req.user!.id, req.body.status);
      return reply.send({ success: true, data: rsvp });
    }
  );

  // DELETE /api/v1/events/:id/rsvp — remove RSVP
  app.delete<{ Params: { id: string } }>(
    '/:id/rsvp',
    { preHandler: authenticate },
    async (req, reply) => {
      await repo.removeRSVP(req.params.id, req.user!.id);
      return reply.status(204).send();
    }
  );
}

// local type reference
type CabinEvent = import('@cabinconnect/shared').CabinEvent;
